import { ResultSetHeader, RowDataPacket } from "mysql2";
import { db } from "../db/db";

export type LegalDocumentType =
  | "privacy_content"
  | "legal_notice"
  | "terms_private"
  | "terms_pro";

export type LegalDocumentStatus = "draft" | "published";

export type LegalDocumentRow = RowDataPacket & {
  id: number;
  document_type: LegalDocumentType;
  status: LegalDocumentStatus;
  version_label: string;
  content_html: string;
  content_text: string | null;
  is_current: number | boolean;
  created_at: string;
  published_at: string | null;
  created_by_admin_id: number | null;
};

export async function findCurrentPublishedLegalDocument(
  documentType: LegalDocumentType
) {
  const [rows] = await db.execute<LegalDocumentRow[]>(
    `
    SELECT *
    FROM legal_documents
    WHERE document_type = ? AND status = 'published' AND is_current = 1
    LIMIT 1
    `,
    [documentType]
  );

  return rows[0] ?? null;
}

export async function findDraftLegalDocument(documentType: LegalDocumentType) {
  const [rows] = await db.execute<LegalDocumentRow[]>(
    `
    SELECT *
    FROM legal_documents
    WHERE document_type = ? AND status = 'draft'
    ORDER BY created_at DESC
    LIMIT 1
    `,
    [documentType]
  );

  return rows[0] ?? null;
}

export async function findLegalDocumentHistory(
  documentType: LegalDocumentType,
  limit = 5
) {
  const [rows] = await db.execute<LegalDocumentRow[]>(
    `
    SELECT *
    FROM legal_documents
    WHERE document_type = ? AND status = 'published'
    ORDER BY published_at DESC, created_at DESC
    LIMIT ?
    `,
    [documentType, String(limit)]
  );

  return rows;
}

export async function findLegalDocumentById(id: number) {
  const [rows] = await db.execute<LegalDocumentRow[]>(
    `
    SELECT *
    FROM legal_documents
    WHERE id = ?
    LIMIT 1
    `,
    [String(id)]
  );

  return rows[0] ?? null;
}

export async function insertDraftLegalDocument(params: {
  documentType: LegalDocumentType;
  versionLabel: string;
  contentHtml: string;
  contentText?: string | null;
  createdByAdminId?: number | null;
}) {
  const [result] = await db.execute<ResultSetHeader>(
    `
    INSERT INTO legal_documents (
      document_type,
      status,
      version_label,
      content_html,
      content_text,
      is_current,
      created_by_admin_id
    )
    VALUES (?, 'draft', ?, ?, ?, 0, ?)
    `,
    [
      params.documentType,
      params.versionLabel,
      params.contentHtml,
      params.contentText ?? null,
      params.createdByAdminId ?? null,
    ]
  );

  return result.insertId;
}

export async function updateDraftLegalDocument(params: {
  id: number;
  contentHtml: string;
  contentText?: string | null;
}) {
  await db.execute(
    `
    UPDATE legal_documents
    SET
      content_html = ?,
      content_text = ?
    WHERE id = ? AND status = 'draft'
    `,
    [params.contentHtml, params.contentText ?? null, String(params.id)]
  );
}

export async function clearCurrentPublishedLegalDocument(
  documentType: LegalDocumentType
) {
  await db.execute(
    `
    UPDATE legal_documents
    SET is_current = 0
    WHERE document_type = ? AND status = 'published' AND is_current = 1
    `,
    [documentType]
  );
}

export async function insertPublishedLegalDocument(params: {
  documentType: LegalDocumentType;
  versionLabel: string;
  contentHtml: string;
  contentText?: string | null;
  createdByAdminId?: number | null;
}) {
  const [result] = await db.execute<ResultSetHeader>(
    `
    INSERT INTO legal_documents (
      document_type,
      status,
      version_label,
      content_html,
      content_text,
      is_current,
      published_at,
      created_by_admin_id
    )
    VALUES (?, 'published', ?, ?, ?, 1, NOW(), ?)
    `,
    [
      params.documentType,
      params.versionLabel,
      params.contentHtml,
      params.contentText ?? null,
      params.createdByAdminId ?? null,
    ]
  );

  return result.insertId;
}

export async function deleteDraftLegalDocument(id: number) {
  await db.execute(
    `
    DELETE FROM legal_documents
    WHERE id = ? AND status = 'draft'
    `,
    [String(id)]
  );
}

export async function findPublishedVersionsBeyondLimit(
  documentType: LegalDocumentType,
  keep = 5
) {
  const [rows] = await db.execute<LegalDocumentRow[]>(
    `
    SELECT *
    FROM legal_documents
    WHERE document_type = ?
      AND status = 'published'
      AND id NOT IN (
        SELECT id FROM (
          SELECT id
          FROM legal_documents
          WHERE document_type = ?
            AND status = 'published'
          ORDER BY published_at DESC, created_at DESC
          LIMIT ?
        ) AS kept_versions
      )
    ORDER BY published_at ASC, created_at ASC
    `,
    [documentType, documentType, String(keep)]
  );

  return rows;
}

export async function deletePublishedDocumentsByIds(ids: number[]) {
  if (ids.length === 0) {
    return;
  }

  const placeholders = ids.map(() => "?").join(",");

  await db.execute(
    `
    DELETE FROM legal_documents
    WHERE id IN (${placeholders})
    `,
    ids.map(String)
  );
}