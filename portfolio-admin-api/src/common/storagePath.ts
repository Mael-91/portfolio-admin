import path from "path";

const storageEnv = process.env.STORAGE_ENV || "dev";

export const STORAGE_FOLDER = {
  portfolio: "portfolio-images",
  legal: "legal-documents-archives",
  logos: "logos",
  about: "about-section-photo",
  portfolioSiteSettings: "portfolio-site-settings",
} as const;

export function getStorageBasePath() {
  return path.join(process.cwd(), "storage", storageEnv);
}

export function getStoragePath(subFolder: string) {
  return path.join(getStorageBasePath(), subFolder);
}