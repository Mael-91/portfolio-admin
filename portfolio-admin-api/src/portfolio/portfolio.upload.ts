import multer from "multer";

const imageExtensions = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["image/avif", ".avif"],
]);

export function portfolioImageExtension(mimeType: string) {
  return imageExtensions.get(mimeType);
}

function fileFilter(
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) {
  if (!portfolioImageExtension(file.mimetype)) {
    cb(new Error("UNSUPPORTED_FILE_TYPE"));
    return;
  }

  cb(null, true);
}

export const portfolioUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
    fields: 5,
  },
});