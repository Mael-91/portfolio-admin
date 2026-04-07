import { env } from "../../env";
import { apiFetch } from "./api";

export type LegalDocumentType =
  | "privacy_content"
  | "legal_notice"
  | "terms_private"
  | "terms_pro";

export type LegalTypeOption = {
  value: LegalDocumentType;
  label: string;
};

export type LegalDocumentItem = {
  id: number;
  document_type: LegalDocumentType;
  title: string;
  version_label: string;
  content_html: string;
  status: string;
  created_at: string;
  updated_at: string;
  published_at: string | null;
};

export async function fetchLegalTypes() {
  return apiFetch<{
    success: boolean;
    types: LegalTypeOption[];
  }>("/api/legal/documents/types");
}

export async function fetchCurrentLegalDocument(
  documentType: LegalDocumentType
) {
  const url = new URL(`${env.apiBaseUrl}/api/legal/documents/current`);
  url.searchParams.set("type", documentType);

  return apiFetch<{
    success: boolean;
    document: LegalDocumentItem;
  }>(url.pathname + url.search);
}

export async function fetchDraftLegalDocument(
  documentType: LegalDocumentType
) {
  const url = new URL(`${env.apiBaseUrl}/api/legal/documents/draft`);
  url.searchParams.set("type", documentType);

  return apiFetch<{
    success: boolean;
    document: LegalDocumentItem | null;
  }>(url.pathname + url.search);
}

export async function fetchLegalHistory(documentType: LegalDocumentType) {
  const url = new URL(`${env.apiBaseUrl}/api/legal/documents/history`);
  url.searchParams.set("type", documentType);

  return apiFetch<{
    success: boolean;
    documents: LegalDocumentItem[];
  }>(url.pathname + url.search);
}

export async function saveLegalDraft(payload: {
  documentType: LegalDocumentType;
  contentHtml: string;
}) {
  return apiFetch<{
    success: boolean;
    document: LegalDocumentItem;
  }>("/api/legal/documents/draft", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function publishLegalDocument(payload: {
  documentType: LegalDocumentType;
  contentHtml: string;
}) {
  return apiFetch<{
    success: boolean;
    document: LegalDocumentItem;
  }>("/api/legal/documents/publish", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getLegalDownloadUrl(id: number) {
  return `${env.apiBaseUrl}/api/legal/documents/${id}/download`;
}