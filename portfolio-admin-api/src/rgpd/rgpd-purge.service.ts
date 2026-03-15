import { db } from "../db/db";

export async function purgeOldContactSubmissions(retentionDays: number) {
  const query = `
    DELETE FROM contact_submissions
    WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)
  `;

  const [result]: any = await db.execute(query, [retentionDays]);

  console.log(
    `[RGPD] ${result.affectedRows} messages supprimés (rétention ${retentionDays} jours)`
  );
}