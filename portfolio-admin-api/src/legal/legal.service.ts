import fs from "node:fs/promises";
import path from "node:path";
import {
  clearCurrentPublishedLegalDocument,
  deleteDraftLegalDocument,
  deletePublishedDocumentsByIds,
  findCurrentPublishedLegalDocument,
  findDraftLegalDocument,
  findLegalDocumentById,
  findLegalDocumentHistory,
  findPublishedVersionsBeyondLimit,
  insertDraftLegalDocument,
  insertPublishedLegalDocument,
  type LegalDocumentRow,
  type LegalDocumentType,
  updateDraftLegalDocument,
} from "./legal.repository";
import { getStoragePath, STORAGE_FOLDER } from "../common/storagePath";

function buildVersionLabel(date = new Date()) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const mi = String(date.getMinutes()).padStart(2, "0");

  return `v${yyyy}.${mm}.${dd}.${hh}${mi}`;
}

function buildDraftLabel(date = new Date()) {
  return `draft-${buildVersionLabel(date)}`;
}

function stripHtml(html: string) {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getDocumentLabel(documentType: LegalDocumentType) {
  switch (documentType) {
    case "privacy_content":
      return "Politique de confidentialité";
    case "legal_notice":
      return "Mentions légales";
    case "terms_private":
      return "Conditions générales de vente particulier";
    case "terms_pro":
      return "Conditions générales de vente professionnel";
    default:
      return documentType;
  }
}

function formatArchiveDate(dateValue: string) {
  const date = new Date(dateValue);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const mi = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");

  return `${yyyy}${mm}${dd}-${hh}${mi}${ss}`;
}

function sanitizeFilenamePart(value: string) {
  return value.replace(/[^a-zA-Z0-9_-]/g, "_");
}

function buildDocumentHtml(params: {
  title: string;
  versionLabel: string;
  dateLabel: string;
  contentHtml: string;
}) {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <title>${params.title} - ${params.versionLabel}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      color: #111827;
      max-width: 900px;
      margin: 40px auto;
      padding: 0 24px;
      line-height: 1.6;
    }
    h1, h2, h3 {
      color: #0f172a;
      margin-top: 1.5em;
    }
    .meta {
      margin-bottom: 24px;
      color: #475569;
      font-size: 14px;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 16px;
    }
    p {
      margin: 12px 0;
    }
    ul, ol {
      padding-left: 24px;
    }
    strong {
      font-weight: 700;
    }
    em {
      font-style: italic;
    }
  </style>
</head>
<body>
  <h1>${params.title}</h1>
  <div class="meta">
    <div><strong>Version :</strong> ${params.versionLabel}</div>
    <div><strong>Date :</strong> ${params.dateLabel}</div>
  </div>
  <main>
    ${params.contentHtml}
  </main>
</body>
</html>`;
}

async function ensureArchiveDirectory() {
  const archiveDir = getStoragePath(STORAGE_FOLDER.legal);

  await fs.mkdir(archiveDir, { recursive: true });

  return archiveDir;
}

async function archiveLegalDocumentToFile(document: LegalDocumentRow) {
  const archiveDir = await ensureArchiveDirectory();

  const title = getDocumentLabel(document.document_type);
  const dateSource = document.published_at ?? document.created_at;
  const dateLabel = new Date(dateSource).toLocaleString("fr-FR");

  const html = buildDocumentHtml({
    title,
    versionLabel: document.version_label,
    dateLabel,
    contentHtml: document.content_html,
  });

  const filename = [
    String(document.id),
    sanitizeFilenamePart(document.document_type),
    formatArchiveDate(document.created_at),
  ].join("_") + ".html";

  const filepath = path.join(archiveDir, filename);

  await fs.writeFile(filepath, html, "utf-8");

  return filepath;
}

async function archiveAndDeleteOldPublishedVersions(
  documentType: LegalDocumentType
) {
  const documentsToArchive = await findPublishedVersionsBeyondLimit(documentType, 5);

  if (documentsToArchive.length === 0) {
    return;
  }

  for (const document of documentsToArchive) {
    await archiveLegalDocumentToFile(document);
  }

  await deletePublishedDocumentsByIds(documentsToArchive.map((doc) => doc.id));
}

export function getLegalDocumentTypes() {
  return [
    { value: "privacy_content", label: "Politique de confidentialité" },
    { value: "legal_notice", label: "Mentions légales" },
    { value: "terms_private", label: "CGV particulier" },
    { value: "terms_pro", label: "CGV professionnel" },
  ] as const;
}

export async function getCurrentLegalDocument(documentType: LegalDocumentType) {
  return findCurrentPublishedLegalDocument(documentType);
}

export async function getDraftLegalDocument(documentType: LegalDocumentType) {
  return findDraftLegalDocument(documentType);
}

export async function getLegalDocumentHistory(documentType: LegalDocumentType) {
  return findLegalDocumentHistory(documentType, 5);
}

export async function saveDraftLegalDocument(params: {
  documentType: LegalDocumentType;
  contentHtml: string;
  createdByAdminId?: number | null;
}) {
  const existingDraft = await findDraftLegalDocument(params.documentType);
  const contentText = stripHtml(params.contentHtml);

  if (existingDraft) {
    await updateDraftLegalDocument({
      id: existingDraft.id,
      contentHtml: params.contentHtml,
      contentText,
    });

    return findDraftLegalDocument(params.documentType);
  }

  const draftId = await insertDraftLegalDocument({
    documentType: params.documentType,
    versionLabel: buildDraftLabel(),
    contentHtml: params.contentHtml,
    contentText,
    createdByAdminId: params.createdByAdminId ?? null,
  });

  return findLegalDocumentById(draftId);
}

export async function publishLegalDocument(params: {
  documentType: LegalDocumentType;
  contentHtml: string;
  createdByAdminId?: number | null;
}) {
  const contentText = stripHtml(params.contentHtml);

  await clearCurrentPublishedLegalDocument(params.documentType);

  const publishedId = await insertPublishedLegalDocument({
    documentType: params.documentType,
    versionLabel: buildVersionLabel(),
    contentHtml: params.contentHtml,
    contentText,
    createdByAdminId: params.createdByAdminId ?? null,
  });

  const draft = await findDraftLegalDocument(params.documentType);
  if (draft) {
    await deleteDraftLegalDocument(draft.id);
  }

  await archiveAndDeleteOldPublishedVersions(params.documentType);

  return findLegalDocumentById(publishedId);
}

export async function getDownloadableLegalDocument(id: number) {
  const document = await findLegalDocumentById(id);

  if (!document) {
    return null;
  }

  const title = getDocumentLabel(document.document_type);
  const dateSource = document.published_at ?? document.created_at;

  return {
    id: document.id,
    filename: `${document.document_type}-${document.version_label}.html`,
    html: buildDocumentHtml({
      title,
      versionLabel: document.version_label,
      dateLabel: new Date(dateSource).toLocaleString("fr-FR"),
      contentHtml: document.content_html,
    }),
  };
}