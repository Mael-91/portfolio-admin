import { RowDataPacket } from "mysql2";
import { db } from "../db/db";

export type MessageSortField =
  | "created_at"
  | "id"
  | "email"
  | "processing_status";

export type MessageSortOrder = "asc" | "desc";

export interface ContactMessageRow extends RowDataPacket {
  id: number;
  request_type: string;
  first_name: string | null;
  last_name: string | null;
  company: string | null;
  email: string;
  phone: string | null;
  message_preview: string;
  message_text?: string;
  allow_phone_contact: number;
  consent_privacy: number;
  processing_status: "unprocessed" | "in_progress" | "processed";
  processing_updated_at: string | null;
  created_at: string;
}

const allowedSortFields: Record<string, MessageSortField> = {
  date: "created_at",
  created_at: "created_at",
  id: "id",
  alphabetical: "email",
  email: "email",
  status: "processing_status",
  processing_status: "processing_status",
};

function resolveSortField(sortBy?: string): MessageSortField {
  return allowedSortFields[sortBy || "date"] || "created_at";
}

function resolveSortOrder(sortOrder?: string): MessageSortOrder {
  return sortOrder === "asc" ? "asc" : "desc";
}

export async function countMessages(params: {
  status?: string;
}): Promise<number> {
  const where: string[] = [];
  const values: Array<string | number | boolean | null> = [];

  if (params.status) {
    where.push("processing_status = ?");
    values.push(params.status);
  }

  const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const [rows] = await db.execute<RowDataPacket[]>(
    `
      SELECT COUNT(*) AS total
      FROM contact_submissions
      ${whereClause}
    `,
    values
  );

  return Number(rows[0]?.total ?? 0);
}

export async function findMessages(params: {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: string;
  status?: string;
}): Promise<ContactMessageRow[]> {
  const offset = (params.page - 1) * params.pageSize;
  const sortField = resolveSortField(params.sortBy);
  const sortOrder = resolveSortOrder(params.sortOrder);

  const where: string[] = [];
  const values: Array<string | number | boolean | null> = [];

  if (params.status) {
    where.push("processing_status = ?");
    values.push(params.status);
  }

  const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";

  values.push(params.pageSize, offset);

  const [rows] = await db.execute<ContactMessageRow[]>(
  `
    SELECT
      id,
      request_type,
      first_name,
      last_name,
      company,
      email,
      phone,
      LEFT(
      TRIM(REPLACE(REPLACE(REPLACE(message_text, '\r', ' '),'\n', ' '),'\t', ' ')),200) AS message_preview,
      allow_phone_contact,
      consent_privacy,
      processing_status,
      processing_updated_at,
      created_at
    FROM contact_submissions
    ${whereClause}
    ORDER BY ${sortField} ${sortOrder}
    LIMIT ? OFFSET ?
  `,
  values
);

  return rows;
}

export async function findMessageById(id: number): Promise<ContactMessageRow | null> {
  const [rows] = await db.execute<ContactMessageRow[]>(
  `
    SELECT
      id,
      request_type,
      first_name,
      last_name,
      company,
      email,
      phone,
      message_text,
      allow_phone_contact,
      consent_privacy,
      processing_status,
      processing_updated_at,
      created_at
    FROM contact_submissions
    WHERE id = ?
    LIMIT 1
  `,
  [id]
);

  return rows[0] ?? null;
}

export async function updateMessageProcessingStatus(params: {
  id: number;
  processingStatus: "unprocessed" | "in_progress" | "processed";
}): Promise<void> {
  await db.execute(
    `
      UPDATE contact_submissions
      SET
        processing_status = ?,
        processing_updated_at = NOW()
      WHERE id = ?
    `,
    [params.processingStatus, params.id]
  );
}

export async function findNewMessagesCountSinceId(lastSeenId: number): Promise<number> {
  const [rows] = await db.execute<RowDataPacket[]>(
    `
      SELECT COUNT(*) AS total
      FROM contact_submissions
      WHERE id > ?
    `,
    [lastSeenId]
  );

  return Number(rows[0]?.total ?? 0);
}