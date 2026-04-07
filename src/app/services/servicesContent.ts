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
};

export async function fetchServicesContent(serviceType: ServiceType) {
  return apiFetch<{
    success: true;
    section: ServicesSection;
    cards: ServiceCard[];
  }>(`/api/services-content/${serviceType}`);
}

export async function saveServicesContent(payload: {
  serviceType: ServiceType;
  introEnabled: boolean;
  introHtml: string;
  cards: Array<{
    id: number;
    title: string;
    bodyEnabled: boolean;
    bodyHtml: string;
    bulletsEnabled: boolean;
    bullets: string[];
    priceEnabled: boolean;
    priceLabel: string;
  }>;
}) {
  return apiFetch<{
    success: true;
    section: ServicesSection;
    cards: ServiceCard[];
  }>("/api/services-content", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}