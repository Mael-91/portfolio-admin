import fs from "fs";
import multer from "multer";
import path from "path";
import { randomUUID } from "crypto";
import { getStoragePath } from "../common/storagePath";

const uploadDir = getStoragePath("portfolio-site-settings");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    cb(null, `${Date.now()}-${randomUUID()}${ext}`);
  },
});

export const portfolioSiteSettingsUpload = multer({
  storage,
  limits: {
    fileSize: 8 * 1024 * 1024,
  },
});