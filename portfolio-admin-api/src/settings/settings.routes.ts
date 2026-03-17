import { Router } from "express";
import { requireAdminAuth } from "../auth/auth.middleware";
import {
  getAppSettings,
  updateAppSettings,
  purgeOldMessages,
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
  const { retentionDays, autoPurgeEnabled } = req.body;

  await updateAppSettings({
    retentionDays,
    autoPurgeEnabled,
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