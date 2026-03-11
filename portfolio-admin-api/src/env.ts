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
  port: Number(process.env.PORT || 4100),

  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",

  dbHost: process.env.DB_HOST || "127.0.0.1",
  dbPort: Number(process.env.DB_PORT || 3306),
  dbName: process.env.DB_NAME || "portfolio",
  dbUser: process.env.DB_USER || "",
  dbPass: process.env.DB_PASS || "",

  sessionSecret: process.env.SESSION_SECRET || "",
};