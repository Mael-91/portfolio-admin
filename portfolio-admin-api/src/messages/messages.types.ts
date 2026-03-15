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
  processingStatus: "unprocessed" | "in_progress" | "processed";
  processingUpdatedAt: string | null;
  createdAt: string;
}