import path from "node:path";
import { Router } from "express";
import { z } from "zod";
import { requireAdminAuth } from "../auth/auth.middleware";
import {
  createPortfolioImage,
  editPortfolioImage,
  listPortfolioImages,
  removePortfolioImage,
  reorderPortfolioImages,
} from "./portfolio.service";
import { portfolioUpload } from "./portfolio.upload";
import { handleRouteError } from "../common/handle-route-error";

export const portfolioRouter = Router();

portfolioRouter.use(requireAdminAuth);

portfolioRouter.get("/", async (_req, res) => {
  try {
    const images = await listPortfolioImages();

    return res.status(200).json({
      success: true,
      images,
    });
  } catch (error) {
    return handleRouteError(res, error, "Erreur dans le chargement des images du portfolio");
  }
});

portfolioRouter.post("/", portfolioUpload.single("image"), async (req, res) => {
  try {
    const schema = z.object({
      caption: z.string().trim().min(1).max(255),
      altText: z.string().trim().min(1).max(255),
      description: z.string().trim().max(5000).optional(),
      isActive: z.coerce.boolean().optional(),
    });

    const body = schema.parse(req.body);

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Aucun fichier image fourni",
      });
    }

    const fileUrl = `/uploads/portfolio-images/${req.file.filename}`;
    const filePath = path.resolve(req.file.path);

    const image = await createPortfolioImage({
      caption: body.caption,
      altText: body.altText,
      description: body.description,
      fileName: req.file.filename,
      filePath,
      fileUrl,
      mimeType: req.file.mimetype,
      isActive: body.isActive ?? true,
    });

    return res.status(201).json({
      success: true,
      image,
    });
  } catch (error: any) {
    return handleRouteError(res, error, "Erreur dans la création de l'image du portfolio");
  }
});

portfolioRouter.patch("/:id", async (req, res) => {
  try {
    const paramsSchema = z.object({
      id: z.coerce.number().int().min(1),
    });

    const bodySchema = z.object({
      caption: z.string().trim().min(1).max(255),
      altText: z.string().trim().min(1).max(255),
      description: z.string().trim().max(5000).optional(),
      isActive: z.coerce.boolean().optional(),
    });

    const params = paramsSchema.parse(req.params);
    const body = bodySchema.parse(req.body);

    const image = await editPortfolioImage({
      id: params.id,
      caption: body.caption,
      altText: body.altText,
      description: body.description,
      isActive: body.isActive ?? true,
    });

    return res.status(200).json({
      success: true,
      image,
    });
  } catch (error: any) {
    return handleRouteError(res, error, "Erreur dans la mise à jour de l'image du portfolio");
  }
});

portfolioRouter.patch("/reorder/all", async (req, res) => {
  try {
    const schema = z.object({
      items: z.array(
        z.object({
          id: z.number().int().min(1),
          displayOrder: z.number().int().min(1),
        })
      ),
    });

    const body = schema.parse(req.body);

    const images = await reorderPortfolioImages(body.items);

    return res.status(200).json({
      success: true,
      images,
    });
  } catch (error: any) {
    return handleRouteError(res, error, "Erreur dans le réordonnancement des images du portfolio");
  }
});

portfolioRouter.delete("/:id", async (req, res) => {
  try {
    const paramsSchema = z.object({
      id: z.coerce.number().int().min(1),
    });

    const params = paramsSchema.parse(req.params);

    await removePortfolioImage(params.id);

    return res.status(200).json({
      success: true,
    });
  } catch (error: any) {
    return handleRouteError(res, error, "Erreur dans la suppression de l'image du portfolio");
  }
});