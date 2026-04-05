import { db } from "../db/db";

export async function getAboutContent() {
  const [rows]: any = await db.execute(
    `SELECT * FROM about_content LIMIT 1`
  );

  return rows[0] ?? null;
}

export async function updateAboutContent(data: {
  textHtml: string;
  imageUrl: string | null;
  imageAlt: string | null;
}) {
  await db.execute(
    `
    UPDATE about_content
    SET text_html = ?,
        image_url = ?,
        image_alt = ?
    LIMIT 1
    `,
    [data.textHtml, data.imageUrl, data.imageAlt]
  );

  return getAboutContent();
}