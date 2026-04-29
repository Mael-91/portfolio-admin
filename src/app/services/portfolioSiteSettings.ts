import { apiFetch } from "./api";

export type PortfolioSiteSettings = {
  siteTitle: string;
  siteDescription: string;
  siteFaviconUrl: string;

  homeTitle: string;
  homeSubtitle: string;
  homeBackgroundImageUrl: string;

  gallerySectionTitle: string;
  gallerySectionSubtitle: string;

  contactSectionTitle: string;
  contactSectionSubtitle: string;

  contactOptionProEnabled: boolean;
  contactOptionPrivateEnabled: boolean;
  contactOptionInfoEnabled: boolean;

  contactSubmitButtonLabel: string;
};

export async function fetchPortfolioSiteSettings() {
  return apiFetch<{
    success: true;
    settings: PortfolioSiteSettings;
  }>("/api/portfolio-site-settings");
}

export async function savePortfolioSiteSettings(
  payload: PortfolioSiteSettings
) {
  return apiFetch<{
    success: true;
    settings: PortfolioSiteSettings;
  }>("/api/portfolio-site-settings", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function uploadPortfolioSiteImage(
  file: File,
  target: "siteFaviconUrl" | "homeBackgroundImageUrl"
) {
  const formData = new FormData();
  formData.append("image", file);
  formData.append("target", target);

  return apiFetch<{
    success: true;
    fileUrl: string;
  }>("/api/portfolio-site-settings/upload", {
    method: "POST",
    body: formData,
  });
}