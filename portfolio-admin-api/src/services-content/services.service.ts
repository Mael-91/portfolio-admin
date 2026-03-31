import { AppError } from "../common/app-error";
import { db } from "../db/db";
import {
  deleteBulletsByCardId,
  findBulletsByCardIds,
  findCardsBySectionId,
  findSectionByType,
  insertBullet,
  updateServiceCard,
  updateServiceSection,
  type ServiceType,
} from "./services.repository";

type ServiceCardInput = {
  id: number;
  title: string;
  bodyEnabled: boolean;
  bodyHtml: string | null;
  bulletsEnabled: boolean;
  priceEnabled: boolean;
  priceLabel: string | null;
  bullets: string[];
};

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

  return {
    section: {
      id: section.id,
      serviceType: section.service_type,
      introEnabled: Boolean(section.intro_enabled),
      introHtml: section.intro_html ?? "",
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
  introEnabled: boolean;
  introHtml?: string | null;
  cards: ServiceCardInput[];
}) {
  const section = await findSectionByType(params.serviceType);

  if (!section) {
    throw new AppError({
      code: "SERVICE_SECTION_NOT_FOUND",
      message: "La section de services n'a pas été trouvée.",
      statusCode: 404,
    });
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    await connection.execute(
      `
      UPDATE service_sections
      SET
        intro_enabled = ?,
        intro_html = ?
      WHERE id = ?
      `,
      [
        params.introEnabled ? 1 : 0,
        normalizeHtml(params.introHtml),
        String(section.id),
      ]
    );

    for (const card of params.cards) {
      await connection.execute(
        `
        UPDATE service_cards
        SET
          title = ?,
          body_enabled = ?,
          body_html = ?,
          bullets_enabled = ?,
          price_enabled = ?,
          price_label = ?
        WHERE id = ?
        `,
        [
          card.title,
          card.bodyEnabled ? 1 : 0,
          normalizeHtml(card.bodyHtml),
          card.bulletsEnabled ? 1 : 0,
          card.priceEnabled ? 1 : 0,
          normalizeLabel(card.priceLabel),
          String(card.id),
        ]
      );

      await connection.execute(
        `
        DELETE FROM service_card_bullets
        WHERE card_id = ?
        `,
        [String(card.id)]
      );

      const filteredBullets = card.bullets
        .map((item) => item.trim())
        .filter(Boolean);

      for (let i = 0; i < filteredBullets.length; i += 1) {
        await connection.execute(
          `
          INSERT INTO service_card_bullets (
            card_id,
            bullet_index,
            content
          )
          VALUES (?, ?, ?)
          `,
          [String(card.id), String(i + 1), filteredBullets[i]]
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

  return getServicesContent(params.serviceType);
}