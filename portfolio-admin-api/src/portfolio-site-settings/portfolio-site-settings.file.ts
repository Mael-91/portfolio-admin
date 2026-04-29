import fs from "fs/promises";
import path from "path";
import { getStoragePath } from "../common/storagePath";

export async function deletePortfolioSiteImageIfExists(
  imageUrl: string | null | undefined
) {
  if (!imageUrl) return;

  if (!imageUrl.startsWith("/uploads/portfolio-site-settings/")) {
    return;
  }

  const filename = imageUrl.replace("/uploads/portfolio-site-settings/", "");
  if (!filename) return;

  const filePath = path.join(getStoragePath("portfolio-site-settings"), filename);

  try {
    await fs.unlink(filePath);
  } catch (error: any) {
    if (error?.code !== "ENOENT") {
      throw error;
    }
  }
}