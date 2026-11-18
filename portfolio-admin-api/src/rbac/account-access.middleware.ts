import type { RequestHandler } from "express";
import type { PermissionCode } from "./permission-catalog";
import { loadAccountAccess } from "./account-access";

export function requireAccountAccess(permission?: PermissionCode, { admin = false } = {}): RequestHandler {
  return async (req, res, next) => {
    const id = req.session?.adminUser?.id;
    const access = id === undefined ? null : await loadAccountAccess(id);
    if (!access) {
      res.status(401).json({ success: false, message: "Non authentifié" });
      return;
    }

    if ((admin && !access.roles.includes("admin")) || (permission && !access.permissions.includes(permission))) {
      res.status(403).json({ success: false, message: "Accès interdit" });
      return;
    }

    res.locals.accountAccess = access;
    next();
  };
}
