import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { loginAdmin } from "./auth.service";
import { env } from "../env";

export const authRouter = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
});

const loginSchema = z.object({
  email: z.string().trim().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

authRouter.post("/login", loginLimiter, async (req, res) => {
  try {
    const data = loginSchema.parse(req.body);

    const adminUser = await loginAdmin({
      email: data.email,
      password: data.password,
    });

    if (!adminUser) {
      return res.status(401).json({
        success: false,
        message: "Identifiants invalides",
      });
    }

    req.session.adminUser = {
      id: adminUser.id,
      firstName: adminUser.firstName,
      lastName: adminUser.lastName,
      email: adminUser.email,
    };

    return res.status(200).json({
      success: true,
      user: req.session.adminUser,
    });
  } catch (error: any) {
    if (error?.name === "ZodError") {
      return res.status(400).json({
        success: false,
        errors: error.errors,
      });
    }

    console.error("Erreur login admin :", error);

    return res.status(500).json({
      success: false,
      message: "Erreur serveur",
    });
  }
});

authRouter.post("/logout", (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      console.error("Erreur logout admin :", error);

      return res.status(500).json({
        success: false,
        message: "Erreur lors de la déconnexion",
      });
    }

    res.clearCookie(env.sessionName);

    return res.status(200).json({
      success: true,
    });
  });
});

authRouter.get("/me", (req, res) => {
  if (!req.session.adminUser) {
    return res.status(401).json({
      success: false,
      message: "Non authentifié",
    });
  }

  return res.status(200).json({
    success: true,
    user: req.session.adminUser,
  });
});