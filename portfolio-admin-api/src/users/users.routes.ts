import { Router } from "express";
import { z } from "zod";
import { requireAccountAccess } from "../rbac/account-access.middleware";
import { USER_PERMISSIONS } from "../rbac/account-access";
import {
  createAdminUser,
  deleteAdminUser,
  editAdminUser,
  listAdminUsers,
  resetAdminUserPassword,
  setAdminUserActiveStatus,
} from "./users.service";
import { handleRouteError } from "../common/handle-route-error";
import { roleIdSchema } from "../rbac/roles.schemas";

const roleIds = z.array(roleIdSchema).optional();

export const usersRouter = Router();

usersRouter.get("/", requireAccountAccess(USER_PERMISSIONS.read), async (_req, res) => {
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

usersRouter.post("/", requireAccountAccess(USER_PERMISSIONS.create), async (req, res) => {
  try {
    const schema = z.object({
      email: z.string().trim().email("L'email doit être valide"),
      firstName: z.string().trim().min(1, "Le prénom est requis").max(100),
      lastName: z.string().trim().min(1, "Le nom de famille est requis").max(100),
      password: z.string().min(1, "Le mot de passe est requis").max(100),
      roleIds,
    });

    const body = schema.parse(req.body);

    const user = await createAdminUser({ ...body, actorId: req.session.adminUser!.id });

    return res.status(201).json({
      success: true,
      user,
    });
  } catch (error: any) {
    return handleRouteError(res, error, "création utilisateur");
  }
});

usersRouter.patch("/:id", requireAccountAccess(USER_PERMISSIONS.update), async (req, res) => {
  try {
    const paramsSchema = z.object({
      id: z.coerce.number().int().min(1).max(Number.MAX_SAFE_INTEGER),
    });

    const bodySchema = z.object({
      email: z.string().trim().email(),
      firstName: z.string().trim().min(1, "Le prénom est requis").max(100),
      lastName: z.string().trim().min(1, "Le nom de famille est requis").max(100),
      roleIds,
      password: z.string().min(1).max(100).optional(),
    });

    const params = paramsSchema.parse(req.params);
    const body = bodySchema.parse(req.body);

    const user = await editAdminUser({
      id: params.id,
      actorId: req.session.adminUser!.id,
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

usersRouter.patch("/:id/password", requireAccountAccess(USER_PERMISSIONS.resetPassword), async (req, res) => {
  try {
    const paramsSchema = z.object({
      id: z.coerce.number().int().min(1).max(Number.MAX_SAFE_INTEGER),
    });

    const bodySchema = z.object({
      password: z.string().min(1, "Le mot de passe est requis").max(100),
    });

    const params = paramsSchema.parse(req.params);
    const body = bodySchema.parse(req.body);

    const user = await resetAdminUserPassword({
      id: params.id,
      actorId: req.session.adminUser!.id,
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

usersRouter.patch("/:id/active", requireAccountAccess(USER_PERMISSIONS.setActive), async (req, res) => {
  try {
    const paramsSchema = z.object({
      id: z.coerce.number().int().min(1).max(Number.MAX_SAFE_INTEGER),
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

usersRouter.delete("/:id", requireAccountAccess(USER_PERMISSIONS.delete), async (req, res) => {
  try {
    const paramsSchema = z.object({
      id: z.coerce.number().int().min(1).max(Number.MAX_SAFE_INTEGER),
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