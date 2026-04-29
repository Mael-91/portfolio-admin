import { Router } from "express";
import { z } from "zod";
import { requireAdminAuth } from "../auth/auth.middleware";
import {
  getServicesContent,
  saveServicesContent,
} from "./services.service";
import { handleRouteError } from "../common/handle-route-error";

export const servicesContentRouter = Router();

servicesContentRouter.use(requireAdminAuth);

const serviceTypeSchema = z.enum(["pro", "private"]);

servicesContentRouter.get("/", async (req, res) => {
  try {
    const querySchema = z.object({
      type: serviceTypeSchema,
    });

    const query = querySchema.parse(req.query);
    const payload = await getServicesContent(query.type);

    return res.status(200).json({
      success: true,
      ...payload,
    });
  } catch (error: any) {
    return handleRouteError(res, error, "Erreur dans la récupération du contenu des services");
  }
});

servicesContentRouter.put("/", async (req, res) => {
  try {
    const bodySchema = z.object({
      serviceType: serviceTypeSchema,
      introEnabled: z.boolean(),
      introHtml: z.string().optional().nullable(),
      cards: z
        .array(
          z.object({
            id: z.number().int().min(1),
            title: z.string().trim().min(1).max(255),
            bodyEnabled: z.boolean(),
            bodyHtml: z.string().optional().nullable(),
            bulletsEnabled: z.boolean(),
            priceEnabled: z.boolean(),
            priceLabel: z.string().optional().nullable(),
            bullets: z.array(z.string().max(500)).max(20),
          })
        )
        .length(3),
        sectionEnabled: z.boolean(),
    });

    const body = bodySchema.parse(req.body);
    const payload = await saveServicesContent({
        serviceType: body.serviceType,
        introEnabled: body.introEnabled,
        introHtml: body.introHtml ?? null,
        sectionEnabled: body.sectionEnabled,
        cards: body.cards.map((card) => ({
            id: card.id,
            title: card.title,
            bodyEnabled: card.bodyEnabled,
            bodyHtml: card.bodyHtml ?? null,
            bulletsEnabled: card.bulletsEnabled,
            priceEnabled: card.priceEnabled,
            priceLabel: card.priceLabel ?? null,
            bullets: card.bullets,
        })),
    });

    return res.status(200).json({
      success: true,
      ...payload,
    });
  } catch (error: any) {
    return handleRouteError(res, error, "Erreur dans la sauvegarde du contenu des services");
  }
});