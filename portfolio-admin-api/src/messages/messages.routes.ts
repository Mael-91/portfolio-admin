import { Router } from "express";
import { z } from "zod";
import { requireAdminAuth } from "../auth/auth.middleware";
import {
  getMessageDetail,
  getNewMessagesCount,
  getUnprocessedMessagesCount,
  listMessages,
  setMessageProcessingStatus,
} from "./messages.service";
import { exportMessageRgpdByEmail } from "./messages.service";
import { handleRouteError } from "../common/handle-route-error";

export const messagesRouter = Router();

messagesRouter.use(requireAdminAuth);

const listSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  status: z.enum(["unprocessed", "in_progress", "processed"]).optional(),
  search: z.string().trim().optional(),
});

messagesRouter.get("/", async (req, res) => {
  try {
    const query = listSchema.parse(req.query);

    const result = await listMessages(query);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    return handleRouteError(res, error, "Erreur dans le chargement des messages");
  }
});

messagesRouter.get("/new-count", async (req, res) => {
  try {
    const schema = z.object({
      lastSeenId: z.coerce.number().int().min(0).default(0),
    });

    const query = schema.parse(req.query);
    const result = await getNewMessagesCount(query.lastSeenId);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    return handleRouteError(res, error, "Erreur dans le chargement du nombre de nouveaux messages");
  }
});

messagesRouter.get("/count-unprocessed", async (_req, res) => {
  try {
    const result = await getUnprocessedMessagesCount();

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    return handleRouteError(res, error, "Erreur dans le chargement du nombre de messages non traités");
  }
});

messagesRouter.post("/:id/export-rgpd", async (req, res) => {
  try {
    const paramsSchema = z.object({
      id: z.coerce.number().int().min(1),
    });

    const bodySchema = z.object({
      email: z.string().trim().email("Email invalide"),
    });

    const params = paramsSchema.parse(req.params);
    const body = bodySchema.parse(req.body);

    const result = await exportMessageRgpdByEmail({
      id: params.id,
      email: body.email,
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Message introuvable",
      });
    }

    return res.status(200).json({
      success: true,
      sent: true,
      email: result.email,
    });
  } catch (error: any) {
    return handleRouteError(res, error, "Erreur dans l'export RGPD");
  }
});

messagesRouter.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const message = await getMessageDetail(id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message introuvable",
      });
    }

    return res.status(200).json({
      success: true,
      message,
    });
  } catch (error) {
    return handleRouteError(res, error, "Erreur dans le chargement du détail du message");
  }
});

messagesRouter.patch("/:id/processing-status", async (req, res) => {
  try {
    const schema = z.object({
      processingStatus: z.enum(["unprocessed", "in_progress", "processed"]),
    });

    const id = Number(req.params.id);
    const body = schema.parse(req.body);

    const message = await setMessageProcessingStatus({
      id,
      processingStatus: body.processingStatus,
    });

    return res.status(200).json({
      success: true,
      message,
    });
  } catch (error: any) {
    return handleRouteError(res, error, "Erreur dans la mise à jour du statut de traitement du message");
  }
});