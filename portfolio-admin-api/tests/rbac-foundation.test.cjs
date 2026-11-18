// Run against a temporary tsc output with RBAC_BUILD_DIR set.
const assert = require("node:assert/strict");
const { readFileSync, realpathSync } = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");

assert.ok(process.env.RBAC_BUILD_DIR, "Set RBAC_BUILD_DIR to an isolated tsc output directory");
const build = realpathSync(process.env.RBAC_BUILD_DIR);
const db = {};
const dbPath = path.join(build, "db/db.js");
require.cache[dbPath] = { id: dbPath, filename: dbPath, loaded: true, exports: { db } };

const { requireAccountAccess } = require(path.join(build, "rbac/account-access.middleware.js"));
const { mutateAdminUserStatus, updateAdminUser, updateAdminUserPassword, insertAdminUser } =
  require(path.join(build, "users/users.repository.js"));
const { saveRole, deleteRole, listRoles } = require(path.join(build, "rbac/roles.repository.js"));

const { PERMISSION_CATALOG, PERMISSION_CODES } = require(path.join(build, "rbac/permission-catalog.js"));

const profile = { firstName: "Test", lastName: "Account", email: "test@example.invalid" };

test("account guard checks live identity and the union of current permissions", async () => {
  let rows = [];
  let lookups = 0;
  db.execute = async (_sql, params) => {
    lookups++;
    assert.deepEqual(params, ["8"]);
    return [rows];
  };

  async function check(id, permission, options) {
    const result = { locals: {}, statusCode: 200, allowed: false };
    const res = {
      locals: result.locals,
      status(code) {
        result.statusCode = code;
        return this;
      },
      json() {},
    };
    const session = id === undefined ? {} : { adminUser: { id, firstName: "Stale" } };
    await requireAccountAccess(permission, options)({ session }, res, () => { result.allowed = true; });
    return result;
  }

  assert.equal((await check(undefined, "users.read")).statusCode, 401);
  assert.equal((await check(Number.MAX_SAFE_INTEGER + 1, "users.read")).statusCode, 401);
  assert.equal(lookups, 0);
  assert.equal((await check(8, "users.read")).statusCode, 401);
  rows = [{ ...profile, roleCode: null, permissionCode: null }];
  assert.equal((await check(8, "users.read")).statusCode, 403);
  assert.deepEqual((await check(8)).locals.accountAccess, {
    user: { id: 8, ...profile }, roles: [], permissions: [],
  });

  rows = [
    { ...profile, roleCode: "editor", permissionCode: "users.update" },
    { ...profile, roleCode: "reader", permissionCode: "users.read" },
    { ...profile, roleCode: "reader", permissionCode: "users.update" },
  ];
  const allowed = await check(8, "users.update");
  assert.ok(allowed.allowed);
  assert.deepEqual(allowed.locals.accountAccess, {
    user: { id: 8, ...profile },
    roles: ["editor", "reader"],
    permissions: ["users.read", "users.update"],
  });
  rows.shift();
  rows.pop();
  assert.equal((await check(8, "users.update")).statusCode, 403);

  rows = [{ ...profile, roleCode: "operator", permissionCode: "rgpd.write" }];
  assert.ok((await check(8, "rgpd.write")).allowed);
  assert.equal((await check(8, "rgpd.read")).statusCode, 403);
  assert.equal((await check(8, "rgpd.write", { admin: true })).statusCode, 403);
  rows = [{ ...profile, roleCode: "admin", permissionCode: null }];
  assert.ok((await check(8, "rgpd.write", { admin: true })).allowed);
  assert.ok((await check(8, "general.read")).allowed);
});

