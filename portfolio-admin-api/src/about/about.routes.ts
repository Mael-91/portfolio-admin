import { Router } from "express";
import { z } from "zod";
import { requireAdminAuth } from "../auth/auth.middleware";
import { handleRouteError } from "../common/handle-route-error";
import { fetchAboutContent, saveAboutContent } from "./about.service";
import { aboutUpload } from "./about.upload";

export const aboutRouter = Router();

aboutRouter.use(requireAdminAuth);

aboutRouter.get("/", async (_req, res) => {
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

aboutRouter.put("/", async (req, res) => {
  try {
    const schema = z.object({
      textHtml: z.string(),
      imageAlt: z.string().trim().max(255),
      imageUrl: z.string().trim().max(500),
    });

    const body = schema.parse(req.body);
    const about = await saveAboutContent(body);

    return res.status(200).json({
      success: true,
      about,
    });
  } catch (error) {
    return handleRouteError(res, error, "sauvegarde page à propos");
  }
});

aboutRouter.post(
  "/upload-image",
  aboutUpload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Aucune image fournie.",
        });
      }

      return res.status(200).json({
        success: true,
        fileUrl: `/uploads/about/${req.file.filename}`,
      });
    } catch (error) {
      return handleRouteError(res, error, "upload image à propos");
    }
  }
);