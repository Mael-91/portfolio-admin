import { env } from "../../env";
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

  if (params.sortBy) {
    searchParams.set("sortBy", params.sortBy);
  }

  if (params.search) {
    searchParams.set("search", params.search);
  }

  if (params.sortOrder) {
    searchParams.set("sortOrder", params.sortOrder);
  }

  if (params.status) {
    searchParams.set("status", params.status);
  }

  return apiFetch<ListMessagesResponse>(`/api/messages?${searchParams.toString()}`);
}

export async function fetchMessageDetail(id: number): Promise<{
  success: boolean;
  message: MessageDetail;
}> {
  return apiFetch(`/api/messages/${id}`);
}

export async function updateMessageProcessingStatus(
  id: number,
  processingStatus: ProcessingStatus
): Promise<{
  success: boolean;
  message: MessageDetail;
}> {
  return apiFetch(`/api/messages/${id}/processing-status`, {
    method: "PATCH",
    body: JSON.stringify({ processingStatus }),
  });
}

export async function fetchNewMessagesCount(lastSeenId: number): Promise<{
  success: boolean;
  total: number;
}> {
  return apiFetch(`/api/messages/new-count?lastSeenId=${lastSeenId}`);
}

export async function exportMessageRgpd(id: number, email: string): Promise<{
  success: boolean;
  sent: boolean;
  email: string;
}> {
  return apiFetch(`/api/messages/${id}/export-rgpd`, {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function fetchUnprocessedMessagesCount(): Promise<number> {
  const baseUrl = env.apiBaseUrl;

  const url = `${baseUrl}/api/messages/count-unprocessed`;

  const response = await fetch(url, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Erreur récupération compteur messages");
  }

  const data = await response.json();
  return data.total;
}