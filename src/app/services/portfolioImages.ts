import { env } from "../../env";

export type PortfolioImage = {
  id: number;
  caption: string;
  altText: string;
  description?: string | null;
  fileName: string;
  filePath: string;
  fileUrl: string;
  mimeType: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export async function fetchPortfolioImages() {
  const res = await fetch(`${env.apiBaseUrl}/api/portfolio-images`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Erreur récupération portfolio");
  }

  return res.json();
}

export async function createPortfolioImage(formData: FormData) {
  const res = await fetch(`${env.apiBaseUrl}/api/portfolio-images`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Erreur création image");
  }

  return data;
}

export async function updatePortfolioImage(
  id: number,
  payload: {
    caption: string;
    altText: string;
    description?: string;
    isActive: boolean;
  }
) {
  const res = await fetch(`${env.apiBaseUrl}/api/portfolio-images/${id}`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Erreur modification image");
  }

  return data;
}

export async function reorderPortfolioImages(
  items: Array<{ id: number; displayOrder: number }>
) {
  const res = await fetch(`${env.apiBaseUrl}/api/portfolio-images/reorder/all`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ items }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Erreur réorganisation images");
  }

  return data;
}

export async function deletePortfolioImage(id: number) {
  const res = await fetch(`${env.apiBaseUrl}/api/portfolio-images/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Erreur suppression image");
  }

  return data;
}