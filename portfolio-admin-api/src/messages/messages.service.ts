import {
  countMessages,
  findMessageById,
  findMessages,
  findNewMessagesCountSinceId,
  updateMessageProcessingStatus,
} from "./messages.repository";

function buildMessagePreview(message: string, maxLength = 120): string {
  const normalized = message.replace(/\s+/g, " ").trim();

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength)}...`;
}

export async function listMessages(params: {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: string;
  status?: string;
}) {
  const [total, rows] = await Promise.all([
    countMessages({ status: params.status }),
    findMessages(params),
  ]);

  return {
    page: params.page,
    pageSize: params.pageSize,
    total,
    messages: rows.map((row) => ({
      id: row.id,
      requestType: row.request_type,
      email: row.email,
      messagePreview: buildMessagePreview(row.message_text),
      allowPhoneContact: Boolean(row.allow_phone_contact),
      consentPrivacy: Boolean(row.consent_privacy),
      processingStatus: row.processing_status,
      createdAt: row.created_at,
    })),
  };
}

export async function getMessageDetail(id: number) {
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
    messageText: row.message_text,
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