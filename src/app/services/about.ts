import { env } from "../../env";

function extractApiErrorMessage(data: any, fallback: string) {
  if (typeof data?.message === "string" && data.message.trim()) {
    return data.message;
  }

  if (Array.isArray(data?.errors) && data.errors.length > 0) {
    return data.errors
      .map((error: any) => error?.message)
      .filter(Boolean)
      .join(" ");
  }

  return fallback;
}

export async function fetchAboutContent() {
  const res = await fetch(`${env.apiBaseUrl}/api/about`, {
    credentials: "include",
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(extractApiErrorMessage(data, "Erreur chargement page à propos"));
  }

  return data;
}

export async function saveAboutContent(payload: {
  textHtml: string;
  imageAlt: string;
  imageUrl: string;
}) {
  const res = await fetch(`${env.apiBaseUrl}/api/about`, {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(extractApiErrorMessage(data, "Erreur sauvegarde page à propos"));
  }

  return data;
}

export async function uploadAboutImage(file: File) {
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(`${env.apiBaseUrl}/api/about/upload-image`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(extractApiErrorMessage(data, "Erreur upload image à propos"));
  }

  return data;
}