import express from "express";
import cors from "cors";
import helmet from "helmet";
import session from "express-session";
import MySQLStoreFactory from "express-mysql-session";
import { env } from "./env";
import { healthRouter } from "./routes/health.routes";
import { checkDatabaseConnection } from "./db/db";
import { authRouter } from "./auth/auth.routes";
import { messagesRouter } from "./messages/messages.routes";
import { startRgpdCron } from "./rgpd/rgpd-cron";
import { RGPDRouter } from "./rgpd/settings.routes";
import { legalRouter } from "./legal/legal.routes";
import { usersRouter } from "./users/users.routes";
import { internalEventsRouter } from "./websocket/internal-events.routes";
import { countUnprocessedMessages } from "./messages/messages.repository";
import { startWebSocketServer } from "./websocket/ws-server";
import { portfolioRouter } from "./portfolio/portfolio.routes";
import path from "node:path";

const app = express();

app.set("trust proxy", 1);

if (env.nodeEnv === "production" && !env.sessionSecret) {
  throw new Error("SESSION_SECRET manquant en production");
}

if (env.nodeEnv === "production" && !env.internalEventsSecret) {
  throw new Error("INTERNAL_EVENTS_SECRET manquant en production");
}

const MySQLStore = MySQLStoreFactory(session);

const sessionStore = new MySQLStore({
  host: env.dbHost,
  port: env.dbPort,
  user: env.dbUser,
  password: env.dbPass,
  database: env.dbName,
  createDatabaseTable: true,

  clearExpired: true,
  checkExpirationInterval: 900000,

  disableTouch: true
});

app.use(
  helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

app.use(
  cors({
    origin: env.corsOrigin,
    credentials: true,
  })
);

app.use(express.json());

app.use(
  session({
    name: env.sessionName,
    secret: env.sessionSecret,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    proxy: true,
    cookie: {
      httpOnly: true,
      secure: env.sessionCookieSecure,
      sameSite: "lax",
      maxAge: env.sessionMaxAgeMs,
    },
  })
);

app.use("/api", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/messages", messagesRouter);
app.use("/api/settings/rgpd", RGPDRouter);
app.use("/api/users", usersRouter);
app.use("/api/legal/documents", legalRouter);
app.use("/internal/events", internalEventsRouter);
app.use("/api/portfolio-images", portfolioRouter);
app.use("/uploads/portfolio-images",express.static(path.resolve(process.cwd(), "storage", "portfolio-images")));

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route introuvable",
  });
});

app.listen(env.port, async () => {
  console.log(`Admin API démarrée sur le port ${env.port}`);

  try {
    await checkDatabaseConnection();
    console.log("Connexion MariaDB OK");
  } catch (error) {
    console.error("Erreur connexion MariaDB :", error);
  }
});

startWebSocketServer({
  getUnprocessedCount: countUnprocessedMessages,
});

startRgpdCron();