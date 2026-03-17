import { purgeOldMessages, getAppSettings } from "../settings/settings.service";

export function startRgpdCron() {
  setInterval(async () => {
    const settings = await getAppSettings();

    if (!settings.autoPurgeEnabled) return;

    const result = await purgeOldMessages();

    console.log("RGPD purge:", result.deleted);
  }, 24 * 60 * 60 * 1000); // 1 jour
}