import { AppError } from "../common/app-error";
import {
  findPortfolioSiteSettings,
  updatePortfolioSiteSettings,
} from "./portfolio-site-settings.repository";
import { deletePortfolioSiteImageIfExists } from "./portfolio-site-settings.file";

function mapSettings(row: any) {
  return {
    siteTitle: row.site_title ?? "",
    siteDescription: row.site_description ?? "",
    siteFaviconUrl: row.site_favicon_url ?? "",

    homeTitle: row.home_title ?? "",
    homeSubtitle: row.home_subtitle ?? "",
    homeBackgroundImageUrl: row.home_background_image_url ?? "",

    gallerySectionTitle: row.gallery_section_title ?? "",
    gallerySectionSubtitle: row.gallery_section_subtitle ?? "",

    contactSectionTitle: row.contact_section_title ?? "",
    contactSectionSubtitle: row.contact_section_subtitle ?? "",

    contactOptionProEnabled: Boolean(row.contact_option_pro_enabled),
    contactOptionPrivateEnabled: Boolean(row.contact_option_private_enabled),
    contactOptionInfoEnabled: Boolean(row.contact_option_info_enabled),

    contactSubmitButtonLabel: row.contact_submit_button_label ?? "Envoyer",
  };
}

export async function getPortfolioSiteSettings() {
  const settings = await findPortfolioSiteSettings();

  if (!settings) {
    throw new AppError({
      code: "PORTFOLIO_SITE_SETTINGS_NOT_FOUND",
      message: "La configuration portfolio est introuvable.",
      statusCode: 404,
    });
  }

  return mapSettings(settings);
}

export async function savePortfolioSiteSettings(input: {
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
}) {
  const current = await findPortfolioSiteSettings();

  if (!current) {
    throw new AppError({
      code: "PORTFOLIO_SITE_SETTINGS_NOT_FOUND",
      message: "La configuration portfolio est introuvable.",
      statusCode: 404,
    });
  }

  const previousFaviconUrl = current.site_favicon_url ?? "";
  const previousHomeBackgroundUrl = current.home_background_image_url ?? "";

  const updated = await updatePortfolioSiteSettings({
    siteTitle: input.siteTitle,
    siteDescription: input.siteDescription,
    siteFaviconUrl: input.siteFaviconUrl || null,
    homeTitle: input.homeTitle,
    homeSubtitle: input.homeSubtitle,
    homeBackgroundImageUrl: input.homeBackgroundImageUrl || null,
    gallerySectionTitle: input.gallerySectionTitle,
    gallerySectionSubtitle: input.gallerySectionSubtitle,
    contactSectionTitle: input.contactSectionTitle,
    contactSectionSubtitle: input.contactSectionSubtitle,
    contactOptionProEnabled: input.contactOptionProEnabled,
    contactOptionPrivateEnabled: input.contactOptionPrivateEnabled,
    contactOptionInfoEnabled: input.contactOptionInfoEnabled,
    contactSubmitButtonLabel: input.contactSubmitButtonLabel,
  });

  if (previousFaviconUrl && previousFaviconUrl !== input.siteFaviconUrl) {
    await deletePortfolioSiteImageIfExists(previousFaviconUrl);
  }

  if (
    previousHomeBackgroundUrl &&
    previousHomeBackgroundUrl !== input.homeBackgroundImageUrl
  ) {
    await deletePortfolioSiteImageIfExists(previousHomeBackgroundUrl);
  }

  return mapSettings(updated);
}