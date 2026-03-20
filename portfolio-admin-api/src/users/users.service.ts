import bcrypt from "bcrypt";
import {
  findAdminUserByEmail,
  findAdminUserById,
  findAdminUsers,
  insertAdminUser,
  updateAdminUser,
  updateAdminUserActiveStatus,
  updateAdminUserPassword,
} from "./users.repository";

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
    throw new Error("EMAIL_ALREADY_EXISTS");
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
    throw new Error("USER_NOT_FOUND_AFTER_CREATE");
  }

  return sanitizeUser(user);
}

export async function editAdminUser(params: {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
}) {
  const existing = await findAdminUserByEmail(params.email);

  if (existing && existing.id !== params.id) {
    throw new Error("EMAIL_ALREADY_EXISTS");
  }

  await updateAdminUser(params);

  const user = await findAdminUserById(params.id);

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  return sanitizeUser(user);
}

export async function resetAdminUserPassword(params: {
  id: number;
  password: string;
}) {
  const user = await findAdminUserById(params.id);

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  const passwordHash = await bcrypt.hash(params.password, 12);

  await updateAdminUserPassword({
    id: params.id,
    passwordHash,
  });

  const updated = await findAdminUserById(params.id);

  if (!updated) {
    throw new Error("USER_NOT_FOUND");
  }

  return sanitizeUser(updated);
}

export async function setAdminUserActiveStatus(params: {
  id: number;
  isActive: boolean;
  currentAdminUserId: number;
}) {
  if (params.id === params.currentAdminUserId && !params.isActive) {
    throw new Error("CANNOT_DISABLE_SELF");
  }

  const user = await findAdminUserById(params.id);

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  await updateAdminUserActiveStatus({
    id: params.id,
    isActive: params.isActive,
  });

  const updated = await findAdminUserById(params.id);

  if (!updated) {
    throw new Error("USER_NOT_FOUND");
  }

  return sanitizeUser(updated);
}