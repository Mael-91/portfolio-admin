import { env } from "../../env";

export async function fetchSettingsGeneral() {
  const res = await fetch(`${env.apiBaseUrl}/api/settings/general`, {
    credentials: "include",
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Erreur chargement paramètres généraux");
  }

  return data;
}

export async function saveSettingsGeneral(payload: {
  siteName: string;
  siteDescription: string;
  siteLogoUrl: string;
  siteSidebarLogoUrl: string;
}) {
  const res = await fetch(`${env.apiBaseUrl}/api/settings/general`, {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Erreur sauvegarde paramètres généraux");
  }

  return data;
}

export async function uploadGeneralLogo(
  file: File,
  target: "siteLogoUrl" | "siteSidebarLogoUrl"
) {
  const formData = new FormData();
  formData.append("logo", file);
  formData.append("target", target);

  const res = await fetch(`${env.apiBaseUrl}/api/settings/general/upload-logo`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Erreur upload logo");
  }

  return data;
}