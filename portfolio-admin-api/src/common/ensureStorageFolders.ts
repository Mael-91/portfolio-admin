import fs from "fs";
import { getStoragePath, STORAGE_FOLDER } from "./storagePath";

export function ensureStorageFolders() {
  const folders = [
    STORAGE_FOLDER.portfolio,
    STORAGE_FOLDER.legal,
    STORAGE_FOLDER.logos,
  ];

  for (const folder of folders) {
    const fullPath = getStoragePath(folder);

    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
  }
}