import fs from "fs/promises";
import path from "path";
import { getStoragePath, STORAGE_FOLDER } from "../common/storagePath";

function extractLogoFilename(logoUrl: string | null | undefined) {
  if (!logoUrl) return null;
  if (!logoUrl.startsWith("/uploads/logos/")) return null;

  const filename = logoUrl.replace("/uploads/logos/", "").trim();
  return filename || null;
}

export async function deleteLogoIfExists(logoUrl: string | null | undefined) {
  const filename = extractLogoFilename(logoUrl);
  if (!filename) return;

  const filePath = path.join(getStoragePath(STORAGE_FOLDER.logos), filename);

  try {
    await fs.unlink(filePath);
  } catch (error: any) {
    if (error?.code !== "ENOENT") {
      throw error;
    }
  }
}