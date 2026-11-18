import { Router } from "express";
import { z } from "zod";
import { requireAccountAccess } from "../rbac/account-access.middleware";
import {
  getServicesContent,
  saveServicesContent,
} from "./services.service";
import { servicePermissions } from "../rbac/content-permissions";
import { accessDenied } from "../rbac/role-transaction";
import { handleRouteError } from "../common/handle-route-error";

export const servicesContentRouter = Router();

const serviceTypeSchema = z.enum(["pro", "private"]);

servicesContentRouter.get("/", requireAccountAccess("services.read"), async (req, res) => {
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

servicesContentRouter.put("/", requireAccountAccess(), async (req, res) => {
  try {
    const schema = z.strictObject({
      serviceType: serviceTypeSchema,
      introEnabled: z.boolean().optional(),
      introHtml: z.string().nullable().optional(),
      sectionEnabled: z.boolean().optional(),
      cards: z.array(z.strictObject({
        id: z.number().int().min(1),
        title: z.string().trim().min(1).max(255).optional(),
        bodyEnabled: z.boolean().optional(),
        bodyHtml: z.string().nullable().optional(),
        bulletsEnabled: z.boolean().optional(),
        priceEnabled: z.boolean().optional(),
        priceLabel: z.string().nullable().optional(),
        bullets: z.array(z.string().max(500)).max(20).optional(),
      })).max(3).optional(),
    });

    const body = schema.parse(req.body);
    const cards = body.cards ?? [];
    const required = servicePermissions(body);
    if (!required.length) {
      return res.status(400).json({ success: false, message: "Aucune modification fournie." });
    }
    const { permissions } = res.locals.accountAccess;
    if (required.some((code) => !permissions.includes(code))) throw accessDenied();

    await saveServicesContent({ ...body, cards });
    return res.json({ success: true });
  } catch (error: any) {
    return handleRouteError(res, error, "Erreur dans la sauvegarde du contenu des services");
  }
});