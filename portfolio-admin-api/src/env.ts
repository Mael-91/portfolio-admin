import dotenv from "dotenv";
import path from "path";

const nodeEnv = process.env.NODE_ENV || "production";
const envFile = nodeEnv === "development" ? ".env.development" : ".env";
const envPath = path.resolve(process.cwd(), envFile);

dotenv.config({
  path: envPath,
  override: true,
});

export const env = {
  nodeEnv,
  port: Number(process.env.PORT || 9808),

  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
  adminApiUrl: process.env.ADMIN_API_URL ?? "http://localhost:9808",

  dbHost: process.env.DB_HOST || "127.0.0.1",
  dbPort: Number(process.env.DB_PORT || 3306),
  dbName: process.env.DB_NAME || "portfolio",
  dbUser: process.env.DB_USER || "",
  dbPass: process.env.DB_PASS || "",

  sessionSecret: process.env.SESSION_SECRET || "",
  sessionName: process.env.SESSION_NAME || "mc_admin_sid",
  sessionMaxAgeMs: Number(process.env.SESSION_MAX_AGE_MS || 1000 * 60 * 60 * 8),
  sessionCookieSecure: String(process.env.SESSION_COOKIE_SECURE) === "true",

  loginRateLimitWindowMs: Number(
    process.env.LOGIN_RATE_LIMIT_WINDOW_MS ?? 900000
  ),
  loginRateLimitMax: Number(process.env.LOGIN_RATE_LIMIT_MAX ?? 5),

  mailHost: process.env.MAIL_HOST || "mail.maelconstantin.fr",
  mailPort: Number(process.env.MAIL_PORT || 587),
  mailSecure: String(process.env.MAIL_SECURE) === "true",
  mailUser: process.env.MAIL_USER || "",
  mailPass: process.env.MAIL_PASS || "",
  mailFrom: process.env.MAIL_FROM || "",

  rgpdRetentionDays: Number(process.env.RGPD_RETENTION_DAYS || 180),
  rgpdPurgeCron: process.env.RGPD_PURGE_CRON || "0 3 * * *",

  wsPort: Number(process.env.WS_PORT ?? (process.env.NODE_ENV === "production" ? 9860 : 9862)),
  wsHost: process.env.WS_HOST ?? (process.env.NODE_ENV === "production" ? "127.0.0.1" : "0.0.0.0"),
  internalEventsSecret: process.env.INTERNAL_EVENTS_SECRET ?? "",
};