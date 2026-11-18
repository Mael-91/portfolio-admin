import { AppError } from "../common/app-error";
import { db } from "../db/db";
import {
  findBulletsByCardIds,
  findCardsBySectionId,
  findSectionByType,
  type ServiceType,
} from "./services.repository";
import {
  getSettingsByKeys,
  upsertSetting,
} from "../settings-general/settings-general.repository";

type ServiceCardInput = {
  id: number;
  title?: string;
  bodyEnabled?: boolean;
  bodyHtml?: string | null;
  bulletsEnabled?: boolean;
  priceEnabled?: boolean;
  priceLabel?: string | null;
  bullets?: string[];
};

const SERVICES_SECTION_ENABLED_KEY = "services_section_enabled";

function normalizeHtml(value?: string | null) {
  const trimmed = value?.trim() ?? "";
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeLabel(value?: string | null) {
  const trimmed = value?.trim() ?? "";
  return trimmed.length > 0 ? trimmed : null;
}

export async function getServicesContent(serviceType: ServiceType) {
  const section = await findSectionByType(serviceType);

  if (!section) {
    throw new AppError({
      code: "SERVICE_SECTION_NOT_FOUND",
      message: "La section de services n'a pas été trouvée.",
      statusCode: 404,
    });
  }

  const cards = await findCardsBySectionId(section.id);
  const bullets = await findBulletsByCardIds(cards.map((card) => card.id));

  const settings = await getSettingsByKeys([SERVICES_SECTION_ENABLED_KEY]);
  const sectionEnabled = settings[SERVICES_SECTION_ENABLED_KEY] === "true";

  return {
    section: {
      id: section.id,
      serviceType: section.service_type,
      introEnabled: Boolean(section.intro_enabled),
      introHtml: section.intro_html ?? "",
      sectionEnabled,
    },
    cards: cards.map((card) => ({
      id: card.id,
      cardIndex: card.card_index,
      title: card.title,
      bodyEnabled: Boolean(card.body_enabled),
      bodyHtml: card.body_html ?? "",
      bulletsEnabled: Boolean(card.bullets_enabled),
      priceEnabled: Boolean(card.price_enabled),
      priceLabel: card.price_label ?? "",
      bullets: bullets
        .filter((bullet) => bullet.card_id === card.id)
        .map((bullet) => bullet.content),
    })),
  };
}

export async function saveServicesContent(params: {
  serviceType: ServiceType;
  introEnabled?: boolean;
  introHtml?: string | null;
  cards: ServiceCardInput[];
  sectionEnabled?: boolean;
}) {
  const section = await findSectionByType(params.serviceType);
  if (!section) {
    throw new AppError({
      code: "SERVICE_SECTION_NOT_FOUND",
      message: "La section de services n'a pas été trouvée.",
      statusCode: 404,
    });
  }

  const ids = new Set((await findCardsBySectionId(section.id)).map(({ id }) => id));
  if (params.cards.some(({ id }) => !ids.has(id)) ||
      new Set(params.cards.map(({ id }) => id)).size !== params.cards.length) {
    throw new AppError({ code: "INVALID_SERVICE_CARD", message: "Cartes de prestation invalides.", statusCode: 400 });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    if (params.sectionEnabled !== undefined) {
      await upsertSetting(SERVICES_SECTION_ENABLED_KEY, String(params.sectionEnabled), connection);
    }
    if (params.introEnabled !== undefined || params.introHtml !== undefined) {
      await connection.execute(
        `UPDATE service_sections
         SET intro_enabled = COALESCE(?, intro_enabled), intro_html = IF(?, ?, intro_html)
         WHERE id = ?`,
        [params.introEnabled ?? null, params.introHtml !== undefined, normalizeHtml(params.introHtml), String(section.id)]
      );
    }

    for (const card of params.cards) {
      await connection.execute(
        `UPDATE service_cards
         SET title = COALESCE(?, title), body_enabled = COALESCE(?, body_enabled),
             body_html = IF(?, ?, body_html), bullets_enabled = COALESCE(?, bullets_enabled),
             price_enabled = COALESCE(?, price_enabled), price_label = IF(?, ?, price_label)
         WHERE id = ? AND section_id = ?`,
        [card.title ?? null, card.bodyEnabled ?? null, card.bodyHtml !== undefined, normalizeHtml(card.bodyHtml),
          card.bulletsEnabled ?? null, card.priceEnabled ?? null, card.priceLabel !== undefined,
          normalizeLabel(card.priceLabel), String(card.id), String(section.id)]
      );

      if (card.bullets === undefined) continue;
      await connection.execute("DELETE FROM service_card_bullets WHERE card_id = ?", [String(card.id)]);
      const bullets = card.bullets.map((item) => item.trim()).filter(Boolean);
      for (const [index, bullet] of bullets.entries()) {
        await connection.execute(
          "INSERT INTO service_card_bullets (card_id, bullet_index, content) VALUES (?, ?, ?)",
          [String(card.id), String(index + 1), bullet]
        );
      }
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
