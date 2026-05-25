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
  instagramButtonLabel: string | null;
  instagramButtonUrl: string | null;
}) {
  await db.execute(
    `
    UPDATE about_content
    SET
      text_html = ?,
      image_url = ?,
      image_alt = ?,
      instagram_button_label = ?,
      instagram_button_url = ?
    LIMIT 1
    `,
    [
      data.textHtml,
      data.imageUrl,
      data.imageAlt,
      data.instagramButtonLabel,
      data.instagramButtonUrl,
    ]
  );

  return getAboutContent();
}