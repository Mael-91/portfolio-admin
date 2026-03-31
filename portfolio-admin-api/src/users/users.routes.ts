import { Router } from "express";
import { z } from "zod";
import { requireAdminAuth } from "../auth/auth.middleware";
import {
  createAdminUser,
  deleteAdminUser,
  editAdminUser,
  listAdminUsers,
  resetAdminUserPassword,
  setAdminUserActiveStatus,
} from "./users.service";
import { handleRouteError } from "../common/handle-route-error";

export const usersRouter = Router();

usersRouter.use(requireAdminAuth);

usersRouter.get("/", async (_req, res) => {
  try {
    const users = await listAdminUsers();

    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Erreur liste utilisateurs :", error);

    return handleRouteError(res, error, "Erreur de récupération de la liste utilisateurs");
  }
});

usersRouter.post("/", async (req, res) => {
  try {
    const schema = z.object({
      email: z.string().trim().email("L'email doit être valide"),
      firstName: z.string().trim().min(1, "Le prénom est requis").max(100),
      lastName: z.string().trim().min(1, "Le nom de famille est requis").max(100),
      password: z.string().min(1, "Le mot de passe est requis").max(100),
    });

    const body = schema.parse(req.body);

    const user = await createAdminUser(body);

    return res.status(201).json({
      success: true,
      user,
    });
  } catch (error: any) {
    return handleRouteError(res, error, "création utilisateur");
  }
});

usersRouter.patch("/:id", async (req, res) => {
  try {
    const paramsSchema = z.object({
      id: z.coerce.number().int().min(1),
    });

    const bodySchema = z.object({
      email: z.string().trim().email(),
      firstName: z.string().trim().min(1, "Le prénom est requis").max(100),
      lastName: z.string().trim().min(1, "Le nom de famille est requis").max(100),
    });

    const params = paramsSchema.parse(req.params);
    const body = bodySchema.parse(req.body);

    const user = await editAdminUser({
      id: params.id,
      ...body,
    });

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error: any) {
    return handleRouteError(res, error, "Erreur mise à jour utilisateur");
  }
});

usersRouter.patch("/:id/password", async (req, res) => {
  try {
    const paramsSchema = z.object({
      id: z.coerce.number().int().min(1),
    });

    const bodySchema = z.object({
      password: z.string().min(1, "Le mot de passe est requis").max(100),
    });

    const params = paramsSchema.parse(req.params);
    const body = bodySchema.parse(req.body);

    const user = await resetAdminUserPassword({
      id: params.id,
      password: body.password,
    });

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error: any) {
    return handleRouteError(res, error, "Erreur mise à jour mot de passe");
  }
});

usersRouter.patch("/:id/active", async (req, res) => {
  try {
    const paramsSchema = z.object({
      id: z.coerce.number().int().min(1),
    });

    const bodySchema = z.object({
      isActive: z.boolean(),
    });

    const params = paramsSchema.parse(req.params);
    const body = bodySchema.parse(req.body);

    const currentAdminUserId = req.session?.adminUser?.id;

    if (!currentAdminUserId) {
        return res.status(401).json({
            success: false,
            message: "Non authentifié",
        });
    }

    const user = await setAdminUserActiveStatus({
      id: params.id,
      isActive: body.isActive,
      currentAdminUserId,
    });

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error: any) {
    return handleRouteError(res, error, "Erreur activation utilisateur");
  }
});

usersRouter.delete("/:id", async (req, res) => {
  try {
    const paramsSchema = z.object({
      id: z.coerce.number().int().min(1),
    });

    const params = paramsSchema.parse(req.params);

    const currentAdminUserId = req.session?.adminUser?.id;

    if (!currentAdminUserId) {
      return res.status(401).json({
        success: false,
        message: "Non authentifié",
      });
    }

    await deleteAdminUser({
      id: params.id,
      currentAdminUserId,
    });

    return res.status(200).json({
      success: true,
    });
  } catch (error: any) {
    return handleRouteError(res, error, "Erreur suppression utilisateur");
  }
});