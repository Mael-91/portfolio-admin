import { apiFetch } from "./api";

export interface AuthUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

export interface LoginResponse {
  success: boolean;
  user: AuthUser;
}

export interface MeResponse {
  success: boolean;
  user: AuthUser;
}

export async function login(params: {
  email: string;
  password: string;
}): Promise<LoginResponse> {
  return apiFetch<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export async function logout(): Promise<{ success: boolean }> {
  return apiFetch<{ success: boolean }>("/api/auth/logout", {
    method: "POST",
  });
}

export async function getMe(): Promise<MeResponse> {
  return apiFetch<MeResponse>("/api/auth/me", {
    method: "GET",
  });
}