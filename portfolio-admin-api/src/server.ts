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

const app = express();

app.set("trust proxy", 1);

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

startRgpdCron();