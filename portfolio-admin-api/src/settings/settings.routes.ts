import { Router } from "express";
import { requireAdminAuth } from "../auth/auth.middleware";
import {
  getAppSettings,
  updateAppSettings,
  purgeOldMessages,
  getRgpdStats,
} from "./settings.service";

export const settingsRouter = Router();

settingsRouter.use(requireAdminAuth);

// GET
settingsRouter.get("/", async (_req, res) => {
  const settings = await getAppSettings();

  res.json({
    success: true,
    settings,
  });
});

// PATCH
settingsRouter.patch("/", async (req, res) => {
  const { retentionDays, autoPurgeEnabled, purgeHour } = req.body;

  if (
    typeof retentionDays !== "number" ||
    typeof autoPurgeEnabled !== "boolean" ||
    typeof purgeHour !== "number"
  ) {
    return res.status(400).json({
      success: false,
      message: "Paramètres invalides",
    });
  }

  if (purgeHour < 0 || purgeHour > 23) {
    return res.status(400).json({
      success: false,
      message: "Heure de purge invalide",
    });
  }

  await updateAppSettings({
    retentionDays,
    autoPurgeEnabled,
    purgeHour,
  });

  res.json({ success: true });
});

// POST purge
settingsRouter.post("/purge-now", async (_req, res) => {
  const result = await purgeOldMessages();

  res.json({
    success: true,
    ...result,
  });
});

settingsRouter.get("/rgpd-stats", async (req, res) => {
  const retentionDays = req.query.retentionDays
    ? Number(req.query.retentionDays)
    : undefined;

  const stats = await getRgpdStats(retentionDays);

  res.json({
    success: true,
    stats,
  });
});