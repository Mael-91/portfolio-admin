import { Router } from "express";
import { z } from "zod";
import { requireAccountAccess } from "../rbac/account-access.middleware";
import { handleRouteError } from "../common/handle-route-error";
import { fetchAboutContent, saveAboutContent } from "./about.service";
import { aboutUpload } from "./about.upload";
import { deleteAboutImageIfExists } from "./about.file";
import { cleanupOrphanAboutImages } from "./about.cleanup";
import { handleUpload } from "../common/handle-upload";

export const aboutRouter = Router();

aboutRouter.get("/", requireAccountAccess("about.read"), async (_req, res) => {
  try {
    const about = await fetchAboutContent();

    return res.status(200).json({
      success: true,
      about,
    });
  } catch (error) {
    return handleRouteError(res, error, "lecture page à propos");
  }
});

aboutRouter.put("/", requireAccountAccess("about.write"), async (req, res) => {
  try {
    const schema = z.object({
      textHtml: z.string(),
      imageUrl: z.string().optional(),
      imageAlt: z.string().optional(),
      instagramButtonLabel: z.string().max(100).optional(),
      instagramButtonUrl: z.string().max(500).optional(),
    });

    const body = schema.parse(req.body);

    const about = await saveAboutContent({
      textHtml: body.textHtml,
      imageUrl: body.imageUrl ?? "",
      imageAlt: body.imageAlt ?? "",
      instagramButtonLabel: body.instagramButtonLabel ?? "",
      instagramButtonUrl: body.instagramButtonUrl ?? "",
    });

    if (req.session.pendingAboutImageUrl) {
      delete req.session.pendingAboutImageUrl;
    }

    return res.status(200).json({
      success: true,
      ...(res.locals.accountAccess.permissions.includes("about.read") ? { about } : {}),
    });
  } catch (error) {
    return handleRouteError(res, error, "sauvegarde page à propos");
  }
});

aboutRouter.post(
  "/upload-image", requireAccountAccess("about.upload"),
  handleUpload(
    aboutUpload.single("image"),
    async (req, res) => {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Aucune image fournie.",
        });
      }

      const newFileUrl = `/uploads/about/${req.file.filename}`;
      const previousPendingImageUrl = req.session.pendingAboutImageUrl;

      if (previousPendingImageUrl && previousPendingImageUrl !== newFileUrl) {
        await deleteAboutImageIfExists(previousPendingImageUrl);
      }

      req.session.pendingAboutImageUrl = newFileUrl;

      return res.status(200).json({
        success: true,
        fileUrl: newFileUrl,
      });
    },
    {
      context: "upload image à propos",
      fileTooLargeMessage:
        "Le fichier est trop volumineux. La taille maximale autorisée est de 8 Mo.",
    }
  )
);

aboutRouter.post("/cleanup-orphans", requireAccountAccess("about.cleanup"), async (_req, res) => {
  try {
    const result = await cleanupOrphanAboutImages();

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    return handleRouteError(res, error, "nettoyage images orphelines à propos");
  }
});