import { z } from "zod";
import { ASSIGNABLE_PERMISSION_CODES } from "./permission-catalog";

const roleCodeSchema = z.string().min(1).max(64).regex(/^[a-z][a-z0-9_-]*$/);
export const roleIdSchema = z.string().regex(/^[1-9][0-9]{0,19}$/).refine(
  (value) => value.length < 20 || value <= "18446744073709551615",
  "Identifiant de rôle invalide"
);
export const roleSchema = z.object({
  code: roleCodeSchema,
  permissions: z.array(z.string().refine((code) => ASSIGNABLE_PERMISSION_CODES.some((permission) => permission === code), "Permission non attribuable")).max(ASSIGNABLE_PERMISSION_CODES.length),
});
