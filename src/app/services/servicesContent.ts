import { env } from "../../env";
import { extractApiErrorMessage } from "./ApiErrorMessage";

export type ServiceType = "pro" | "private";

export type ServiceSection = {
  id: number;
  serviceType: ServiceType;
  introEnabled: boolean;
  introHtml: string;
};

export type ServiceCard = {
  id: number;
  cardIndex: number;
  title: string;
  bodyEnabled: boolean;
  bodyHtml: string;
  bulletsEnabled: boolean;
  priceEnabled: boolean;
  priceLabel: string;
  bullets: string[];
};

export async function fetchServicesContent(serviceType: ServiceType) {
  const url = new URL(`${env.apiBaseUrl}/api/services-content`);
  url.searchParams.set("type", serviceType);

  const res = await fetch(url.toString(), {
    credentials: "include",
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(extractApiErrorMessage(data, "Erreur chargement prestations"));
  }

  return data;
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
    priceEnabled: boolean;
    priceLabel: string;
    bullets: string[];
  }>;
}) {
  const res = await fetch(`${env.apiBaseUrl}/api/services-content`, {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(extractApiErrorMessage(data, "Erreur sauvegarde prestations"));
  }

  return data;
}