import { apiFetch } from "./api";

export async function fetchPublicGeneralSettings() {
  return apiFetch<{
    success: true;
    settings: {
      siteName: string;
      siteDescription: string;
      siteLogoUrl: string;
      siteSidebarLogoUrl: string;
    };
  }>("/api/settings/general/public");
}

export async function fetchSettingsGeneral() {
  return apiFetch<{
    success: true;
    settings: {
      siteName: string;
      siteDescription: string;
      siteLogoUrl: string;
      siteSidebarLogoUrl: string;
    };
    storage: {
      portfolioImagesSize: number;
      legalArchivesSize: number;
      logosSize: number;
      totalSize: number;
    };
  }>("/api/settings/general");
}

export async function saveSettingsGeneral(payload: {
  siteName: string;
  siteDescription: string;
  siteLogoUrl: string;
  siteSidebarLogoUrl: string;
}) {
  return apiFetch<{
    success: true;
    settings: {
      siteName: string;
      siteDescription: string;
      siteLogoUrl: string;
      siteSidebarLogoUrl: string;
    };
  }>("/api/settings/general", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function uploadGeneralLogo(
  file: File,
  target: "siteLogoUrl" | "siteSidebarLogoUrl"
) {
  const formData = new FormData();
  formData.append("logo", file);
  formData.append("target", target);

  return apiFetch<{
    success: true;
    fileUrl: string;
  }>("/api/settings/general/upload-logo", {
    method: "POST",
    body: formData,
  });
}