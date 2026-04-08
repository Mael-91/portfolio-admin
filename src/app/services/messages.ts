import { apiFetch } from "./api";

export type ProcessingStatus = "unprocessed" | "in_progress" | "processed";

export interface MessageListItem {
  id: number;
  requestType: string;
  email: string;
  messagePreview: string;
  allowPhoneContact: boolean;
  consentPrivacy: boolean;
  processingStatus: ProcessingStatus;
  createdAt: string;
}

export interface MessageDetail {
  id: number;
  requestType: string;
  firstName: string | null;
  lastName: string | null;
  company: string | null;
  email: string;
  phone: string | null;
  messageText: string;
  allowPhoneContact: boolean;
  consentPrivacy: boolean;
  processingStatus: ProcessingStatus;
  processingUpdatedAt: string | null;
  createdAt: string;
}

export interface ListMessagesResponse {
  success: boolean;
  page: number;
  pageSize: number;
  total: number;
  messages: MessageListItem[];
}

type ApiContactMessage = {
  id: number;
  requestType: string;
  firstName: string | null;
  lastName: string | null;
  company: string | null;
  email: string;
  phone: string | null;
  messageText: string;
  allowPhoneContact: boolean;
  consentPrivacy: boolean;
  processingStatus: ProcessingStatus;
  processingUpdatedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

function buildMessagePreview(messageText?: string | null) {
  const safeText = typeof messageText === "string" ? messageText : "";
  const normalized = safeText.replace(/\s+/g, " ").trim();

  if (normalized.length <= 100) {
    return normalized;
  }

  return `${normalized.slice(0, 100).trimEnd()}…`;
}

function mapApiMessageToListItem(message: ApiContactMessage): MessageListItem {
  return {
    id: message.id,
    requestType: message.requestType,
    email: message.email,
    messagePreview: buildMessagePreview(message.messageText ?? ""),
    allowPhoneContact: message.allowPhoneContact,
    consentPrivacy: message.consentPrivacy,
    processingStatus: message.processingStatus,
    createdAt: message.createdAt,
  };
}

function mapApiMessageToDetail(message: ApiContactMessage): MessageDetail {
  return {
    id: message.id,
    requestType: message.requestType,
    firstName: message.firstName,
    lastName: message.lastName,
    company: message.company,
    email: message.email,
    phone: message.phone,
    messageText: message.messageText,
    allowPhoneContact: message.allowPhoneContact,
    consentPrivacy: message.consentPrivacy,
    processingStatus: message.processingStatus,
    processingUpdatedAt: message.updatedAt,
    createdAt: message.createdAt,
  };
}

export async function fetchMessages(params: {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  status?: ProcessingStatus;
  search?: string;
}): Promise<ListMessagesResponse> {
  const searchParams = new URLSearchParams();

  searchParams.set("page", String(params.page));
  searchParams.set("pageSize", String(params.pageSize));

  if (params.sortBy) searchParams.set("sortBy", params.sortBy);
  if (params.sortOrder) searchParams.set("sortOrder", params.sortOrder);
  if (params.status) searchParams.set("status", params.status);
  if (params.search) searchParams.set("search", params.search);

  const data = await apiFetch<{
    success: boolean;
    page: number;
    pageSize: number;
    total: number;
    messages: ApiContactMessage[];
  }>(`/api/messages?${searchParams.toString()}`);

  return {
    success: data.success,
    page: data.page,
    pageSize: data.pageSize,
    total: data.total,
    messages: data.messages.map(mapApiMessageToListItem),
  };
}

export async function fetchMessageDetail(
  id: number
): Promise<{ success: boolean; message: MessageDetail }> {
  const data = await apiFetch<{
    success: boolean;
    message: ApiContactMessage;
  }>(`/api/messages/${id}`);

  return {
    success: data.success,
    message: mapApiMessageToDetail(data.message),
  };
}

export async function updateMessageProcessingStatus(
  id: number,
  processingStatus: ProcessingStatus
): Promise<{ success: boolean; message: MessageDetail }> {
  const data = await apiFetch<{
    success: boolean;
    message: ApiContactMessage;
  }>(`/api/messages/${id}/processing-status`, {
    method: "PATCH",
    body: JSON.stringify({processingStatus}),
  });

  return {
    success: data.success,
    message: mapApiMessageToDetail(data.message),
  };
}

export async function fetchNewMessagesCount(
  lastSeenId: number
): Promise<{ success: boolean; total: number }> {
  return apiFetch<{ success: boolean; total: number }>(
    `/api/messages/new-count?lastSeenId=${lastSeenId}`
  );
}

export async function exportMessageRgpd(
  id: number,
  email: string
): Promise<{ success: boolean; sent: boolean; email: string }> {
  const data = await apiFetch<{
    success: boolean;
    sent?: boolean;
    email: string;
  }>(`/api/messages/${id}/export-rgpd`, {
    method: "POST",
    body: JSON.stringify({ email }),
  });

  return {
    success: data.success,
    sent: data.sent ?? true,
    email : data.email ?? email,
  };
}

export async function fetchUnprocessedMessagesCount(): Promise<number> {
  const data = await apiFetch<{ success: boolean; total: number }>(
    "/api/messages/count-unprocessed"
  );

  return data.total;
}