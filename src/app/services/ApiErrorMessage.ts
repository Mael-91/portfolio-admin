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