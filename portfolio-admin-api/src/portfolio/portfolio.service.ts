import fs from "node:fs/promises";
import path from "node:path";
import {
  deletePortfolioImageById,
  findPortfolioImageById,
  findPortfolioImages,
  getNextActivePortfolioDisplayOrder,
  insertPortfolioImage,
  updatePortfolioImage,
  updatePortfolioImageOrder,
  normalizeActivePortfolioImageOrders,
  moveActivePortfolioImageToOrder,
} from "./portfolio.repository";
import { AppError } from "../common/app-error";
import { getStoragePath } from "../common/storagePath";

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
  displayOrder?: number | null;
}) {
  const isActive = params.isActive ?? true;

  const displayOrder =
    isActive && params.displayOrder && params.displayOrder > 0
      ? params.displayOrder
      : isActive
      ? await getNextActivePortfolioDisplayOrder()
      : null;

  const id = await insertPortfolioImage({
    caption: params.caption,
    altText: params.altText,
    description: params.description ?? null,
    fileName: params.fileName,
    filePath: params.filePath,
    fileUrl: params.fileUrl,
    mimeType: params.mimeType,
    displayOrder,
    isActive,
  });

  if (isActive && params.displayOrder && params.displayOrder > 0) {
    await moveActivePortfolioImageToOrder(id, params.displayOrder);
  } else {
    await normalizeActivePortfolioImageOrders();
  }

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
  displayOrder?: number | null;
}) {
  const existing = await findPortfolioImageById(params.id);

  if (!existing) {
    throw new AppError({
      code: "PORTFOLIO_IMAGE_NOT_FOUND",
      message: "L'image du portfolio n'a pas été trouvée.",
      statusCode: 404,
    });
  }

  const wasActive = Boolean(existing.is_active);

  let displayOrder: number | null = null;

  if (params.isActive) {
    displayOrder =
      params.displayOrder && params.displayOrder > 0
        ? params.displayOrder
        : wasActive
        ? Number(existing.display_order ?? 1)
        : await getNextActivePortfolioDisplayOrder();
  }

  await updatePortfolioImage({
    id: params.id,
    caption: params.caption,
    altText: params.altText,
    description: params.description ?? null,
    isActive: params.isActive,
    displayOrder,
  });

  if (params.isActive && params.displayOrder && params.displayOrder > 0) {
    await moveActivePortfolioImageToOrder(params.id, params.displayOrder);
  } else {
    await normalizeActivePortfolioImageOrders();
  }

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

export async function reorderPortfolioImages(
  items: Array<{ id: number; displayOrder: number }>
) {
  await updatePortfolioImageOrder(items);
  await normalizeActivePortfolioImageOrders();

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
  await normalizeActivePortfolioImageOrders();

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
  return getStoragePath("portfolio-images");
}