import { db } from "../db/db";

export async function findPortfolioSiteSettings() {
  const [rows]: any = await db.execute(
    `SELECT * FROM portfolio_site_settings ORDER BY id ASC LIMIT 1`
  );

  return rows[0] ?? null;
}

export async function updatePortfolioSiteSettings(data: {
  siteTitle: string;
  siteDescription: string;
  siteFaviconUrl: string | null;
  homeTitle: string;
  homeSubtitle: string;
  homeBackgroundImageUrl: string | null;
  gallerySectionTitle: string;
  gallerySectionSubtitle: string;
  contactSectionTitle: string;
  contactSectionSubtitle: string;
  contactOptionProEnabled: boolean;
  contactOptionPrivateEnabled: boolean;
  contactOptionInfoEnabled: boolean;
  contactSubmitButtonLabel: string;
}) {
  await db.execute(
    `
    UPDATE portfolio_site_settings
    SET
      site_title = ?,
      site_description = ?,
      site_favicon_url = ?,
      home_title = ?,
      home_subtitle = ?,
      home_background_image_url = ?,
      gallery_section_title = ?,
      gallery_section_subtitle = ?,
      contact_section_title = ?,
      contact_section_subtitle = ?,
      contact_option_pro_enabled = ?,
      contact_option_private_enabled = ?,
      contact_option_info_enabled = ?,
      contact_submit_button_label = ?
    ORDER BY id ASC
    LIMIT 1
    `,
    [
      data.siteTitle,
      data.siteDescription,
      data.siteFaviconUrl,
      data.homeTitle,
      data.homeSubtitle,
      data.homeBackgroundImageUrl,
      data.gallerySectionTitle,
      data.gallerySectionSubtitle,
      data.contactSectionTitle,
      data.contactSectionSubtitle,
      data.contactOptionProEnabled ? 1 : 0,
      data.contactOptionPrivateEnabled ? 1 : 0,
      data.contactOptionInfoEnabled ? 1 : 0,
      data.contactSubmitButtonLabel,
    ]
  );

  return findPortfolioSiteSettings();
}