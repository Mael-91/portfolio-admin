import { apiFetch } from "./api";

export type LegalDocumentStatus = "draft" | "published" | "archived";

export type LegalDocument = {
  id: number;
  documentType: string;
  title: string;
  slug: string;
  versionLabel: string;
  status: LegalDocumentStatus;
  isCurrent: boolean;
  contentHtml: string;
  contentText: string | null;
  archiveFilePath: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export async function fetchLegalDocuments(documentType?: string) {
  const query = documentType
    ? `?documentType=${encodeURIComponent(documentType)}`
    : "";

  return apiFetch<{
    success: true;
    documents: LegalDocument[];
  }>(`/api/legal${query}`);
}

export async function fetchLegalDocumentById(id: number) {
  return apiFetch<{
    success: true;
    document: LegalDocument;
  }>(`/api/legal/${id}`);
}

export async function createLegalDocument(payload: {
  documentType: string;
  title: string;
  slug: string;
  versionLabel: string;
  contentHtml: string;
}) {
  return apiFetch<{
    success: true;
    document: LegalDocument;
  }>("/api/legal", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateLegalDocument(
  id: number,
  payload: {
    title: string;
    slug: string;
    versionLabel: string;
    contentHtml: string;
  }
) {
  return apiFetch<{
    success: true;
    document: LegalDocument;
  }>(`/api/legal/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function publishLegalDocument(id: number) {
  return apiFetch<{
    success: true;
    document: LegalDocument;
  }>(`/api/legal/${id}/publish`, {
    method: "POST",
  });
}

export async function archiveLegalDocument(id: number) {
  return apiFetch<{
    success: true;
    document: LegalDocument;
  }>(`/api/legal/${id}/archive`, {
    method: "POST",
  });
}

export async function deleteLegalDocument(id: number) {
  return apiFetch<{
    success: true;
  }>(`/api/legal/${id}`, {
    method: "DELETE",
  });
}