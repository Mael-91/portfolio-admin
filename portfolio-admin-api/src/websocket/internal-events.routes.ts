import { Router } from "express";
import { z } from "zod";
import { env } from "../env";
import { broadcastNewMessage } from "./ws-server";
import { countUnprocessedMessages } from "../messages/messages.repository";

export const internalEventsRouter = Router();

internalEventsRouter.post("/contact-created", async (req, res) => {
  try {
    const authHeader = req.headers["x-internal-secret"];

    if (!authHeader || authHeader !== env.internalEventsSecret) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    const schema = z.object({
      diff: z.number().int().min(1).optional(),
    });

    const body = schema.parse(req.body);

    const unprocessedCount = await countUnprocessedMessages();

    broadcastNewMessage({
      unprocessedCount,
      diff: body.diff ?? 1,
    });

    return res.status(200).json({
      success: true,
      unprocessedCount,
    });
  } catch (error: any) {
    if (error?.name === "ZodError") {
      return res.status(400).json({
        success: false,
        errors: error.errors,
      });
    }

    console.error("Erreur internal event contact-created :", error);

    return res.status(500).json({
      success: false,
      message: "Erreur serveur",
    });
  }
});