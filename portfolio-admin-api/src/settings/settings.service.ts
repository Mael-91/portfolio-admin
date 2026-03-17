import { getSettings, updateSetting } from "./settings.repository";
import { db } from "../db/db";

export async function getAppSettings() {
  const settings = await getSettings();

  return {
    retentionDays: Number(settings.rgpd_retention_days || 90),
    autoPurgeEnabled: settings.rgpd_auto_purge_enabled === "true",
    purgeHour: Number(settings.rgpd_purge_hour || 3),
  };
}

export async function updateAppSettings(data: {
  retentionDays: number;
  autoPurgeEnabled: boolean;
  purgeHour: number;
}) {
  await updateSetting("rgpd_retention_days", String(data.retentionDays));
  await updateSetting(
    "rgpd_auto_purge_enabled",
    data.autoPurgeEnabled ? "true" : "false"
  );
  await updateSetting("rgpd_purge_hour", String(data.purgeHour));
}

export async function purgeOldMessages() {
  const settings = await getSettings();

  const retentionDays = Number(settings.rgpd_retention_days || 90);

  const [result]: any = await db.execute(
    `
    DELETE FROM contact_submissions
    WHERE created_at < NOW() - INTERVAL ? DAY
    `,
    [retentionDays]
  );

  return {
    deleted: result.affectedRows || 0,
  };
}

export async function getRgpdStats(retentionDaysOverride?: number) {
  const settings = await getSettings();
  const retentionDays = retentionDaysOverride ?? Number(settings.rgpd_retention_days || 90);

  const [rows]: any = await db.execute(
    `
      SELECT COUNT(*) as total
      FROM contact_submissions
      WHERE created_at < NOW() - INTERVAL ? DAY
    `,
    [retentionDays]
  );

  return {
    toDelete: rows[0].total,
  };
}