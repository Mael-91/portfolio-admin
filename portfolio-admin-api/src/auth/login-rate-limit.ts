import rateLimit from "express-rate-limit";
import { env } from "../env";

export const loginRateLimit = rateLimit({
  windowMs: env.loginRateLimitWindowMs,
  max: env.loginRateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Trop de tentatives de connexion. Réessaie plus tard.",
  },
});