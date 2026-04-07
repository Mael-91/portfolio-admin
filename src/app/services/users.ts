import { apiFetch } from "./api";

export type AdminUser = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export async function fetchAdminUsers() {
  return apiFetch<{
    success: true;
    users: AdminUser[];
  }>("/api/users");
}

export async function createAdminUser(payload: {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}) {
  return apiFetch<{
    success: true;
    user: AdminUser;
  }>("/api/users", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateAdminUser(
  id: number,
  payload: {
    email: string;
    firstName: string;
    lastName: string;
  }
) {
  return apiFetch<{
    success: true;
    user: AdminUser;
  }>(`/api/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function updateAdminUserPassword(
  id: number,
  payload: {
    password: string;
  }
) {
  return apiFetch<{
    success: true;
    user: AdminUser;
  }>(`/api/users/${id}/password`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function updateAdminUserActiveStatus(
  id: number,
  payload: {
    isActive: boolean;
  }
) {
  return apiFetch<{
    success: true;
    user: AdminUser;
  }>(`/api/users/${id}/active`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteAdminUser(id: number) {
  return apiFetch<{
    success: true;
  }>(`/api/users/${id}`, {
    method: "DELETE",
  });
}