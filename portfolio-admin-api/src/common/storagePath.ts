import path from "path";

const storageEnv = process.env.STORAGE_ENV || "dev";

export function getStorageBasePath() {
  return path.join(process.cwd(), "storage", storageEnv);
}

export function getStoragePath(subFolder: string) {
  return path.join(getStorageBasePath(), subFolder);
}