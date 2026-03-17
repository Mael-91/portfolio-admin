import { db } from "../db/db";

export async function getSettings() {
  const [rows] = await db.execute<any[]>(
    `SELECT key_name, value FROM app_settings`
  );

  const settings: Record<string, string> = {};

  for (const row of rows) {
    settings[row.key_name] = row.value;
  }

  return settings;
}

export async function updateSetting(key: string, value: string) {
  await db.execute(
    `
    INSERT INTO app_settings (key_name, value)
    VALUES (?, ?)
    ON DUPLICATE KEY UPDATE value = VALUES(value)
    `,
    [key, value]
  );
}