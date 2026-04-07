import { apiFetch } from "./api";

export type MessageStatus = "new" | "in_progress" | "processed";

export type ContactMessage = {
  id: number;
  requestType: string;
  firstName: string;
  lastName: string;
  company: string | null;
  email: string;
  phone: string | null;
  messageText: string;
  allowPhoneContact: boolean;
  consentPrivacy: boolean;
  privacyPolicyAcceptedAt: string | null;
  privacyPolicyDocumentId: number | null;
  privacyPolicyVersion: string | null;
  privacyNoticePresented: boolean;
  emailSubject: string | null;
  emailText: string | null;
  formPayload: string | null;
  emailSnapshot: string | null;
  processingContext: string | null;
  legalBasis: string | null;
  processingPurpose: string | null;
  status: MessageStatus;
  createdAt: string;
  updatedAt: string;
};

export type MessagesListResponse = {
  messages: ContactMessage[];
  total: number;
  page: number;
  pageSize: number;
};

function buildMessagesQuery(params?: {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  status?: string;
  search?: string;
}) {
  const searchParams = new URLSearchParams();

  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.pageSize) searchParams.set("pageSize", String(params.pageSize));
  if (params?.sortBy) searchParams.set("sortBy", params.sortBy);
  if (params?.sortOrder) searchParams.set("sortOrder", params.sortOrder);
  if (params?.status) searchParams.set("status", params.status);
  if (params?.search) searchParams.set("search", params.search);

  const queryString = searchParams.toString();

  return queryString ? `?${queryString}` : "";
}

export async function fetchMessages(params?: {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  status?: string;
  search?: string;
}) {
  return apiFetch<{
    success: true;
    messages: ContactMessage[];
    total: number;
    page: number;
    pageSize: number;
  }>(`/api/messages${buildMessagesQuery(params)}`);
}

export async function fetchMessageById(id: number) {
  return apiFetch<{
    success: true;
    message: ContactMessage;
  }>(`/api/messages/${id}`);
}

export async function updateMessageStatus(
  id: number,
  status: MessageStatus
) {
  return apiFetch<{
    success: true;
    message: ContactMessage;
  }>(`/api/messages/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function exportMessageRgpdByEmail(payload: {
  messageId: number;
  recipientEmail: string;
}) {
  return apiFetch<{
    success: true;
    message: string;
  }>("/api/messages/export-rgpd", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}