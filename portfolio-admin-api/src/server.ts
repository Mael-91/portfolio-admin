import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./env";
import { healthRouter } from "./routes/health.routes";
import { checkDatabaseConnection } from "./db/db";
import { authRouter } from "./auth/auth.routes";

const app = express();

app.set("trust proxy", 1);

console.log("BACKEND CORS_ORIGIN =", process.env.CORS_ORIGIN);
console.log("BACKEND PORT =", process.env.PORT);

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

app.use("/", healthRouter);
app.use("/api/auth/login", authRouter);

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