function simulateRoleTransaction({
  actorRole = "admin",
  actorPermissions = ["users.create", "users.update", "users.reset_password", "users.set_active", "users.delete"],
  hasOtherAdmin = false,
  roleInUse = false,
  targetRole = "admin",
  targetPermissions = [],
  onWrite = () => {},
} = {}) {
  const calls = [];
  db.getConnection = async () => ({
    async beginTransaction() { calls.push("begin"); },
    async execute(sql, values) {
      if (sql.includes("FROM roles WHERE code = 'admin'")) {
        assert.match(sql, /FOR UPDATE/);
        calls.push("lock-role");
        return [[{ id: 1 }]];
      }
      if (sql.includes("AS firstName")) {
        calls.push("actor");
        return [actorPermissions.map((permissionCode) => ({ ...profile, roleCode: actorRole, permissionCode }))];
      }
      if (sql.includes("AS roleId")) {
        calls.push("target");
        return [[{ id: 2, is_active: 1, roleId: "1", roleCode: targetRole, email: profile.email }]];
      }
      if (sql.startsWith("SELECT code FROM permissions")) return [values.map((code) => ({ code }))];
      if (sql.includes("SELECT DISTINCT p.code")) return [targetPermissions.map((code) => ({ code }))];
      if (sql.includes("u.id <>")) {
        calls.push("check-other-admin");
        return [hasOtherAdmin ? [{ 1: 1 }] : []];
      }
      if (sql.includes("FROM admin_users") && sql.includes("WHERE email")) return [[]];
      if (sql.includes("CAST(id AS CHAR)")) {
        const value = values[0];
        if (sql.includes("WHERE code = ?")) {
          return [value === "custom" ? [{ id: "2", code: "custom" }] : []];
        }
        return [[{ id: value, code: value === "1" ? "admin" : "custom" }]];
      }
      if (sql.startsWith("SELECT 1 FROM admin_user_roles")) {
        return [roleInUse ? [{ 1: 1 }] : []];
      }
      assert.match(sql, /^(UPDATE|DELETE|INSERT)/);
      calls.push("write");
      onWrite(sql, values);
      return [{}];
    },
    async commit() { calls.push("commit"); },
    async rollback() { calls.push("rollback"); },
    release() { calls.push("release"); },
  });
  return calls;
}

const edit = { id: 2, actorId: 1, ...profile };

test("non-admins cannot manage system admins or explicitly assign roles", async () => {
  const calls = simulateRoleTransaction({ actorRole: "operator" });
  const operations = [
    () => updateAdminUser(edit),
    () => updateAdminUserPassword({ ...edit, passwordHash: "placeholder" }),
    () => mutateAdminUserStatus({ ...edit, operation: "disable" }),
    () => mutateAdminUserStatus({ ...edit, operation: "delete" }),
    () => updateAdminUser({ ...edit, roleIds: ["1"] }),
    () => insertAdminUser({ ...edit, roleIds: [], passwordHash: "placeholder" }),
    () => saveRole(1, null, "operator", ["users.read"]),
    () => deleteRole(1, "2"),
  ];

  for (const operation of operations) {
    await assert.rejects(operation(), { statusCode: 403 });
    assert.deepEqual(calls.slice(0, 3), ["begin", "lock-role", "actor"]);
    assert.deepEqual(calls.slice(-2), ["rollback", "release"]);
    assert.ok(!calls.includes("write"));
    calls.length = 0;
  }
});

test("last active admin is protected on disable, deletion, and removal of the role", async () => {
  const calls = simulateRoleTransaction();
  for (const operation of [
    () => mutateAdminUserStatus({ ...edit, operation: "disable" }),
    () => mutateAdminUserStatus({ ...edit, operation: "delete" }),
    () => updateAdminUser({ ...edit, roleIds: [] }),
  ]) {
    await assert.rejects(operation(), { code: "LAST_ACTIVE_ADMIN" });
    assert.deepEqual(calls.splice(0), [
      "begin", "lock-role", "actor", "target", "check-other-admin", "rollback", "release",
    ]);
  }

  const allowed = simulateRoleTransaction({ hasOtherAdmin: true });
  await updateAdminUser({ ...edit, roleIds: [] });
  assert.deepEqual(allowed, [
    "begin", "lock-role", "actor", "target", "check-other-admin", "write", "write", "target", "commit", "release",
  ]);
});

test("system roles are immutable and assigned custom roles cannot be deleted", async () => {
  const calls = simulateRoleTransaction({ roleInUse: true });
  await assert.rejects(saveRole(1, "1", "renamed", []), { code: "SYSTEM_ROLE" });
  await assert.rejects(deleteRole(1, "1"), { code: "SYSTEM_ROLE" });
  await assert.rejects(deleteRole(1, "2"), { code: "ROLE_IN_USE" });
  assert.equal(calls.filter((call) => call === "rollback").length, 3);
  assert.ok(!calls.includes("write"));
});

