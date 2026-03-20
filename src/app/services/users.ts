import { env } from "../../env";

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
  const res = await fetch(`${env.apiBaseUrl}/api/users`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Erreur récupération utilisateurs");
  }

  return res.json();
}

export async function createAdminUser(payload: {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}) {
  const res = await fetch(`${env.apiBaseUrl}/api/users`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Erreur création utilisateur");
  }

  return data;
}

export async function updateAdminUser(
  id: number,
  payload: {
    email: string;
    firstName: string;
    lastName: string;
  }
) {
  const res = await fetch(`${env.apiBaseUrl}/api/users/${id}`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Erreur modification utilisateur");
  }

  return data;
}

export async function updateAdminUserPassword(
  id: number,
  payload: {
    password: string;
  }
) {
  const res = await fetch(`${env.apiBaseUrl}/api/users/${id}/password`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Erreur mise à jour mot de passe");
  }

  return data;
}

export async function updateAdminUserActiveStatus(
  id: number,
  payload: {
    isActive: boolean;
  }
) {
  const res = await fetch(`${env.apiBaseUrl}/api/users/${id}/active`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Erreur activation utilisateur");
  }

  return data;
}