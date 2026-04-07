import { apiFetch } from "./api";

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
  return apiFetch<{
    success: true;
    images: PortfolioImage[];
  }>("/api/portfolio-images");
}

export async function createPortfolioImage(formData: FormData) {
  return apiFetch("/api/portfolio-images", {
    method: "POST",
    body: formData,
  });
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
  return apiFetch(`/api/portfolio-images/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function reorderPortfolioImages(
  items: Array<{ id: number; displayOrder: number }>
) {
  return apiFetch("/api/portfolio-images/reorder/all", {
    method: "PATCH",
    body: JSON.stringify({ items }),
  });
}

export async function deletePortfolioImage(id: number) {
  return apiFetch(`/api/portfolio-images/${id}`, {
    method: "DELETE",
  });
}