test("a profile edit without roleIds does not change assignments", async () => {
  const calls = simulateRoleTransaction();
  await updateAdminUser(edit);
  assert.deepEqual(calls, [
    "begin", "lock-role", "actor", "target", "write", "target", "commit", "release",
  ]);
});

test("credential changes cannot hand an operator permissions they do not hold", async () => {
  const calls = simulateRoleTransaction({
    actorRole: "operator", targetRole: "custom", targetPermissions: ["users.read"],
  });
  await assert.rejects(updateAdminUser({ ...edit, email: "new@example.invalid" }), { statusCode: 403 });
  await assert.rejects(updateAdminUserPassword({ ...edit, passwordHash: "placeholder" }), { statusCode: 403 });
  assert.ok(!calls.includes("write"));
});

test("saving a custom role updates its permissions without rewriting account assignments", async () => {
  const calls = simulateRoleTransaction();
  await saveRole(1, "2", "custom", ["users.read", "users.update"]);
  assert.deepEqual(calls, ["begin", "lock-role", "actor", "write", "write", "write", "commit", "release"]);
});

test("an administrator can explicitly replace assignments with multiple roles", async () => {
  const calls = simulateRoleTransaction();
  await updateAdminUser({ ...edit, roleIds: ["1", "2"] });
  assert.deepEqual(calls, [
    "begin", "lock-role", "actor", "target", "write", "write", "write", "write", "target", "commit", "release",
  ]);
});

test("Administration exposes the requested hierarchy and the migration only seeds new atomic codes", () => {
  assert.deepEqual(PERMISSION_CATALOG.map(({ label }) => label), ["Administration", "Relation client", "Portfolio", "Documents légaux"]);
  const [category] = PERMISSION_CATALOG;
  assert.equal(category.label, "Administration");
  assert.deepEqual(category.groups.map(({ label, rights }) => [label, rights.map((right) => right.label)]), [
    ["Gestion RGPD", ["Lecture", "Écriture"]],
    ["Gestion des utilisateurs", ["Lecture", "Écriture", "Modification", "Suppression"]],
    ["Paramètres généraux", ["Lecture", "Écriture"]],
  ]);
  assert.equal(new Set(PERMISSION_CODES).size, PERMISSION_CODES.length);
  const migration = readFileSync(path.join(__dirname, "../migrations/002_administration_permissions.sql"), "utf8");
  const inserted = [...migration.matchAll(/\('([a-z.]+)'\)/g)].map((match) => match[1]);
  assert.deepEqual(inserted.sort(), ["general.read", "general.write", "rgpd.read", "rgpd.write"]);
  assert.match(migration, /WHERE r\.code = 'admin'/);
});

test("reading and saving a historical partial Modification preserves the exact atoms", async () => {
  db.execute = async () => [[
    { id: "1", code: "admin", permission: null, inUse: 1 },
    { id: "2", code: "custom", permission: "users.reset_password", inUse: 1 },
  ]];
  const { categories, roles } = await listRoles();
  assert.equal(categories[0].label, "Administration");
  assert.deepEqual([...roles[0].permissions].sort(), [...PERMISSION_CODES].sort());
  const [partial] = roles.slice(1);
  assert.deepEqual(partial.permissions, ["users.reset_password"]);

  const insertions = [];
  simulateRoleTransaction({ onWrite(sql, values) {
    if (sql.includes("INSERT INTO role_permissions")) insertions.push(values);
  } });
  await saveRole(1, partial.id, partial.code, partial.permissions);
  assert.deepEqual(insertions, [["2", "users.reset_password"]]);
});

