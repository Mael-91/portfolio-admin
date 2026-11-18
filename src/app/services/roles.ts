import { apiFetch } from "./api";

export type RoleOption = { id: string; code: string };
export type Role = RoleOption & { permissions: string[]; inUse: boolean };

export type PermissionRight = {
  id: string;
  label: string;
  permissions: { code: string; label: string; systemOnly?: boolean }[];
};

export type PermissionCategory = {
  id: string;
  label: string;
  groups: { id: string; label: string; rights: PermissionRight[] }[];
};

export function fetchRoles(signal?: AbortSignal) {
  return apiFetch<{ success: true; roles: Role[]; categories: PermissionCategory[] }>("/api/roles", { signal });
}

export function saveRole(id: string | null, payload: { code: string; permissions: string[] }) {
  return apiFetch<{ success: true }>(id ? `/api/roles/${id}` : "/api/roles", {
    method: id ? "PUT" : "POST",
    body: JSON.stringify(payload),
  });
}

export function deleteRole(id: string) {
  return apiFetch<{ success: true }>(`/api/roles/${id}`, { method: "DELETE" });
}
