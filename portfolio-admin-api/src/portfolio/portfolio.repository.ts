import { ResultSetHeader, RowDataPacket } from "mysql2";
import { db } from "../db/db";

export type PortfolioImageRow = RowDataPacket & {
  id: number;
  caption: string;
  alt_text: string;
  description: string | null;
  file_name: string;
  file_path: string;
  file_url: string;
  mime_type: string;
  display_order: number;
  is_active: number | boolean;
  created_at: string;
  updated_at: string;
};

export async function findPortfolioImages() {
  const [rows] = await db.execute<PortfolioImageRow[]>(
    `
    SELECT *
    FROM portfolio_images
    ORDER BY display_order ASC, created_at ASC
    `
  );

  return rows;
}

export async function findPortfolioImageById(id: number) {
  const [rows] = await db.execute<PortfolioImageRow[]>(
    `
    SELECT *
    FROM portfolio_images
    WHERE id = ?
    LIMIT 1
    `,
    [String(id)]
  );

  return rows[0] ?? null;
}

export async function getNextActivePortfolioDisplayOrder() {
  const [rows]: any = await db.execute(
    `
    SELECT COALESCE(MAX(display_order), 0) + 1 AS next_order
    FROM portfolio_images
    WHERE is_active = 1
    `
  );

  return Number(rows[0]?.next_order ?? 1);
}

export async function insertPortfolioImage(params: {
  caption: string;
  altText: string;
  description?: string | null;
  fileName: string;
  filePath: string;
  fileUrl: string;
  mimeType: string;
  displayOrder: number | null;
  isActive?: boolean;
}) {
  const [result] = await db.execute<ResultSetHeader>(
    `
    INSERT INTO portfolio_images (
      caption,
      alt_text,
      description,
      file_name,
      file_path,
      file_url,
      mime_type,
      display_order,
      is_active
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      params.caption,
      params.altText,
      params.description ?? null,
      params.fileName,
      params.filePath,
      params.fileUrl,
      params.mimeType,
      params.displayOrder,
      params.isActive ?? true ? 1 : 0,
    ]
  );

  return result.insertId;
}

export async function updatePortfolioImage(params: {
  id: number;
  caption: string;
  altText: string;
  description?: string | null;
  isActive: boolean;
  displayOrder?: number | null;
}) {
  await db.execute(
    `
    UPDATE portfolio_images
    SET
      caption = ?,
      alt_text = ?,
      description = ?,
      is_active = ?,
      display_order = ?
    WHERE id = ?
    `,
    [
      params.caption,
      params.altText,
      params.description ?? null,
      params.isActive ? 1 : 0,
      params.isActive ? params.displayOrder ?? 1 : null,
      String(params.id),
    ]
  );
}

export async function updatePortfolioImageOrder(
  items: Array<{ id: number; displayOrder: number }>
) {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    for (const item of items) {
      await connection.execute(
        `
        UPDATE portfolio_images
        SET display_order = ?
        WHERE id = ?
          AND is_active = 1
        `,
        [item.displayOrder, String(item.id)]
      );
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function deletePortfolioImageById(id: number) {
  await db.execute(
    `
    DELETE FROM portfolio_images
    WHERE id = ?
    `,
    [String(id)]
  );
}

export async function normalizeActivePortfolioImageOrders() {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [rows]: any = await connection.execute(
      `
      SELECT id
      FROM portfolio_images
      WHERE is_active = 1
      ORDER BY display_order ASC, created_at ASC
      `
    );

    for (let i = 0; i < rows.length; i += 1) {
      await connection.execute(
        `
        UPDATE portfolio_images
        SET display_order = ?
        WHERE id = ?
        `,
        [i + 1, String(rows[i].id)]
      );
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function moveActivePortfolioImageToOrder(
  imageId: number,
  targetOrder: number
) {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [rows]: any = await connection.execute(
      `
      SELECT id
      FROM portfolio_images
      WHERE is_active = 1
      ORDER BY display_order ASC, created_at ASC
      `
    );

    const orderedIds = rows.map((row: any) => Number(row.id));
    const currentIndex = orderedIds.indexOf(imageId);

    if (currentIndex === -1) {
      await connection.commit();
      return;
    }

    const [removedId] = orderedIds.splice(currentIndex, 1);

    const safeTargetIndex = Math.max(
      0,
      Math.min(targetOrder - 1, orderedIds.length)
    );

    orderedIds.splice(safeTargetIndex, 0, removedId);

    for (let i = 0; i < orderedIds.length; i += 1) {
      await connection.execute(
        `
        UPDATE portfolio_images
        SET display_order = ?
        WHERE id = ?
        `,
        [i + 1, String(orderedIds[i])]
      );
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}