test("the Administration routes keep read and write separate and authorize before upload", () => {
  const rgpd = readFileSync(path.join(__dirname, "../src/rgpd/settings.routes.ts"), "utf8");
  const general = readFileSync(path.join(__dirname, "../src/settings-general/settings-general.routes.ts"), "utf8");
  assert.match(rgpd, /get\("\/", requireAccountAccess\("rgpd\.read"\)/);
  assert.match(rgpd, /get\("\/rgpd-stats", requireAccountAccess\("rgpd\.read"\)/);
  assert.match(rgpd, /patch\("\/", requireAccountAccess\("rgpd\.write"\)/);
  assert.match(rgpd, /post\("\/purge-now", requireAccountAccess\("rgpd\.write", \{ admin: true \}\)/);
  assert.match(general, /get\("\/public", async/);
  assert.match(general, /get\("\/", requireAccountAccess\("general\.read"\)/);
  assert.match(general, /put\("\/", requireAccountAccess\("general\.write"\)/);
  assert.match(general, /"\/upload-logo", requireAccountAccess\("general\.write"\),\s*handleUpload\(\s*settingsGeneralUpload\.single/);
});

const { imagePermissions, servicePermissions } = require(path.join(build, "rbac/content-permissions.js"));
const { consumeSocketTicket, getSocketChannels, issueSocketTicket } = require(path.join(build, "websocket/ws-access.js"));

test("image creation defaults to add-only and explicit mixed changes require every relevant right", () => {
  assert.deepEqual(imagePermissions({ caption: "test" }, true), ["images.add"]);
  assert.deepEqual(imagePermissions({ isActive: false }, true), ["images.add"]);
  assert.deepEqual(imagePermissions({ isActive: true, displayOrder: 1 }, true), ["images.add", "images.publish", "images.reorder"]);
  assert.deepEqual(imagePermissions({ caption: "test", isActive: false }, false), ["images.update", "images.publish"]);
  assert.deepEqual(imagePermissions({ displayOrder: 1 }, false), ["images.reorder"]);
});

test("service visibility and content are independently authorized, including false and empty values", () => {
  assert.deepEqual(servicePermissions({ sectionEnabled: false }), ["services.visibility"]);
  assert.deepEqual(servicePermissions({ cards: [{ bullets: [] }] }), ["services.write"]);
  assert.deepEqual(servicePermissions({ introHtml: null, cards: [{ priceEnabled: false }] }), ["services.write", "services.visibility"]);
  assert.deepEqual(servicePermissions({ cards: [{}] }), []);
});

test("socket tickets are single-use and expire; the two channels are independent", () => {
  const identity = { sessionId: "session-test", userId: 8 };
  const ticket = issueSocketTicket(identity, 1000);
  assert.match(ticket, /^[A-Za-z0-9_-]{43}$/);
  assert.deepEqual(consumeSocketTicket(ticket, 1001), identity);
  assert.equal(consumeSocketTicket(ticket, 1002), null);
  const expired = issueSocketTicket(identity, 1000);
  assert.equal(consumeSocketTicket(expired, 31000), null);
  assert.deepEqual(getSocketChannels(["messages.read"]), { messages: true, rgpd: false });
  assert.deepEqual(getSocketChannels(["rgpd.read"]), { messages: false, rgpd: true });
  assert.deepEqual(getSocketChannels(["messages.process", "rgpd.write"]), { messages: false, rgpd: false });
});

test("003 grants the exact new catalogue to admin and export cannot be delegated", () => {
  const { ASSIGNABLE_PERMISSION_CODES } = require(path.join(build, "rbac/permission-catalog.js"));
  assert.ok(!ASSIGNABLE_PERMISSION_CODES.includes("messages.export_rgpd"));
  const migration = readFileSync(path.join(__dirname, "../migrations/003_dashboard_permissions.sql"), "utf8");
  const inserted = [...migration.matchAll(/\('([a-z._]+)'\)/g)].map((match) => match[1]);
  assert.deepEqual(inserted.sort(), PERMISSION_CODES.filter((code) =>
    !["users", "rgpd", "general"].includes(code.split(".")[0])
  ).sort());
  assert.match(migration, /WHERE r\.code = 'admin'/);

  const routes = readFileSync(path.join(__dirname, "../src/messages/messages.routes.ts"), "utf8");
  assert.match(routes, /export-rgpd", requireAccountAccess\("messages\.export_rgpd", \{ admin: true \}\)/);
});
