import type { RowDataPacket } from "mysql2";
import { db } from "../db/db";

import { PERMISSION_CODES, SYSTEM_PERMISSION_CODES, USER_PERMISSIONS } from "./permission-catalog";

export { USER_PERMISSIONS };
export type UserPermission = (typeof USER_PERMISSIONS)[keyof typeof USER_PERMISSIONS];

interface AccessRow extends RowDataPacket {
  firstName: string;
  lastName: string;
  email: string;
  roleCode: string | null;
  permissionCode: string | null;
}

export async function loadAccountAccess(id: number, executor: Pick<typeof db, "execute"> = db) {
  if (!Number.isSafeInteger(id) || id <= 0) return null;

  const [rows] = await executor.execute<AccessRow[]>(
    `SELECT u.first_name AS firstName, u.last_name AS lastName, u.email,
            r.code AS roleCode, p.code AS permissionCode
     FROM admin_users u
     LEFT JOIN admin_user_roles ur ON ur.admin_user_id = u.id
     LEFT JOIN roles r ON r.id = ur.role_id
     LEFT JOIN role_permissions rp ON rp.role_id = r.id
     LEFT JOIN permissions p ON p.id = rp.permission_id
     WHERE u.id = ? AND u.is_active = 1`,
    [String(id)]
  );

  const account = rows[0];
  if (!account) return null;

  const roles = new Set<string>();
  const permissions = new Set<string>();
  for (const row of rows) {
    if (row.roleCode) roles.add(row.roleCode);
    if (row.permissionCode) permissions.add(row.permissionCode);
  }

  if (roles.has("admin")) {
    for (const code of PERMISSION_CODES) permissions.add(code);
  } else {
    for (const code of SYSTEM_PERMISSION_CODES) permissions.delete(code);
  }

  return {
    user: { id, firstName: account.firstName, lastName: account.lastName, email: account.email },
    roles: [...roles].sort(),
    permissions: [...permissions].sort(),
  };
}
