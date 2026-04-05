import path from "path";
import { Router } from "express";
import { z } from "zod";
import { requireAdminAuth } from "../auth/auth.middleware";
import { handleRouteError } from "../common/handle-route-error";
import {
  getGeneralSettings,
  getStorageUsage,
  saveGeneralSettings,
} from "./settings-general.service";
import { settingsGeneralUpload } from "./settings-general.upload";

export const settingsGeneralRouter = Router();

settingsGeneralRouter.use(requireAdminAuth);

settingsGeneralRouter.get("/", async (_req, res) => {
  try {
    const settings = await getGeneralSettings();
    const storage = await getStorageUsage();

    return res.status(200).json({
      success: true,
      settings,
      storage,
    });
  } catch (error) {
    return handleRouteError(res, error, "lecture settings general");
  }
});

settingsGeneralRouter.put("/", async (req, res) => {
  try {
    const schema = z.object({
      siteName: z.string().trim().max(255),
      siteDescription: z.string().trim().max(5000),
      siteBackgroundColor: z.string().trim().min(1).max(20),
      siteButtonColor: z.string().trim().min(1).max(20),
      siteButtonHoverColor: z.string().trim().min(1).max(20),
      siteLogoUrl: z.string().trim().max(500),
      siteSidebarLogoUrl: z.string().trim().max(500),
    });

    const body = schema.parse(req.body);
    const settings = await saveGeneralSettings(body);

    return res.status(200).json({
      success: true,
      settings,
    });
  } catch (error) {
    return handleRouteError(res, error, "save settings general");
  }
});

settingsGeneralRouter.post(
  "/upload-logo",
  settingsGeneralUpload.single("logo"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Aucun fichier fourni.",
        });
      }

      const fileUrl = `/uploads/logos/${req.file.filename}`;

      return res.status(200).json({
        success: true,
        fileUrl,
      });
    } catch (error) {
      return handleRouteError(res, error, "upload logo");
    }
  }
);