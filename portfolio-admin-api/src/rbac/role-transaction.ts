import type { PoolConnection, RowDataPacket } from "mysql2/promise";
import { db } from "../db/db";
import { AppError } from "../common/app-error";
import { loadAccountAccess, type UserPermission } from "./account-access";

export function accessDenied() {
  return new AppError({ code: "FORBIDDEN", message: "Accès interdit.", statusCode: 403 });
}

export async function withRoleTransaction<T>(
  actorId: number,
  requirements: { permissions?: UserPermission[]; admin?: boolean },
  run: (connection: PoolConnection, actor: { isAdmin: boolean; permissions: string[] }) => Promise<T>
): Promise<T> {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const [roles] = await connection.execute<RowDataPacket[]>(
      "SELECT id FROM roles WHERE code = 'admin' FOR UPDATE"
    );
    if (!roles.length) throw new Error("Rôle admin absent");

    const actor = await loadAccountAccess(actorId, connection);
    if (!actor) {
      throw new AppError({ code: "UNAUTHENTICATED", message: "Non authentifié", statusCode: 401 });
    }
    const isAdmin = actor.roles.includes("admin");
    if ((requirements.admin && !isAdmin) ||
        requirements.permissions?.some((permission) => !actor.permissions.includes(permission))) {
      throw accessDenied();
    }

    const result = await run(connection, { isAdmin, permissions: actor.permissions });
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function requireAnotherActiveAdmin(connection: PoolConnection, id: number) {
  const [remaining] = await connection.execute<RowDataPacket[]>(
    `SELECT 1 FROM admin_users u
     JOIN admin_user_roles ur ON ur.admin_user_id = u.id
     JOIN roles r ON r.id = ur.role_id
     WHERE r.code = 'admin' AND u.is_active = 1 AND u.id <> ?
     LIMIT 1`,
    [String(id)]
  );
  if (!remaining.length) {
    throw new AppError({
      code: "LAST_ACTIVE_ADMIN",
      message: "Le dernier administrateur actif doit conserver son accès.",
      statusCode: 409,
    });
  }
}
