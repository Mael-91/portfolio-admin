import path from "node:path";
import { Router } from "express";
import { z } from "zod";
import { requireAccountAccess } from "../rbac/account-access.middleware";
import {
  createPortfolioImage,
  getPortfolioImagesStorageDir,
  editPortfolioImage,
  listPortfolioImages,
  removePortfolioImage,
  reorderPortfolioImages,
} from "./portfolio.service";
import { portfolioImageExtension, portfolioUpload } from "./portfolio.upload";
import { handleRouteError } from "../common/handle-route-error";
import fs from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { imagePermissions } from "../rbac/content-permissions";
import { accessDenied } from "../rbac/role-transaction";
import { handleUpload } from "../common/handle-upload";

export const portfolioRouter = Router();

portfolioRouter.get("/", requireAccountAccess("images.read"), async (_req, res) => {
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

portfolioRouter.post("/", requireAccountAccess("images.add"),
  handleUpload(
    portfolioUpload.single("image"),
    async (req, res) => {
      const schema = z.object({
        caption: z.string().trim().min(1).max(255),
        altText: z.string().trim().min(1).max(255),
        description: z.string().trim().max(5000).optional(),
        isActive: z.stringbool().optional(),
        displayOrder: z.preprocess(
          (value) => {
            if (
              value === undefined ||
              value === null ||
              value === ""
            ) {
              return undefined;
            }
            return value;
          },
          z.coerce.number().int().min(1).optional()
        ),
      });

      const body = schema.parse(req.body);

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Aucune image fournie.",
        });
      }

      const { permissions } = res.locals.accountAccess;
      const isActive = body.isActive ?? false;
      if (imagePermissions(body, true).some((code) => !permissions.includes(code))) throw accessDenied();

      const fileName = `${randomUUID()}${portfolioImageExtension(req.file.mimetype)}`;
      const filePath = path.resolve(getPortfolioImagesStorageDir(), fileName);
      const fileUrl = `/uploads/portfolio-images/${fileName}`;
      await fs.writeFile(filePath, req.file.buffer, { flag: "wx" });

      const image = await createPortfolioImage({
        caption: body.caption,
        altText: body.altText,
        description: body.description,
        fileName,
        filePath,
        fileUrl,
        mimeType: req.file.mimetype,
        isActive,
        displayOrder: body.displayOrder,
      });

      return res.status(201).json({
        success: true,
        ...(permissions.includes("images.read") ? { image } : { id: image.id }),
      });
    },
    {
      context: "création de l'image du portfolio",
      fileTooLargeMessage:
        "Le fichier est trop volumineux. La taille maximale autorisée est de 5 Mo.",
    }
  )
);

portfolioRouter.patch("/:id", requireAccountAccess(), async (req, res) => {
  try {
    const paramsSchema = z.object({
      id: z.coerce.number().int().min(1),
    });

    const bodySchema = z.strictObject({
      caption: z.string().trim().min(1).max(255).optional(),
      altText: z.string().trim().min(1).max(255).optional(),
      description: z.string().trim().max(5000).optional(),
      isActive: z.boolean().optional(),
      displayOrder: z.number().int().min(1).optional(),
    }).refine((body) => Object.keys(body).length > 0, "Aucune modification fournie");

    const params = paramsSchema.parse(req.params);
    const body = bodySchema.parse(req.body);
    const { permissions } = res.locals.accountAccess;
    if (imagePermissions(body, false).some((code) => !permissions.includes(code))) throw accessDenied();

    const image = await editPortfolioImage({ id: params.id, ...body });
    return res.json({
      success: true,
      ...(permissions.includes("images.read") ? { image } : { id: params.id }),
    });
  } catch (error) {
    return handleRouteError(
      res,
      error,
      "Mise à jour de l'image du portfolio"
    );
  }
});

portfolioRouter.patch("/reorder/all", requireAccountAccess("images.reorder"), async (req, res) => {
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

    await reorderPortfolioImages(body.items);

    return res.status(200).json({
      success: true,
    });
  } catch (error: any) {
    return handleRouteError(res, error, "Erreur dans le réordonnancement des images du portfolio");
  }
});

portfolioRouter.delete("/:id", requireAccountAccess("images.delete"), async (req, res) => {
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