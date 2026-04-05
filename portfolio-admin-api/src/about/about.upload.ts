import fs from "fs";
import multer from "multer";
import path from "path";
import { randomUUID } from "crypto";
import { getStoragePath } from "../common/storagePath";

const aboutDir = getStoragePath("about");

if (!fs.existsSync(aboutDir)) {
  fs.mkdirSync(aboutDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, aboutDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    cb(null, `${Date.now()}-${randomUUID()}${ext}`);
  },
});

export const aboutUpload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
});