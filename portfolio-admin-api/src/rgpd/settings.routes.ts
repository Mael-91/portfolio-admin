import { Router } from "express";
import { requireAdminAuth } from "../auth/auth.middleware";
import {
  getAppSettings,
  updateAppSettings,
  getRgpdStats,
} from "./settings.service";
import { countUnprocessedMessages } from "../messages/messages.repository";
import { broadcastRgpdPurge } from "../websocket/ws-server";
import { runRgpdPurgeNow } from "./settings.service";

export const RGPDRouter = Router();

RGPDRouter.use(requireAdminAuth);

// GET
RGPDRouter.get("/", async (_req, res) => {
  const settings = await getAppSettings();

  res.json({
    success: true,
    settings,
  });
});

// PATCH
RGPDRouter.patch("/", async (req, res) => {
  const { retentionDays, autoPurgeEnabled, purgeHour } = req.body;

  if (
    typeof retentionDays !== "number" ||
    typeof autoPurgeEnabled !== "boolean" ||
    typeof purgeHour !== "string"
  ) {
    return res.status(400).json({
      success: false,
      message: "Paramètres invalides",
    });
  }

  if (!/^\d{2}:\d{2}$/.test(purgeHour)) {
    return res.status(400).json({
      success: false,
      message: "Heure de purge invalide",
    });
  }

  const [hours, minutes] = purgeHour.split(":").map(Number);

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
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
RGPDRouter.post("/purge-now", async (_req, res) => {
  const result = await runRgpdPurgeNow();
  const unprocessedCount = await countUnprocessedMessages();

  broadcastRgpdPurge({
    unprocessedCount,
    deletedCount: result.deleted,
  });

  return res.status(200).json({
    success: true,
    ...result,
  });
});

RGPDRouter.get("/rgpd-stats", async (req, res) => {
  const retentionDays = req.query.retentionDays
    ? Number(req.query.retentionDays)
    : undefined;

  const stats = await getRgpdStats(retentionDays);

  res.json({
    success: true,
    stats,
  });
});