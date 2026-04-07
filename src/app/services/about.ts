import { apiFetch } from "./api";

export async function fetchAboutContent() {
  return apiFetch<{
    success: true;
    about: {
      textHtml: string;
      imageAlt: string;
      imageUrl: string;
    };
  }>("/api/about");
}

export async function saveAboutContent(payload: {
  textHtml: string;
  imageAlt: string;
  imageUrl: string;
}) {
  return apiFetch<{
    success: true;
    about: {
      textHtml: string;
      imageAlt: string;
      imageUrl: string;
    };
  }>("/api/about", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function uploadAboutImage(file: File) {
  const formData = new FormData();
  formData.append("image", file);

  return apiFetch<{
    success: true;
    fileUrl: string;
  }>("/api/about/upload-image", {
    method: "POST",
    body: formData,
  });
}

export async function cleanupOrphanAboutImages() {
  return apiFetch<{
    success: true;
    scannedCount: number;
    deletedCount: number;
    keptCount: number;
    deletedFiles: string[];
  }>("/api/about/cleanup-orphans", {
    method: "POST",
  });
}