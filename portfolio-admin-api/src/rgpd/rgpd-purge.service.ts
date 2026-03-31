import { db } from "../db/db";

export async function purgeExpiredMessages(retentionDays: number) {
  const [result]: any = await db.execute(
    `
    DELETE FROM contact_submissions
    WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)
    `,
    [retentionDays]
  );

  return {
    deleted: result.affectedRows || 0,
  };
}

export async function countExpiredMessages(retentionDays: number) {
  const [rows]: any = await db.execute(
    `
    SELECT COUNT(*) AS total
    FROM contact_submissions
    WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)
    `,
    [retentionDays]
  );

  return Number(rows[0]?.total ?? 0);
}