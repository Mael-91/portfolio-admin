import {
  purgeOldMessages,
  getAppSettings,
} from "../settings/settings.service";

function msUntilNextRun(hour: number) {
  const now = new Date();
  const next = new Date();

  next.setHours(hour, 0, 0, 0);

  if (next <= now) {
    next.setDate(next.getDate() + 1);
  }

  return next.getTime() - now.getTime();
}

export async function startRgpdCron() {
  async function scheduleNextRun() {
    const settings = await getAppSettings();

    const delay = msUntilNextRun(settings.purgeHour);

    console.log(
      `Prochaine purge RGPD à ${settings.purgeHour}:00 dans ${
        Math.round(delay / 1000 / 60)
      } minutes`
    );

    setTimeout(async () => {
      const currentSettings = await getAppSettings();

      if (currentSettings.autoPurgeEnabled) {
        const result = await purgeOldMessages();

        console.log(
          `RGPD purge exécutée (${currentSettings.purgeHour}h) :`,
          result.deleted
        );
      }

      scheduleNextRun(); // 🔁 recalcul dynamique
    }, delay);
  }

  scheduleNextRun();
}