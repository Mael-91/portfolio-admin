import { runScheduledRgpdPurgeIfDue } from "./settings.service";
import { countUnprocessedMessages } from "../messages/messages.repository";
import { broadcastRgpdPurge } from "../websocket/ws-server";

let rgpdInterval: NodeJS.Timeout | null = null;
let rgpdCronStarted = false;

export async function startRgpdCron() {
  if (rgpdCronStarted) {
    console.log("[RGPD] cron déjà démarré, skip");
    return;
  }

  rgpdCronStarted = true;

  const tick = async () => {
    try {
      const result = await runScheduledRgpdPurgeIfDue();

      if (result.ran) {
        const unprocessedCount = await countUnprocessedMessages();

        broadcastRgpdPurge({
          unprocessedCount,
          deletedCount: result.deleted,
        });

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
  console.log("[RGPD] startRgpdCron appelé");
}