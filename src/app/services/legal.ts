import { env } from "../../env";

export type LegalDocumentType =
  | "privacy_content"
  | "legal_notice"
  | "terms_private"
  | "terms_pro";

export async function fetchLegalTypes() {
  const res = await fetch(`${env.apiBaseUrl}/api/legal/documents/types`, {
    credentials: "include",
  });

  return res.json();
}

export async function fetchCurrentLegalDocument(documentType: LegalDocumentType) {
  const url = new URL(`${env.apiBaseUrl}/api/legal/documents/current`);
  url.searchParams.set("type", documentType);

  const res = await fetch(url.toString(), {
    credentials: "include",
  });

  return res.json();
}

export async function fetchDraftLegalDocument(documentType: LegalDocumentType) {
  const url = new URL(`${env.apiBaseUrl}/api/legal/documents/draft`);
  url.searchParams.set("type", documentType);

  const res = await fetch(url.toString(), {
    credentials: "include",
  });

  return res.json();
}

export async function fetchLegalHistory(documentType: LegalDocumentType) {
  const url = new URL(`${env.apiBaseUrl}/api/legal/documents/history`);
  url.searchParams.set("type", documentType);

  const res = await fetch(url.toString(), {
    credentials: "include",
  });

  return res.json();
}

export async function saveLegalDraft(payload: {
  documentType: LegalDocumentType;
  contentHtml: string;
}) {
  const res = await fetch(`${env.apiBaseUrl}/api/legal/documents/draft`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return res.json();
}

export async function publishLegalDocument(payload: {
  documentType: LegalDocumentType;
  contentHtml: string;
}) {
  const res = await fetch(`${env.apiBaseUrl}/api/legal/documents/publish`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return res.json();
}

export function getLegalDownloadUrl(id: number) {
  return `${env.apiBaseUrl}/api/legal/documents/${id}/download`;
}