import bcrypt from "bcrypt";
import {
  findAdminUserByEmail,
  findAdminUserById,
  findAdminUsers,
  insertAdminUser,
  updateAdminUser,
  updateAdminUserActiveStatus,
  updateAdminUserPassword,
  deleteAdminUserById
} from "./users.repository";
import { AppError } from "../common/app-error";

function sanitizeUser(user: any) {
  return {
    id: user.id,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    isActive: Boolean(user.is_active),
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  };
}

export async function listAdminUsers() {
  const users = await findAdminUsers();
  return users.map(sanitizeUser);
}

export async function createAdminUser(params: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}) {
  const existing = await findAdminUserByEmail(params.email);

  if (existing) {
    throw new AppError({
      code: "EMAIL_ALREADY_EXISTS",
      message: "Cet email existe déjà.",
      statusCode: 409,
    });
  }

  const passwordErrors = validatePasswordStrength(params.password);

  if (passwordErrors.length > 0) {
    throw new AppError({
      code: "WEAK_PASSWORD",
      message: passwordErrors.join(" "),
      statusCode: 400,
    });
  }

  const passwordHash = await bcrypt.hash(params.password, 12);

  const id = await insertAdminUser({
    email: params.email,
    passwordHash,
    firstName: params.firstName,
    lastName: params.lastName,
  });

  const user = await findAdminUserById(id);

  if (!user) {
    throw new AppError({
      code: "USER_NOT_FOUND_AFTER_CREATE",
      message: "Utilisateur introuvable après création.",
      statusCode: 500,
    });
  }

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

  const user = await findAdminUserById(params.id);

  if (!user) {
    throw new AppError({
      code: "USER_NOT_FOUND",
      message: "Utilisateur introuvable.",
      statusCode: 404,
    });
  }

  await deleteAdminUserById(params.id);

  return { success: true };
}

export async function editAdminUser(params: {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
}) {
  const user = await findAdminUserById(params.id);

  if (!user) {
    throw new AppError({
      code: "USER_NOT_FOUND",
      message: "Utilisateur introuvable.",
      statusCode: 404,
    });
  }

  const existing = await findAdminUserByEmail(params.email);

  if (existing && existing.id !== params.id) {
    throw new AppError({
      code: "EMAIL_ALREADY_EXISTS",
      message: "Cet email existe déjà.",
      statusCode: 409,
    });
  }

  await updateAdminUser(params);

  const updated = await findAdminUserById(params.id);

  if (!updated) {
    throw new AppError({
      code: "USER_NOT_FOUND",
      message: "Utilisateur introuvable.",
      statusCode: 404,
    });
  }

  return sanitizeUser(updated);
}

export async function resetAdminUserPassword(params: {
  id: number;
  password: string;
}) {
  const user = await findAdminUserById(params.id);

  if (!user) {
    throw new AppError({
      code: "USER_NOT_FOUND",
      message: "Utilisateur introuvable.",
      statusCode: 404,
    });
  }

  const passwordErrors = validatePasswordStrength(params.password);

  if (passwordErrors.length > 0) {
    throw new AppError({
      code: "WEAK_PASSWORD",
      message: passwordErrors.join(" "),
      statusCode: 400,
    });
  }

  const passwordHash = await bcrypt.hash(params.password, 12);

  await updateAdminUserPassword({
    id: params.id,
    passwordHash,
  });

  const updated = await findAdminUserById(params.id);

  if (!updated) {
    throw new AppError({
      code: "USER_NOT_FOUND",
      message: "Utilisateur introuvable.",
      statusCode: 404,
    });
  }

  return sanitizeUser(updated);
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

  const user = await findAdminUserById(params.id);

  if (!user) {
    throw new AppError({
      code: "USER_NOT_FOUND",
      message: "Utilisateur introuvable.",
      statusCode: 404,
    });
  }

  await updateAdminUserActiveStatus({
    id: params.id,
    isActive: params.isActive,
  });

  const updated = await findAdminUserById(params.id);

  if (!updated) {
    throw new AppError({
      code: "USER_NOT_FOUND",
      message: "Utilisateur introuvable.",
      statusCode: 404,
    });
  }

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