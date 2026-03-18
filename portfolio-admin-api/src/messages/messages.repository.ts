import { ResultSetHeader, RowDataPacket } from "mysql2";
import { db } from "../db/db";

type FindMessagesParams = {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: string;
  status?: string;
  search?: string;
};

type CountMessagesParams = {
  status?: string;
  search?: string;
};

type MessageRow = RowDataPacket & {
  id: number;
  request_type: string;
  first_name: string | null;
  last_name: string | null;
  company: string | null;
  email: string;
  phone: string | null;
  message_text: string;
  message_preview?: string;
  allow_phone_contact: number | boolean;
  consent_privacy: number | boolean;
  processing_status: "unprocessed" | "in_progress" | "processed";
  processing_updated_at: string | null;
  created_at: string;
};

type CountRow = RowDataPacket & {
  total: number;
};

function buildWhereClause(params: CountMessagesParams) {
  const where: string[] = [];
  const values: Array<string> = [];

  if (params.status) {
    where.push(`processing_status = ?`);
    values.push(params.status);
  }

  if (params.search) {
    const like = `${params.search}%`;

    where.push(`
      (
        email LIKE ?
        OR first_name LIKE ?
        OR last_name LIKE ?
        OR company LIKE ?
      )
    `);

    values.push(like, like, like, like);
  }

  const whereClause =
    where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";

  return {
    whereClause,
    values,
  };
}

function resolveOrderBy(sortBy?: string, sortOrder?: string) {
  const direction = sortOrder?.toLowerCase() === "asc" ? "ASC" : "DESC";

  switch (sortBy) {
    case "id":
      return `id ${direction}`;
    case "alphabetical":
      return `email ${direction}`;
    case "status":
      return `processing_status ${direction}, created_at DESC`;
    case "type":
      return `request_type ${direction}, created_at DESC`;
    case "date":
    default:
      return `created_at ${direction}`;
  }
}

export async function findMessages(params: FindMessagesParams) {
  const { page, pageSize } = params;
  const offset = (page - 1) * pageSize;

  const { whereClause, values } = buildWhereClause({
    status: params.status,
    search: params.search,
  });

  const orderBy = resolveOrderBy(params.sortBy, params.sortOrder);

  const [rows] = await db.execute<MessageRow[]>(
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
        TRIM(
          REPLACE(REPLACE(REPLACE(message_text, '\\r', ' '), '\\n', ' '), '\\t', ' ')
        ),
        200
      ) AS message_preview,
      allow_phone_contact,
      consent_privacy,
      processing_status,
      processing_updated_at,
      created_at
    FROM contact_submissions
    ${whereClause}
    ORDER BY ${orderBy}
    LIMIT ? OFFSET ?
    `,
    [...values, String(pageSize), String(offset)]
  );

  return rows;
}

export async function countMessages(params: CountMessagesParams) {
  const { whereClause, values } = buildWhereClause(params);
  const start = Date.now();

  const [rows] = await db.execute<CountRow[]>(
    `
    SELECT COUNT(*) AS total
    FROM contact_submissions
    ${whereClause}
    `,
    values
  );
  console.log("countMessages SQL duration:", Date.now() - start, "ms");

  return rows[0]?.total ?? 0;
}

export async function countUnprocessedMessages(): Promise<number> {
  const [rows] = await db.execute<CountRow[]>(
    `
    SELECT COUNT(*) AS total
    FROM contact_submissions
    WHERE processing_status = 'unprocessed'
    `
  );

  return rows[0]?.total ?? 0;
}

export async function findNewMessagesCountSinceId(lastSeenId: number): Promise<number> {
  const [rows] = await db.execute<CountRow[]>(
    `
    SELECT COUNT(*) AS total
    FROM contact_submissions
    WHERE id > ?
    `,
    [String(lastSeenId)]
  );

  return rows[0]?.total ?? 0;
}

export async function findMessageById(id: number) {
  const start = Date.now();
  const [rows] = await db.execute<MessageRow[]>(
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
    [String(id)]
  );
  console.log("findMessages SQL duration:", Date.now() - start, "ms");

  return rows[0] ?? null;
}

export async function updateMessageProcessingStatus(params: {
  id: number;
  processingStatus: "unprocessed" | "in_progress" | "processed";
}) {
  const { id, processingStatus } = params;

  await db.execute<ResultSetHeader>(
    `
    UPDATE contact_submissions
    SET
      processing_status = ?,
      processing_updated_at = NOW()
    WHERE id = ?
    `,
    [processingStatus, String(id)]
  );

  return findMessageById(id);
}