import { getSocketChannels, issueSocketTicket } from "../websocket/ws-access";
import { Router } from "express";
import { z } from "zod";
import { loginAdmin } from "./auth.service";
import { env } from "../env";
import { requireAdminAuth } from "./auth.middleware";
import { requireAccountAccess } from "../rbac/account-access.middleware";
import { loginRateLimit } from "./login-rate-limit";

export const authRouter = Router();

const loginSchema = z.object({
  email: z.string().trim().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

authRouter.post("/login", loginRateLimit, async (req, res) => {
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

    req.session.save((sessionError) => {
      if (sessionError) {
        console.error("Erreur sauvegarde session admin :", sessionError);

        return res.status(500).json({
          success: false,
          message: "Erreur serveur",
        });
      }

      return res.status(200).json({
        success: true,
        user: req.session.adminUser,
      });
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

authRouter.post("/logout", requireAdminAuth,(req, res) => {
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


authRouter.get("/me", requireAccountAccess(), (req, res) => {
  return res.status(200).json({
    success: true,
    ...res.locals.accountAccess,
  });
});
authRouter.post("/ws-ticket", requireAccountAccess(), (req, res) => {
  res.set("Cache-Control", "no-store");
  const { user, permissions } = res.locals.accountAccess;
  const channels = getSocketChannels(permissions);
  if (!channels.messages && !channels.rgpd) {
    return res.status(403).json({ success: false, message: "Accès interdit" });
  }
  const ticket = issueSocketTicket({ sessionId: req.sessionID, userId: user.id });
  if (!ticket) return res.status(503).json({ success: false, message: "Notifications temporairement indisponibles" });
  return res.json({ success: true, ticket });
});
