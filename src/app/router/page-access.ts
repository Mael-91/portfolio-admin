export const PAGE_PERMISSIONS: Readonly<Record<string, string>> = {
  "/messages": "messages.read",
  "/portfolio-images": "images.read",
  "/portfolio/settings": "portfolio_settings.read",
  "/prestations": "services.read",
  "/about": "about.read",
  "/legal": "legal.read",
  "/settings/rgpd": "rgpd.read",
  "/settings/users": "users.read",
  "/settings/general": "general.read",
};
