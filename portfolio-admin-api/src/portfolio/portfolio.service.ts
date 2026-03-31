import fs from "node:fs/promises";
import path from "node:path";
import {
  deletePortfolioImageById,
  findPortfolioImageById,
  findPortfolioImages,
  getNextPortfolioDisplayOrder,
  insertPortfolioImage,
  updatePortfolioImage,
  updatePortfolioImageOrder,
} from "./portfolio.repository";
import { AppError } from "../common/app-error";

function sanitizeImage(row: any) {
  return {
    id: row.id,
    caption: row.caption,
    altText: row.alt_text,
    description: row.description,
    fileName: row.file_name,
    filePath: row.file_path,
    fileUrl: row.file_url,
    mimeType: row.mime_type,
    displayOrder: row.display_order,
    isActive: Boolean(row.is_active),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listPortfolioImages() {
  const rows = await findPortfolioImages();
  return rows.map(sanitizeImage);
}

export async function createPortfolioImage(params: {
  caption: string;
  altText: string;
  description?: string;
  fileName: string;
  filePath: string;
  fileUrl: string;
  mimeType: string;
  isActive?: boolean;
}) {
  const displayOrder = await getNextPortfolioDisplayOrder();

  const id = await insertPortfolioImage({
    caption: params.caption,
    altText: params.altText,
    description: params.description ?? null,
    fileName: params.fileName,
    filePath: params.filePath,
    fileUrl: params.fileUrl,
    mimeType: params.mimeType,
    displayOrder,
    isActive: params.isActive ?? true,
  });

  const image = await findPortfolioImageById(id);

  if (!image) {
    throw new AppError({
      code: "PORTFOLIO_IMAGE_NOT_FOUND_AFTER_CREATE",
      message: "L'image du portfolio n'a pas été trouvée après sa création.",
      statusCode: 404,
    });
  }

  return sanitizeImage(image);
}

export async function editPortfolioImage(params: {
  id: number;
  caption: string;
  altText: string;
  description?: string;
  isActive: boolean;
}) {
  const existing = await findPortfolioImageById(params.id);

  if (!existing) {
    throw new AppError({
      code: "PORTFOLIO_IMAGE_NOT_FOUND",
      message: "L'image du portfolio n'a pas été trouvée après sa mise à jour.",
      statusCode: 404,
    });
  }

  await updatePortfolioImage({
    id: params.id,
    caption: params.caption,
    altText: params.altText,
    description: params.description ?? null,
    isActive: params.isActive,
  });

  const updated = await findPortfolioImageById(params.id);

  if (!updated) {
    throw new AppError({
      code: "PORTFOLIO_IMAGE_NOT_FOUND",
      message: "L'image du portfolio n'a pas été trouvée après sa mise à jour.",
      statusCode: 404,
    });
  }

  return sanitizeImage(updated);
}

export async function reorderPortfolioImages(items: Array<{ id: number; displayOrder: number }>) {
  await updatePortfolioImageOrder(items);
  return listPortfolioImages();
}

export async function removePortfolioImage(id: number) {
  const existing = await findPortfolioImageById(id);

  if (!existing) {
    throw new AppError({
      code: "PORTFOLIO_IMAGE_NOT_FOUND",
      message: "L'image du portfolio n'a pas été trouvée",
      statusCode: 404,
    });
  }

  await deletePortfolioImageById(id);

  try {
    await fs.unlink(existing.file_path);
  } catch (error: any) {
    if (error?.code !== "ENOENT") {
      throw error;
    }
  }

  return { success: true };
}

export function getPortfolioImagesStorageDir() {
  return path.resolve(process.cwd(), "storage", "portfolio-images");
}