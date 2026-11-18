import type { PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { AppError } from "../common/app-error";
import { USER_PERMISSIONS } from "../rbac/account-access";
import { accessDenied, requireAnotherActiveAdmin, withRoleTransaction } from "../rbac/role-transaction";
import { replaceAccountRoles } from "../rbac/roles.repository";
import { db } from "../db/db";

interface UserFields {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  is_active: number | boolean;
  created_at: string;
  updated_at: string;
};

export type AdminUserRow = UserFields & { roles: { id: string; code: string }[] };

interface UserWithRoleRow extends UserFields, RowDataPacket {
  roleId: string | null;
  roleCode: string | null;
};

async function findUsers(id?: number, executor: Pick<typeof db, "execute"> = db) {
  const [rows] = await executor.execute<UserWithRoleRow[]>(
    `SELECT u.id, u.email, u.first_name, u.last_name, u.is_active, u.created_at, u.updated_at,
            CAST(r.id AS CHAR) AS roleId, r.code AS roleCode
     FROM admin_users u
     LEFT JOIN admin_user_roles ur ON ur.admin_user_id = u.id
     LEFT JOIN roles r ON r.id = ur.role_id
     ${id === undefined ? "" : "WHERE u.id = ?"}
     ORDER BY u.created_at DESC, r.code`,
    id === undefined ? [] : [String(id)]
  );
  const users = new Map<number, AdminUserRow>();
  for (const { roleId, roleCode, ...row } of rows) {
    const user: AdminUserRow = users.get(row.id) ?? { ...row, roles: [] };
    if (roleId && roleCode) user.roles.push({ id: roleId, code: roleCode });
    users.set(row.id, user);
  }
  return [...users.values()];
}

export async function findAdminUsers() {
  return findUsers();
}

async function requireTarget(connection: PoolConnection, id: number, actorIsAdmin: boolean) {
  const [target] = await findUsers(id, connection);
  if (!target) {
    throw new AppError({ code: "USER_NOT_FOUND", message: "Utilisateur introuvable.", statusCode: 404 });
  }
  const targetIsAdmin = target.roles.some((role) => role.code === "admin");
  if (targetIsAdmin && !actorIsAdmin) throw accessDenied();
  return { target, targetIsActiveAdmin: targetIsAdmin && Boolean(target.is_active) };
}

async function requireCredentialAccess(
  connection: PoolConnection,
  id: number,
  actor: { isAdmin: boolean; permissions: string[] }
) {
  if (actor.isAdmin) return;
  const [rows] = await connection.execute<(RowDataPacket & { code: string })[]>(
    `SELECT DISTINCT p.code
     FROM admin_user_roles ur
     JOIN role_permissions rp ON rp.role_id = ur.role_id
     JOIN permissions p ON p.id = rp.permission_id
     WHERE ur.admin_user_id = ?`,
    [String(id)]
  );
  if (rows.some(({ code }) => !actor.permissions.includes(code))) throw accessDenied();
}

async function findAdminUserByEmail(connection: PoolConnection, email: string) {
  const [rows] = await connection.execute<(UserFields & RowDataPacket)[]>(
    `
    SELECT
      id,
      email,
      first_name,
      last_name,
      is_active,
      created_at,
      updated_at
    FROM admin_users
    WHERE email = ?
    LIMIT 1
    `,
    [email]
  );

  return rows[0] ?? null;
}

async function requireAvailableEmail(connection: PoolConnection, email: string, id?: number) {
  const existing = await findAdminUserByEmail(connection, email);
  if (existing && existing.id !== id) {
    throw new AppError({ code: "EMAIL_ALREADY_EXISTS", message: "Cet email existe déjà.", statusCode: 409 });
  }
}

export async function insertAdminUser(params: {
  actorId: number;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  roleIds?: string[];
}) {
  return withRoleTransaction(params.actorId, {
    permissions: [USER_PERMISSIONS.create],
    admin: params.roleIds !== undefined,
  }, async (connection) => {
    await requireAvailableEmail(connection, params.email);
    const [result] = await connection.execute<ResultSetHeader>(
      `INSERT INTO admin_users (email, password_hash, first_name, last_name, is_active)
       VALUES (?, ?, ?, ?, 1)`,
      [params.email, params.passwordHash, params.firstName, params.lastName]
    );
    if (!Number.isSafeInteger(result.insertId)) throw new Error("Identifiant utilisateur hors plage");
    if (params.roleIds) await replaceAccountRoles(connection, result.insertId, params.roleIds, false);
    const [user] = await findUsers(result.insertId, connection);
    return user;
  });
}

export async function updateAdminUser(params: {
  id: number;
  actorId: number;
  email: string;
  firstName: string;
  lastName: string;
  roleIds?: string[];
  passwordHash?: string;
}) {
  const permissions = params.passwordHash
    ? [USER_PERMISSIONS.update, USER_PERMISSIONS.resetPassword]
    : [USER_PERMISSIONS.update];
  return withRoleTransaction(params.actorId, {
    permissions,
    admin: params.roleIds !== undefined,
  }, async (connection, actor) => {
    const { target, targetIsActiveAdmin } = await requireTarget(connection, params.id, actor.isAdmin);
    if (params.passwordHash || params.email !== target.email) {
      await requireCredentialAccess(connection, params.id, actor);
    }
    await requireAvailableEmail(connection, params.email, params.id);
    if (params.roleIds) await replaceAccountRoles(connection, params.id, params.roleIds, targetIsActiveAdmin);
    await connection.execute(
      "UPDATE admin_users SET email = ?, first_name = ?, last_name = ? WHERE id = ?",
      [params.email, params.firstName, params.lastName, String(params.id)]
    );
    if (params.passwordHash) {
      await connection.execute("UPDATE admin_users SET password_hash = ? WHERE id = ?", [
        params.passwordHash, String(params.id),
      ]);
    }
    const [user] = await findUsers(params.id, connection);
    return user;
  });
}

export async function updateAdminUserPassword(params: {
  id: number;
  actorId: number;
  passwordHash: string;
}) {
  return withRoleTransaction(params.actorId, { permissions: [USER_PERMISSIONS.resetPassword] }, async (connection, actor) => {
    await requireTarget(connection, params.id, actor.isAdmin);
    await requireCredentialAccess(connection, params.id, actor);
    await connection.execute("UPDATE admin_users SET password_hash = ? WHERE id = ?", [
      params.passwordHash, String(params.id),
    ]);
    const [user] = await findUsers(params.id, connection);
    return user;
  });
}

export async function mutateAdminUserStatus(params: {
  id: number;
  actorId: number;
  operation: "delete" | "disable" | "enable";
}) {
  const { id, actorId, operation } = params;
  const permission = operation === "delete" ? USER_PERMISSIONS.delete : USER_PERMISSIONS.setActive;
  return withRoleTransaction(actorId, { permissions: [permission] }, async (connection, { isAdmin }) => {
    const { targetIsActiveAdmin } = await requireTarget(connection, id, isAdmin);
    if (operation !== "enable" && targetIsActiveAdmin) {
      await requireAnotherActiveAdmin(connection, id);
    }

    if (operation === "delete") {
      await connection.execute("DELETE FROM admin_users WHERE id = ?", [String(id)]);
      return null;
    }

    await connection.execute("UPDATE admin_users SET is_active = ? WHERE id = ?", [
      operation === "enable" ? 1 : 0, String(id),
    ]);
    const [user] = await findUsers(id, connection);
    return user;
  });
}
