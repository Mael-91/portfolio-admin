import cron from "node-cron";
import { purgeOldContactSubmissions } from "./rgpd-purge.service";
import { env } from "../env";

export function startRgpdCron() {
  const retentionDays = Number(env.rgpdRetentionDays);

  cron.schedule(env.rgpdPurgeCron, async () => {
    try {
      await purgeOldContactSubmissions(retentionDays);
    } catch (err) {
      console.error("Erreur purge RGPD :", err);
    }
  });

  console.log("Cron RGPD démarré");
}