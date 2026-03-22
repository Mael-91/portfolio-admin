import { ResultSetHeader, RowDataPacket } from "mysql2";
import { db } from "../db/db";

export type AdminUserRow = RowDataPacket & {
  id: number;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  is_active: number | boolean;
  created_at: string;
  updated_at: string;
};

export async function findAdminUsers() {
  const [rows] = await db.execute<AdminUserRow[]>(
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
    ORDER BY created_at DESC
    `
  );

  return rows;
}

export async function findAdminUserById(id: number) {
  const [rows] = await db.execute<AdminUserRow[]>(
    `
    SELECT
      id,
      email,
      password_hash,
      first_name,
      last_name,
      is_active,
      created_at,
      updated_at
    FROM admin_users
    WHERE id = ?
    LIMIT 1
    `,
    [String(id)]
  );

  return rows[0] ?? null;
}

export async function findAdminUserByEmail(email: string) {
  const [rows] = await db.execute<AdminUserRow[]>(
    `
    SELECT
      id,
      email,
      password_hash,
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

export async function insertAdminUser(params: {
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
}) {
  const [result] = await db.execute<ResultSetHeader>(
    `
    INSERT INTO admin_users (
      email,
      password_hash,
      first_name,
      last_name,
      is_active
    )
    VALUES (?, ?, ?, ?, 1)
    `,
    [params.email, params.passwordHash, params.firstName, params.lastName]
  );

  return result.insertId;
}

export async function deleteAdminUserById(id: number) {
  await db.execute(
    `
    DELETE FROM admin_users
    WHERE id = ?
    `,
    [String(id)]
  );
}

export async function updateAdminUser(params: {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
}) {
  await db.execute(
    `
    UPDATE admin_users
    SET
      email = ?,
      first_name = ?,
      last_name = ?
    WHERE id = ?
    `,
    [params.email, params.firstName, params.lastName, String(params.id)]
  );
}

export async function updateAdminUserPassword(params: {
  id: number;
  passwordHash: string;
}) {
  await db.execute(
    `
    UPDATE admin_users
    SET password_hash = ?
    WHERE id = ?
    `,
    [params.passwordHash, String(params.id)]
  );
}

export async function updateAdminUserActiveStatus(params: {
  id: number;
  isActive: boolean;
}) {
  await db.execute(
    `
    UPDATE admin_users
    SET is_active = ?
    WHERE id = ?
    `,
    [params.isActive ? 1 : 0, String(params.id)]
  );
}