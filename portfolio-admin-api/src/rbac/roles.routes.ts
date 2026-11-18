import { Router } from "express";
import { handleRouteError } from "../common/handle-route-error";
import { roleIdSchema, roleSchema } from "./roles.schemas";
import { requireAccountAccess } from "./account-access.middleware";
import { deleteRole, listRoles, saveRole } from "./roles.repository";

export const rolesRouter = Router();
rolesRouter.use(requireAccountAccess(undefined, { admin: true }));

rolesRouter.get("/", async (_req, res) => {
  res.json({ success: true, ...await listRoles() });
});

rolesRouter.post("/", async (req, res) => {
  try {
    const { code, permissions } = roleSchema.parse(req.body);
    await saveRole(req.session.adminUser!.id, null, code, permissions);
    res.status(201).json({ success: true });
  } catch (error) {
    return handleRouteError(res, error, "Création du rôle");
  }
});

rolesRouter.put("/:id", async (req, res) => {
  try {
    const id = roleIdSchema.parse(req.params.id);
    const { code, permissions } = roleSchema.parse(req.body);
    await saveRole(req.session.adminUser!.id, id, code, permissions);
    res.json({ success: true });
  } catch (error) {
    return handleRouteError(res, error, "Modification du rôle");
  }
});

rolesRouter.delete("/:id", async (req, res) => {
  try {
    await deleteRole(req.session.adminUser!.id, roleIdSchema.parse(req.params.id));
    res.json({ success: true });
  } catch (error) {
    return handleRouteError(res, error, "Suppression du rôle");
  }
});
