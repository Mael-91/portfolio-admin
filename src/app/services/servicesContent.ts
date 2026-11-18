import { env } from "../../env";
import { apiFetch } from "./api";

export type ServiceType = "pro" | "private";

export type ServiceCard = {
  id: number;
  cardIndex: number;
  title: string;
  bodyEnabled: boolean;
  bodyHtml: string;
  bulletsEnabled: boolean;
  bullets: string[];
  priceEnabled: boolean;
  priceLabel: string;
};

export type ServicesSection = {
  serviceType: ServiceType;
  introEnabled: boolean;
  introHtml: string;
  sectionEnabled: boolean;
};

export async function fetchServicesContent(serviceType: ServiceType) {
  const url = new URL(`${env.apiBaseUrl}/api/services-content`);
  url.searchParams.set("type", serviceType);

  return apiFetch<{
    success: true;
    section: ServicesSection;
    cards: ServiceCard[];
  }>(`${url.pathname}${url.search}`);
}

type EditableFields = {
  title: string;
  bodyEnabled: boolean;
  bodyHtml: string;
  bulletsEnabled: boolean;
  priceEnabled: boolean;
  priceLabel: string;
  bullets: string[];
};

export type ServicesChange = {
  serviceType: ServiceType;
  introEnabled?: boolean;
  introHtml?: string;
  sectionEnabled?: boolean;
  cards: ({ id: number } & Partial<EditableFields>)[];
};

export function saveServicesContent(payload: ServicesChange) {
  return apiFetch<{ success: true }>("/api/services-content", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}
