import fs from "fs/promises";
import path from "path";
import { getSettingsByKeys, upsertSetting } from "./settings-general.repository";
import { getStoragePath } from "../common/storagePath";

const GENERAL_SETTING_KEYS = [
  "site_name",
  "site_description",
  "site_background_color",
  "site_button_color",
  "site_button_hover_color",
  "site_logo_url",
  "site_sidebar_logo_url",
] as const;

async function getDirectorySize(dirPath: string): Promise<number> {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    let total = 0;

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        total += await getDirectorySize(fullPath);
      } else if (entry.isFile()) {
        const stat = await fs.stat(fullPath);
        total += stat.size;
      }
    }

    return total;
  } catch {
    return 0;
  }
}

export async function getGeneralSettings() {
  const settings = await getSettingsByKeys([...GENERAL_SETTING_KEYS]);

  return {
    siteName: settings.site_name ?? "",
    siteDescription: settings.site_description ?? "",
    siteBackgroundColor: settings.site_background_color ?? "#041126",
    siteButtonColor: settings.site_button_color ?? "#2563eb",
    siteButtonHoverColor: settings.site_button_hover_color ?? "#1d4ed8",
    siteLogoUrl: settings.site_logo_url ?? "",
    siteSidebarLogoUrl: settings.site_sidebar_logo_url ?? "",
  };
}

export async function saveGeneralSettings(input: {
  siteName: string;
  siteDescription: string;
  siteBackgroundColor: string;
  siteButtonColor: string;
  siteButtonHoverColor: string;
  siteLogoUrl: string;
  siteSidebarLogoUrl: string;
}) {
  await Promise.all([
    upsertSetting("site_name", input.siteName),
    upsertSetting("site_description", input.siteDescription),
    upsertSetting("site_background_color", input.siteBackgroundColor),
    upsertSetting("site_button_color", input.siteButtonColor),
    upsertSetting("site_button_hover_color", input.siteButtonHoverColor),
    upsertSetting("site_logo_url", input.siteLogoUrl),
    upsertSetting("site_sidebar_logo_url", input.siteSidebarLogoUrl),
  ]);

  return getGeneralSettings();
}

export async function getStorageUsage() {
  const portfolioImagesSize = await getDirectorySize(
    getStoragePath("portfolio-images")
  );
  const legalArchivesSize = await getDirectorySize(
    getStoragePath("legal-archives")
  );
  const logosSize = await getDirectorySize(getStoragePath("logos"));

  return {
    portfolioImagesSize,
    legalArchivesSize,
    logosSize,
    totalSize: portfolioImagesSize + legalArchivesSize + logosSize,
  };
}