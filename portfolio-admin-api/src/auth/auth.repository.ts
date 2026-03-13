import { RowDataPacket } from "mysql2";
import { db } from "../db/db";

export interface AdminUserRow extends RowDataPacket {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  password_hash: string;
  is_active: number;
  last_login_at: string | null;
}

export async function findAdminUserByEmail(email: string): Promise<AdminUserRow | null> {
  const [rows] = await db.execute<AdminUserRow[]>(
    `
      SELECT id, first_name, last_name, email, password_hash, is_active, last_login_at
      FROM admin_users
      WHERE email = ?
      LIMIT 1
    `,
    [email]
  );

  return rows[0] ?? null;
}

export async function updateAdminLastLoginAt(id: number): Promise<void> {
  await db.execute(
    `
      UPDATE admin_users
      SET last_login_at = NOW()
      WHERE id = ?
    `,
    [id]
  );
}