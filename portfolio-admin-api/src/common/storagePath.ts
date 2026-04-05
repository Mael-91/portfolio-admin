import path from "path";

const storageEnv = process.env.STORAGE_ENV || "dev";

export function getStorageBasePath(folerName?: string) {
  return path.join(process.cwd(), "storage", storageEnv, folerName ?? "");
}

export function getStoragePath(subFolder: string) {
  return path.join(getStorageBasePath(), subFolder);
}