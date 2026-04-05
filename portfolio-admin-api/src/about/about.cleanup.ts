import fs from "fs/promises";
import path from "path";
import { getStoragePath } from "../common/storagePath"
import { getAboutContent } from "./about.repository";

function extractFilenameFromAboutUrl(imageUrl: string | null | undefined) {
  if (!imageUrl) return null;
  if (!imageUrl.startsWith("/uploads/about/")) return null;

  const filename = imageUrl.replace("/uploads/about/", "").trim();
  return filename || null;
}

export async function cleanupOrphanAboutImages() {
  const aboutDir = getStoragePath("about");

  let files: string[] = [];
  try {
    files = await fs.readdir(aboutDir);
  } catch (error: any) {
    if (error?.code === "ENOENT") {
      return {
        scannedCount: 0,
        deletedCount: 0,
        keptCount: 0,
        deletedFiles: [] as string[],
      };
    }

    throw error;
  }

  const aboutContent = await getAboutContent();
  const activeFilename = extractFilenameFromAboutUrl(aboutContent?.image_url);

  const filesToKeep = new Set<string>();
  if (activeFilename) {
    filesToKeep.add(activeFilename);
  }

  const deletedFiles: string[] = [];

  for (const file of files) {
    if (filesToKeep.has(file)) {
      continue;
    }

    const fullPath = path.join(aboutDir, file);
    const stat = await fs.stat(fullPath);

    if (!stat.isFile()) {
      continue;
    }

    await fs.unlink(fullPath);
    deletedFiles.push(file);
  }

  return {
    scannedCount: files.length,
    deletedCount: deletedFiles.length,
    keptCount: files.length - deletedFiles.length,
    deletedFiles,
  };
}