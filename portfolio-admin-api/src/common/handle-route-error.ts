import { Response } from "express";
import { ZodError } from "zod";
import { isAppError } from "./app-error";

export function handleRouteError(
  res: Response,
  error: unknown,
  context: string
) {
  console.error(`RAW ERROR [${context}]:`, error);

  // ✅ Zod en premier
  if (error instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message:
        error.issues?.map((issue) => issue.message).join(" ") ||
        "Données invalides.",
      errors: error.issues,
    });
  }

  // ✅ erreurs métier
  if (isAppError(error)) {
    return res.status(error.statusCode).json({
      success: false,
      code: error.code,
      message: error.message,
    });
  }

  // ❌ fallback
  console.error(`Erreur ${context} :`, error);

  return res.status(500).json({
    success: false,
    message: "Erreur serveur",
  });
}