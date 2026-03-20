import { Router } from "express";
import { z } from "zod";
import { requireAdminAuth } from "../auth/auth.middleware";
import {
  getCurrentLegalDocument,
  getDraftLegalDocument,
  getDownloadableLegalDocument,
  getLegalDocumentHistory,
  getLegalDocumentTypes,
  publishLegalDocument,
  saveDraftLegalDocument,
} from "./legal.service";

export const legalRouter = Router();

const documentTypeSchema = z.enum([
  "privacy_content",
  "legal_notice",
  "terms_private",
  "terms_pro",
]);

legalRouter.use(requireAdminAuth);

legalRouter.get("/types", (_req, res) => {
  return res.json({
    success: true,
    types: getLegalDocumentTypes(),
  });
});

legalRouter.get("/current", async (req, res) => {
  const schema = z.object({
    type: documentTypeSchema,
  });

  const query = schema.parse(req.query);
  const document = await getCurrentLegalDocument(query.type);

  return res.json({
    success: true,
    document,
  });
});

legalRouter.get("/draft", async (req, res) => {
  const schema = z.object({
    type: documentTypeSchema,
  });

  const query = schema.parse(req.query);
  const document = await getDraftLegalDocument(query.type);

  return res.json({
    success: true,
    document,
  });
});

legalRouter.get("/history", async (req, res) => {
  const schema = z.object({
    type: documentTypeSchema,
  });

  const query = schema.parse(req.query);
  const documents = await getLegalDocumentHistory(query.type);

  return res.json({
    success: true,
    documents,
  });
});

legalRouter.post("/draft", async (req, res) => {
  const schema = z.object({
    documentType: documentTypeSchema,
    contentHtml: z.string().min(1),
  });

  const body = schema.parse(req.body);

  const document = await saveDraftLegalDocument({
    documentType: body.documentType,
    contentHtml: body.contentHtml,
    createdByAdminId: null,
  });

  return res.json({
    success: true,
    document,
  });
});

legalRouter.post("/publish", async (req, res) => {
  const schema = z.object({
    documentType: documentTypeSchema,
    contentHtml: z.string().min(1),
  });

  const body = schema.parse(req.body);

  const document = await publishLegalDocument({
    documentType: body.documentType,
    contentHtml: body.contentHtml,
    createdByAdminId: null,
  });

  return res.json({
    success: true,
    document,
  });
});

legalRouter.get("/:id/download", async (req, res) => {
  const schema = z.object({
    id: z.coerce.number().int().min(1),
  });

  const params = schema.parse(req.params);
  const document = await getDownloadableLegalDocument(params.id);

  if (!document) {
    return res.status(404).json({
      success: false,
      message: "Document introuvable",
    });
  }

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${document.filename}"`
  );

  return res.send(document.html);
});