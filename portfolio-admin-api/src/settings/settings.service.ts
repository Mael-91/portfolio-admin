import { getSettings, updateSetting } from "./settings.repository";
import { db } from "../db/db";

export async function getAppSettings() {
  const settings = await getSettings();

  return {
    retentionDays: Number(settings.rgpd_retention_days || 90),
    autoPurgeEnabled: settings.rgpd_auto_purge_enabled === "true",
  };
}

export async function updateAppSettings(data: {
  retentionDays: number;
  autoPurgeEnabled: boolean;
}) {
  await updateSetting("rgpd_retention_days", String(data.retentionDays));
  await updateSetting(
    "rgpd_auto_purge_enabled",
    data.autoPurgeEnabled ? "true" : "false"
  );
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