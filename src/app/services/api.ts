import { env } from "../../env";
import { extractApiErrorMessage, parseApiResponse } from "./ApiErrorMessage";

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${env.apiBaseUrl}${path}`;

  const headers = new Headers(options.headers || {});
  const isFormData = options.body instanceof FormData;

  if (!isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...options,
    credentials: "include",
    headers,
  });

  const data = await parseApiResponse(response);

  if (!response.ok) {
    throw new Error(
      extractApiErrorMessage(data, "Erreur serveur")
    );
  }

  return data as T;
}