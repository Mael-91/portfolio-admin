import { db } from "../db/db";

export async function getSettingsByKeys(keys: string[]) {
  if (keys.length === 0) return {};

  const placeholders = keys.map(() => "?").join(",");

  const [rows]: any = await db.execute(
    `SELECT key_name, value FROM app_settings WHERE key_name IN (${placeholders})`,
    keys
  );

  const result: Record<string, string> = {};

  for (const row of rows) {
    result[row.key_name] = row.value;
  }

  return result;
}

export async function upsertSetting(key: string, value: string) {
  await db.execute(
    `
    INSERT INTO app_settings (key_name, value)
    VALUES (?, ?)
    ON DUPLICATE KEY UPDATE value = VALUES(value)
    `,
    [key, value]
  );
}