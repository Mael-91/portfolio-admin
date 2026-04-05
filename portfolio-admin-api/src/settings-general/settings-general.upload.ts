import fs from "fs";
import multer from "multer";
import path from "path";
import { randomUUID } from "crypto";
import { getStoragePath } from "../common/storagePath";

const logosDir = getStoragePath("logos");

if (!fs.existsSync(logosDir)) {
  fs.mkdirSync(logosDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, logosDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    cb(null, `${Date.now()}-${randomUUID()}${ext}`);
  },
});

export const settingsGeneralUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});