import bcrypt from "bcrypt";
import {
  findAdminUsers,
  insertAdminUser,
  updateAdminUser,
  updateAdminUserPassword,
  type AdminUserRow,
  mutateAdminUserStatus
} from "./users.repository";
import { AppError } from "../common/app-error";

function sanitizeUser(user: AdminUserRow) {
  return {
    id: user.id,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    roles: user.roles,
    isActive: Boolean(user.is_active),
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  };
}

export async function listAdminUsers() {
  const users = await findAdminUsers();
  return users.map(sanitizeUser);
}

async function hashAdminPassword(password: string) {
  const errors = validatePasswordStrength(password);
  if (errors.length) {
    throw new AppError({ code: "WEAK_PASSWORD", message: errors.join(" "), statusCode: 400 });
  }
  return bcrypt.hash(password, 12);
}

export async function createAdminUser(params: {
  actorId: number;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  roleIds?: string[];
}) {
  const { password, ...account } = params;
  const user = await insertAdminUser({ ...account, passwordHash: await hashAdminPassword(password) });
  return sanitizeUser(user);
}

export async function deleteAdminUser(params: {
  id: number;
  currentAdminUserId: number;
}) {
  if (params.id === params.currentAdminUserId) {
    throw new AppError({
      code: "CANNOT_DELETE_SELF",
      message: "Impossible de supprimer votre propre compte.",
      statusCode: 400,
    });
  }

  await mutateAdminUserStatus({
    id: params.id,
    actorId: params.currentAdminUserId,
    operation: "delete",
  });

  return { success: true };
}

export async function editAdminUser(params: {
  id: number;
  actorId: number;
  email: string;
  firstName: string;
  lastName: string;
  roleIds?: string[];
  password?: string;
}) {
  const { password, ...account } = params;
  const passwordHash = password === undefined ? undefined : await hashAdminPassword(password);
  return sanitizeUser(await updateAdminUser({ ...account, passwordHash }));
}

export async function resetAdminUserPassword(params: {
  id: number;
  actorId: number;
  password: string;
}) {
  const { password, ...account } = params;
  const user = await updateAdminUserPassword({ ...account, passwordHash: await hashAdminPassword(password) });
  return sanitizeUser(user);
}

export async function setAdminUserActiveStatus(params: {
  id: number;
  isActive: boolean;
  currentAdminUserId: number;
}) {
  if (params.id === params.currentAdminUserId && !params.isActive) {
    throw new AppError({
      code: "CANNOT_DISABLE_SELF",
      message: "Impossible de désactiver votre propre compte.",
      statusCode: 400,
    });
  }

  const updated = await mutateAdminUserStatus({
    id: params.id,
    actorId: params.currentAdminUserId,
    operation: params.isActive ? "enable" : "disable",
  });
  if (!updated) throw new Error("Utilisateur introuvable après mise à jour");
  return sanitizeUser(updated);
}

function validatePasswordStrength(password: string) {
  const errors: string[] = [];

  if (password.length < 12) {
    errors.push("Le mot de passe doit contenir au moins 12 caractères.");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Le mot de passe doit contenir au moins une majuscule.");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Le mot de passe doit contenir au moins une minuscule.");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Le mot de passe doit contenir au moins un chiffre.");
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push("Le mot de passe doit contenir au moins un caractère spécial.");
  }

  return errors;
}