export function extractApiErrorMessage(data: any, fallback: string) {
  if (typeof data?.message === "string" && data.message.trim()) {
    return data.message;
  }

  if (Array.isArray(data?.errors) && data.errors.length > 0) {
    return data.errors
      .map((error: any) => error?.message)
      .filter(Boolean)
      .join(" ");
  }

  return fallback;
}

export async function parseApiResponse(res: Response) {
  const contentType = res.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return await res.json();
  }

  const text = await res.text();

  if (!res.ok) {
    return {
      success: false,
      message: "Réponse invalide du serveur",
      raw: text,
    };
  }

  return text;
}