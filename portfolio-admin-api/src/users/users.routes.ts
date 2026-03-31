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
import { isAppError } from "../common/app-error";

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

    return res.status(500).json({
      success: false,
      message: "Erreur serveur",
    });
  }
});

usersRouter.post("/", async (req, res) => {
  try {
    const schema = z.object({
      email: z.string().trim().email(),
      firstName: z.string().trim().min(1).max(100),
      lastName: z.string().trim().min(1).max(100),
      password: z.string().min(8).max(100),
    });

    const body = schema.parse(req.body);

    const user = await createAdminUser(body);

    return res.status(201).json({
      success: true,
      user,
    });
  } catch (error: any) {
    console.error("RAW USER ERROR:", error);
    if (error?.name === "ZodError") {
      console.log("Sending app error response", {
        statusCode: error.statusCode,
        code: error.code,
        message: error.message,
      });
      return res.status(400).json({
        success: false,
        errors: error.errors,
      });
    }

    if (isAppError(error)) {
      console.log("Sending app error response", {
        statusCode: error.statusCode,
        code: error.code,
        message: error.message,
      });
      return res.status(error.statusCode).json({
        success: false,
        code: error.code,
        message: error.message,
      });
    }

    console.error("Erreur création utilisateur :", error);
    console.log("Sending app error response", {
        statusCode: error.statusCode,
        code: error.code,
        message: error.message,
      });
    return res.status(500).json({
      success: false,
      message: "Erreur serveur",
    });
  }
});

usersRouter.patch("/:id", async (req, res) => {
  try {
    const paramsSchema = z.object({
      id: z.coerce.number().int().min(1),
    });

    const bodySchema = z.object({
      email: z.string().trim().email(),
      firstName: z.string().trim().min(1).max(100),
      lastName: z.string().trim().min(1).max(100),
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
    console.error("RAW USER ERROR:", error);
    if (error?.name === "ZodError") {
      console.log("Sending app error response", {
        statusCode: error.statusCode,
        code: error.code,
        message: error.message,
      });
      return res.status(400).json({
        success: false,
        errors: error.errors,
      });
    }

    if (isAppError(error)) {
      console.log("Sending app error response", {
        statusCode: error.statusCode,
        code: error.code,
        message: error.message,
      });
      return res.status(error.statusCode).json({
        success: false,
        code: error.code,
        message: error.message,
      });
    }

    console.error("Erreur update utilisateur :", error);
    console.log("Sending app error response", {
        statusCode: error.statusCode,
        code: error.code,
        message: error.message,
      });
    return res.status(500).json({
      success: false,
      message: "Erreur serveur",
    });
  }
});

usersRouter.patch("/:id/password", async (req, res) => {
  try {
    const paramsSchema = z.object({
      id: z.coerce.number().int().min(1),
    });

    const bodySchema = z.object({
      password: z.string().min(8).max(100),
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
    console.error("RAW USER ERROR:", error);
    if (error?.name === "ZodError") {
      console.log("Sending app error response", {
        statusCode: error.statusCode,
        code: error.code,
        message: error.message,
      });
      return res.status(400).json({
        success: false,
        errors: error.errors,
      });
    }

    if (isAppError(error)) {
      console.log("Sending app error response", {
        statusCode: error.statusCode,
        code: error.code,
        message: error.message,
      });
      return res.status(error.statusCode).json({
        success: false,
        code: error.code,
        message: error.message,
      });
    }

    console.error("Erreur reset password utilisateur :", error);
    console.log("Sending app error response", {
        statusCode: error.statusCode,
        code: error.code,
        message: error.message,
      });
    return res.status(500).json({
      success: false,
      message: "Erreur serveur",
    });
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
    console.error("RAW USER ERROR:", error);
    if (error?.name === "ZodError") {
      console.log("Sending app error response", {
        statusCode: error.statusCode,
        code: error.code,
        message: error.message,
      });
      return res.status(400).json({
        success: false,
        errors: error.errors,
      });
    }

    if (isAppError(error)) {
      console.log("Sending app error response", {
        statusCode: error.statusCode,
        code: error.code,
        message: error.message,
      });
      return res.status(error.statusCode).json({
        success: false,
        code: error.code,
        message: error.message,
      });
    }

    console.error("Erreur activation utilisateur :", error);
    console.log("Sending app error response", {
        statusCode: error.statusCode,
        code: error.code,
        message: error.message,
      });
    return res.status(500).json({
      success: false,
      message: "Erreur serveur",
    });
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
    if (error?.name === "ZodError") {
      return res.status(400).json({
        success: false,
        errors: error.errors,
      });
    }

    if (isAppError(error)) {
      return res.status(error.statusCode).json({
        success: false,
        code: error.code,
        message: error.message,
      });
    }

    console.error("Erreur suppression utilisateur :", error);

    return res.status(500).json({
      success: false,
      message: "Erreur serveur",
    });
  }
});