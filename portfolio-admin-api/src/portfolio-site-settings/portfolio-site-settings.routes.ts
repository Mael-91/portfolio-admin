import { Router } from "express";
import { z } from "zod";
import { requireAdminAuth } from "../auth/auth.middleware";
import { handleRouteError } from "../common/handle-route-error";
import { handleUpload } from "../common/handle-upload";
import {
  getPortfolioSiteSettings,
  savePortfolioSiteSettings,
} from "./portfolio-site-settings.service";
import { portfolioSiteSettingsUpload } from "./portfolio-site-settings.upload";
import { deletePortfolioSiteImageIfExists } from "./portfolio-site-settings.file";

export const portfolioSiteSettingsRouter = Router();

portfolioSiteSettingsRouter.use(requireAdminAuth);

portfolioSiteSettingsRouter.get("/", async (_req, res) => {
  try {
    const settings = await getPortfolioSiteSettings();

    return res.status(200).json({
      success: true,
      settings,
    });
  } catch (error) {
    return handleRouteError(res, error, "lecture configuration portfolio");
  }
});

portfolioSiteSettingsRouter.put("/", async (req, res) => {
  try {
    const schema = z.object({
      siteTitle: z.string().trim().max(255),
      siteDescription: z.string().trim().max(5000),
      siteFaviconUrl: z.string().trim().max(500).optional(),

      homeTitle: z.string().trim().max(255),
      homeSubtitle: z.string().trim().max(5000),
      homeBackgroundImageUrl: z.string().trim().max(500).optional(),

      gallerySectionTitle: z.string().trim().max(255),
      gallerySectionSubtitle: z.string().trim().max(5000),

      contactSectionTitle: z.string().trim().max(255),
      contactSectionSubtitle: z.string().trim().max(5000),

      contactOptionProEnabled: z.coerce.boolean(),
      contactOptionPrivateEnabled: z.coerce.boolean(),
      contactOptionInfoEnabled: z.coerce.boolean(),

      contactSubmitButtonLabel: z.string().trim().max(100),
    });

    const body = schema.parse(req.body);

    const settings = await savePortfolioSiteSettings({
      ...body,
      siteFaviconUrl: body.siteFaviconUrl ?? "",
      homeBackgroundImageUrl: body.homeBackgroundImageUrl ?? "",
    });

    if (req.session.pendingPortfolioSiteFaviconUrl) {
      delete req.session.pendingPortfolioSiteFaviconUrl;
    }

    if (req.session.pendingPortfolioSiteHomeBackgroundUrl) {
      delete req.session.pendingPortfolioSiteHomeBackgroundUrl;
    }

    return res.status(200).json({
      success: true,
      settings,
    });
  } catch (error) {
    return handleRouteError(res, error, "sauvegarde configuration portfolio");
  }
});

portfolioSiteSettingsRouter.post(
  "/upload",
  handleUpload(
    portfolioSiteSettingsUpload.single("image"),
    async (req, res) => {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Aucune image fournie.",
        });
      }

      const target = String(req.body.target || "").trim();

      if (target !== "siteFaviconUrl" && target !== "homeBackgroundImageUrl") {
        return res.status(400).json({
          success: false,
          message: "Cible d'image invalide.",
        });
      }

      const fileUrl = `/uploads/portfolio-site-settings/${req.file.filename}`;

      if (target === "siteFaviconUrl") {
        const previousPending = req.session.pendingPortfolioSiteFaviconUrl;

        if (previousPending && previousPending !== fileUrl) {
          await deletePortfolioSiteImageIfExists(previousPending);
        }

        req.session.pendingPortfolioSiteFaviconUrl = fileUrl;
      }

      if (target === "homeBackgroundImageUrl") {
        const previousPending =
          req.session.pendingPortfolioSiteHomeBackgroundUrl;

        if (previousPending && previousPending !== fileUrl) {
          await deletePortfolioSiteImageIfExists(previousPending);
        }

        req.session.pendingPortfolioSiteHomeBackgroundUrl = fileUrl;
      }

      return res.status(200).json({
        success: true,
        fileUrl,
      });
    },
    {
      context: "upload image configuration portfolio",
      fileTooLargeMessage:
        "Le fichier est trop volumineux. La taille maximale autorisée est de 8 Mo.",
    }
  )
);