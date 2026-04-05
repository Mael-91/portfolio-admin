import fs from "fs";
import { getStoragePath } from "./storagePath";

export function ensureStorageFolders() {
  const folders = [
    "portfolio-images",
    "legal-documents",
    "logos",
  ];

  for (const folder of folders) {
    const fullPath = getStoragePath(folder);

    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
  }
}