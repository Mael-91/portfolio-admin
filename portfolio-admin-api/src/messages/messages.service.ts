import {
  countMessages,
  countUnprocessedMessages,
  findMessageById,
  findMessages,
  findNewMessagesCountSinceId,
  updateMessageProcessingStatus,
} from "./messages.repository";
import { sendRgpdExportEmail } from "./messages.mail";
import { MessageDetail } from "./messages.types";

function buildCleanPreview(text: string, maxLength = 160): string {
  if (!text) {
    return "";
  }

  const normalized = text.replace(/\s+/g, " ").trim();

  if (normalized.length <= maxLength) {
    return normalized;
  }

  const truncated = normalized.slice(0, maxLength);

  const lastSpace = truncated.lastIndexOf(" ");

  if (lastSpace === -1) {
    return `${truncated}...`;
  }

  return `${truncated.slice(0, lastSpace)}...`;
}

export async function listMessages(params: {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: string;
  status?: string;
  search?: string;
}) {
  const start = Date.now();
  const [total, rows] = await Promise.all([
    countMessages({
      status: params.status,
      search: params.search, 
    }),
    findMessages(params),
  ]);

  console.log("listMessages duration:", Date.now() - start, "ms");

  return {
    page: params.page,
    pageSize: params.pageSize,
    total,
    messages: rows.map((row) => ({
      id: row.id,
      requestType: row.request_type,
      email: row.email,
      messagePreview: buildCleanPreview(row.message_preview ?? ""),
      allowPhoneContact: Boolean(row.allow_phone_contact),
      consentPrivacy: Boolean(row.consent_privacy),
      processingStatus: row.processing_status,
      createdAt: row.created_at,
    })),
  };
}

export async function getMessageDetail(id: number): Promise<MessageDetail | null> {
  const row = await findMessageById(id);

  if (!row) {
    return null;
  }

  return {
    id: row.id,
    requestType: row.request_type,
    firstName: row.first_name,
    lastName: row.last_name,
    company: row.company,
    email: row.email,
    phone: row.phone,
    messageText: row.message_text ?? "",
    allowPhoneContact: Boolean(row.allow_phone_contact),
    consentPrivacy: Boolean(row.consent_privacy),
    processingStatus: row.processing_status,
    processingUpdatedAt: row.processing_updated_at,
    createdAt: row.created_at,
  };
}

export async function setMessageProcessingStatus(params: {
  id: number;
  processingStatus: "unprocessed" | "in_progress" | "processed";
}) {
  await updateMessageProcessingStatus(params);

  return getMessageDetail(params.id);
}

export async function getNewMessagesCount(lastSeenId: number) {
  const total = await findNewMessagesCountSinceId(lastSeenId);

  return { total };
}

export async function exportMessageRgpdByEmail(params: {
  id: number;
  email: string;
}) {
  const message = await getMessageDetail(params.id);

  if (!message) {
    return null;
  }

  await sendRgpdExportEmail({
    to: params.email,
    message,
  });

  return {
    sent: true,
    email: params.email,
  };
}

export async function getUnprocessedMessagesCount() {
  const total = await countUnprocessedMessages();

  return {
    total,
  };
}