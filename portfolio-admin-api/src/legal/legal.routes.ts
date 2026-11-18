import { Router } from "express";
import { z } from "zod";
import { requireAccountAccess } from "../rbac/account-access.middleware";
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

legalRouter.get("/types", requireAccountAccess("legal.read"), (_req, res) => {
  return res.json({
    success: true,
    types: getLegalDocumentTypes(),
  });
});

legalRouter.get("/current", requireAccountAccess("legal.read"), async (req, res) => {
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

legalRouter.get("/draft", requireAccountAccess("legal.read"), async (req, res) => {
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

legalRouter.get("/history", requireAccountAccess("legal.read"), async (req, res) => {
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

legalRouter.post("/draft", requireAccountAccess("legal.draft"), async (req, res) => {
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
    ...(res.locals.accountAccess.permissions.includes("legal.read") ? { document } : { id: document?.id }),
  });
});

legalRouter.post("/publish", requireAccountAccess("legal.publish"), async (req, res) => {
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
    ...(res.locals.accountAccess.permissions.includes("legal.read") ? { document } : { id: document?.id }),
  });
});

legalRouter.get("/:id/download", requireAccountAccess("legal.download"), async (req, res) => {
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