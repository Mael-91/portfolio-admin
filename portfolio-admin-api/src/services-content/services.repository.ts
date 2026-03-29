import { ResultSetHeader, RowDataPacket } from "mysql2";
import { db } from "../db/db";

export type ServiceType = "pro" | "private";

export type ServiceSectionRow = RowDataPacket & {
  id: number;
  service_type: ServiceType;
  intro_enabled: number | boolean;
  intro_html: string | null;
  created_at: string;
  updated_at: string;
};

export type ServiceCardRow = RowDataPacket & {
  id: number;
  section_id: number;
  card_index: number;
  title: string;
  body_enabled: number | boolean;
  body_html: string | null;
  bullets_enabled: number | boolean;
  price_enabled: number | boolean;
  price_label: string | null;
  created_at: string;
  updated_at: string;
};

export type ServiceBulletRow = RowDataPacket & {
  id: number;
  card_id: number;
  bullet_index: number;
  content: string;
  created_at: string;
  updated_at: string;
};

export async function findSectionByType(serviceType: ServiceType) {
  const [rows] = await db.execute<ServiceSectionRow[]>(
    `
    SELECT *
    FROM service_sections
    WHERE service_type = ?
    LIMIT 1
    `,
    [serviceType]
  );

  return rows[0] ?? null;
}

export async function findCardsBySectionId(sectionId: number) {
  const [rows] = await db.execute<ServiceCardRow[]>(
    `
    SELECT *
    FROM service_cards
    WHERE section_id = ?
    ORDER BY card_index ASC
    `,
    [String(sectionId)]
  );

  return rows;
}

export async function findBulletsByCardIds(cardIds: number[]) {
  if (cardIds.length === 0) {
    return [];
  }

  const placeholders = cardIds.map(() => "?").join(",");

  const [rows] = await db.execute<ServiceBulletRow[]>(
    `
    SELECT *
    FROM service_card_bullets
    WHERE card_id IN (${placeholders})
    ORDER BY card_id ASC, bullet_index ASC
    `,
    cardIds.map(String)
  );

  return rows;
}

export async function updateServiceSection(params: {
  id: number;
  introEnabled: boolean;
  introHtml: string | null;
}) {
  await db.execute(
    `
    UPDATE service_sections
    SET
      intro_enabled = ?,
      intro_html = ?
    WHERE id = ?
    `,
    [params.introEnabled ? 1 : 0, params.introHtml, String(params.id)]
  );
}

export async function updateServiceCard(params: {
  id: number;
  title: string;
  bodyEnabled: boolean;
  bodyHtml: string | null;
  bulletsEnabled: boolean;
  priceEnabled: boolean;
  priceLabel: string | null;
}) {
  await db.execute(
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
      params.title,
      params.bodyEnabled ? 1 : 0,
      params.bodyHtml,
      params.bulletsEnabled ? 1 : 0,
      params.priceEnabled ? 1 : 0,
      params.priceLabel,
      String(params.id),
    ]
  );
}

export async function deleteBulletsByCardId(cardId: number) {
  await db.execute(
    `
    DELETE FROM service_card_bullets
    WHERE card_id = ?
    `,
    [String(cardId)]
  );
}

export async function insertBullet(params: {
  cardId: number;
  bulletIndex: number;
  content: string;
}) {
  const [result] = await db.execute<ResultSetHeader>(
    `
    INSERT INTO service_card_bullets (
      card_id,
      bullet_index,
      content
    )
    VALUES (?, ?, ?)
    `,
    [String(params.cardId), String(params.bulletIndex), params.content]
  );

  return result.insertId;
}