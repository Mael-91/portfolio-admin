import type { PoolConnection, RowDataPacket } from "mysql2/promise";
import { AppError } from "../common/app-error";
import { db } from "../db/db";
import { ASSIGNABLE_PERMISSION_CODES, PERMISSION_CATALOG, PERMISSION_CODES, type PermissionCode } from "./permission-catalog";
import { requireAnotherActiveAdmin, withRoleTransaction } from "./role-transaction";

interface RoleRow extends RowDataPacket {
  id: string;
  code: string;
}

async function findRole(connection: PoolConnection, value: string, byId = false) {
  const [rows] = await connection.execute<RoleRow[]>(
    `SELECT CAST(id AS CHAR) AS id, code FROM roles WHERE ${byId ? "id = CAST(? AS UNSIGNED)" : "code = ?"}`, [value]
  );
  return rows[0];
}

export async function listRoles() {
  const [rows] = await db.execute<(RoleRow & { permission: PermissionCode | null; inUse: number })[]>(
    `SELECT CAST(r.id AS CHAR) AS id, r.code, p.code AS permission,
       EXISTS(SELECT 1 FROM admin_user_roles ur WHERE ur.role_id = r.id) AS inUse
     FROM roles r
     LEFT JOIN role_permissions rp ON rp.role_id = r.id
     LEFT JOIN permissions p ON p.id = rp.permission_id
     ORDER BY r.code, p.code`
  );
  const roles = new Map<string, { id: string; code: string; permissions: string[]; inUse: boolean }>();
  for (const row of rows) {
    const role = roles.get(row.code) ?? { id: row.id, code: row.code, permissions: row.code === "admin" ? [...PERMISSION_CODES] : [], inUse: Boolean(row.inUse) };
    if (row.code !== "admin" && row.permission && ASSIGNABLE_PERMISSION_CODES.includes(row.permission)) role.permissions.push(row.permission);
    roles.set(row.code, role);
  }
  return { roles: [...roles.values()], categories: PERMISSION_CATALOG };
}

export async function saveRole(actorId: number, roleId: string | null, code: string, permissions: string[]) {
  await withRoleTransaction(actorId, { admin: true }, async (connection) => {
    if (code === "admin") throw immutableRole();
    const existing = await findRole(connection, code);
    const previous = roleId === null ? undefined : await findRole(connection, roleId, true);
    if (previous?.code === "admin") throw immutableRole();
    if (roleId !== null && !previous) throw missingRole();
    if (existing && existing.id !== previous?.id) {
      throw new AppError({ code: "ROLE_EXISTS", message: "Ce rôle existe déjà.", statusCode: 409 });
    }

    if (previous) {
      await connection.execute("UPDATE roles SET code = ? WHERE id = ?", [code, previous.id]);
    } else {
      await connection.execute("INSERT INTO roles (code) VALUES (?)", [code]);
    }
    const role = previous ?? await findRole(connection, code);
    if (!role) throw new Error("Rôle introuvable après création");
    const placeholders = permissions.map(() => "?").join(", ");
    if (permissions.length) {
      const [seeded] = await connection.execute<RowDataPacket[]>(
        `SELECT code FROM permissions WHERE code IN (${placeholders})`,
        permissions
      );
      if (seeded.length !== new Set(permissions).size) {
        throw new AppError({ code: "CATALOG_NOT_SEEDED", message: "Le catalogue des permissions doit être migré.", statusCode: 409 });
      }
      // Keep associations outside the current catalogue intact.
      await connection.execute(
        `INSERT INTO role_permissions (role_id, permission_id)
         SELECT ?, id FROM permissions WHERE code IN (${placeholders})
         ON DUPLICATE KEY UPDATE permission_id = VALUES(permission_id)`,
        [role.id, ...permissions]
      );
    }
    const removed = ASSIGNABLE_PERMISSION_CODES.filter((permission) => !permissions.includes(permission));
    if (removed.length) {
      await connection.execute(
        `DELETE rp FROM role_permissions rp JOIN permissions p ON p.id = rp.permission_id
         WHERE rp.role_id = ? AND p.code IN (${removed.map(() => "?").join(", ")})`,
        [role.id, ...removed]
      );
    }
  });
}

export async function deleteRole(actorId: number, id: string) {
  await withRoleTransaction(actorId, { admin: true }, async (connection) => {
    const role = await findRole(connection, id, true);
    if (role?.code === "admin") throw immutableRole();
    if (!role) throw missingRole();
    const [accounts] = await connection.execute<RowDataPacket[]>(
      "SELECT 1 FROM admin_user_roles WHERE role_id = ? LIMIT 1", [role.id]
    );
    if (accounts.length) {
      throw new AppError({ code: "ROLE_IN_USE", message: "Ce rôle est encore attribué à un compte.", statusCode: 409 });
    }
    await connection.execute("DELETE FROM roles WHERE id = ?", [role.id]);
  });
}

export async function replaceAccountRoles(
  connection: PoolConnection,
  id: number,
  requestedIds: string[],
  removesActiveAdmin: boolean
) {
  const roles: RoleRow[] = [];
  for (const roleId of new Set(requestedIds)) {
    const role = await findRole(connection, roleId, true);
    if (!role) throw missingRole();
    roles.push(role);
  }
  if (removesActiveAdmin && !roles.some((role) => role.code === "admin")) {
    await requireAnotherActiveAdmin(connection, id);
  }
  await connection.execute("DELETE FROM admin_user_roles WHERE admin_user_id = ?", [String(id)]);
  for (const { id: roleId } of roles) {
    await connection.execute("INSERT INTO admin_user_roles (admin_user_id, role_id) VALUES (?, ?)", [String(id), roleId]);
  }
}

function missingRole() {
  return new AppError({ code: "ROLE_NOT_FOUND", message: "Rôle introuvable. Actualisez la liste des rôles.", statusCode: 404 });
}

function immutableRole() {
  return new AppError({ code: "SYSTEM_ROLE", message: "Le rôle système admin est immuable.", statusCode: 409 });
}
