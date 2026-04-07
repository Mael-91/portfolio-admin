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
import { deleteLogoIfExists } from "./settings-general.file";
import { handleUpload } from "../common/handle-upload";


export const settingsGeneralRouter = Router();

settingsGeneralRouter.get("/public", async (_req, res) => {
  try {
    const settings = await getGeneralSettings();

    return res.status(200).json({
      success: true,
      settings: {
        siteName: settings.siteName,
        siteDescription: settings.siteDescription,
        siteLogoUrl: settings.siteLogoUrl,
        siteSidebarLogoUrl: settings.siteSidebarLogoUrl,
      },
    });
  } catch (error) {
    return handleRouteError(res, error, "lecture branding dashboard public");
  }
});

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
      siteLogoUrl: z.string().trim().max(500),
      siteSidebarLogoUrl: z.string().trim().max(500),
    });

    const body = schema.parse(req.body);
    const settings = await saveGeneralSettings(body);

    if (req.session.pendingSiteLogoUrl) {
      delete req.session.pendingSiteLogoUrl;
    }

    if (req.session.pendingSidebarLogoUrl) {
      delete req.session.pendingSidebarLogoUrl;
    }

    return res.status(200).json({
      success: true,
      settings,
    });
  } catch (error) {
    return handleRouteError(res, error, "enregistrement des paramètres généraux");
  }
});

settingsGeneralRouter.post(
  "/upload-logo",
  handleUpload(
    settingsGeneralUpload.single("logo"),
    async (req, res) => {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Aucun fichier fourni.",
        });
      }

      const target = String(req.body.target || "").trim();

      if (target !== "siteLogoUrl" && target !== "siteSidebarLogoUrl") {
        return res.status(400).json({
          success: false,
          message: "Cible de logo invalide.",
        });
      }

      const fileUrl = `/uploads/logos/${req.file.filename}`;

      if (target === "siteLogoUrl") {
        const previousPending = req.session.pendingSiteLogoUrl;

        if (previousPending && previousPending !== fileUrl) {
          await deleteLogoIfExists(previousPending);
        }

        req.session.pendingSiteLogoUrl = fileUrl;
      }

      if (target === "siteSidebarLogoUrl") {
        const previousPending = req.session.pendingSidebarLogoUrl;

        if (previousPending && previousPending !== fileUrl) {
          await deleteLogoIfExists(previousPending);
        }

        req.session.pendingSidebarLogoUrl = fileUrl;
      }

      return res.status(200).json({
        success: true,
        fileUrl,
      });
    },
    {
      context: "upload logo",
      fileTooLargeMessage:
        "Le fichier est trop volumineux. La taille maximale autorisée est de 5 Mo.",
    }
  )
);