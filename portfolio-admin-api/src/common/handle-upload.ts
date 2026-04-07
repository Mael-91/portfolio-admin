import type { Request, Response, NextFunction, RequestHandler } from "express";
import multer from "multer";
import { handleRouteError } from "./handle-route-error";

type UploadCallback = (req: Request, res: Response) => Promise<any>;

type HandleUploadOptions = {
  context: string;
  fileTooLargeMessage?: string;
};

export function handleUpload(
  uploadMiddleware: RequestHandler,
  callback: UploadCallback,
  options: HandleUploadOptions
) {
  return (req: Request, res: Response, _next: NextFunction) => {
    uploadMiddleware(req, res, async (err?: any) => {
      try {
        if (err) {
          if (err instanceof multer.MulterError) {
            if (err.code === "LIMIT_FILE_SIZE") {
              return res.status(400).json({
                success: false,
                message:
                  options.fileTooLargeMessage ||
                  "Le fichier est trop volumineux.",
              });
            }

            return res.status(400).json({
              success: false,
              message: `Erreur lors du téléchargement du fichier : ${err.message}`,
            });
          }

          return res.status(400).json({
            success: false,
            message: "Erreur lors du téléchargement du fichier.",
          });
        }

        return await callback(req, res);
      } catch (error) {
        return handleRouteError(res, error, options.context);
      }
    });
  };
}