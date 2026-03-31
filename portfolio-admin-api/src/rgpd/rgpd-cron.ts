import { runScheduledRgpdPurgeIfDue } from "./settings.service";

let rgpdInterval: NodeJS.Timeout | null = null;
let rgpdCronStarted = false;

export async function startRgpdCron() {
  if (rgpdCronStarted) {
    return;
  }

  rgpdCronStarted = true;

  const tick = async () => {
    try {
      const result = await runScheduledRgpdPurgeIfDue();

      if (result.ran) {
        console.log(
          `[RGPD] purge exécutée : ${result.deleted} message(s) supprimé(s)`
        );
      }
    } catch (error) {
      console.error("[RGPD] Erreur scheduler :", error);
    }
  };

  await tick();

  rgpdInterval = setInterval(() => {
    void tick();
  }, 60_000);

  console.log("[RGPD] scheduler démarré");
}