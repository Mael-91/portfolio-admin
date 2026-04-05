import fs from "fs/promises";
import path from "path";
import { getStoragePath, STORAGE_FOLDER } from "../common/storagePath";

export async function deleteAboutImageIfExists(
  imageUrl: string | null | undefined
) {
  if (!imageUrl) return;

  if (!imageUrl.startsWith("/uploads/about/")) {
    return;
  }

  const filename = imageUrl.replace("/uploads/about/", "").trim();

  if (!filename) return;

  const filePath = path.join(getStoragePath(STORAGE_FOLDER.about), filename);

  try {
    await fs.unlink(filePath);
  } catch (error: any) {
    if (error?.code !== "ENOENT") {
      throw error;
    }
  }
}