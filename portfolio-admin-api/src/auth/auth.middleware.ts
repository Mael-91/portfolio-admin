import { Request, Response, NextFunction } from "express";

export function requireAdminAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.session.adminUser) {
    return res.status(401).json({
      success: false,
      message: "Non authentifié",
    });
  }

  next();
}