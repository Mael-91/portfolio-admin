import { apiFetch } from "./api";

export type RgpdSettings = {
  retentionDays: number;
  autoPurgeEnabled: boolean;
  purgeHour: string;
};

export type RgpdStats = {
  toDelete: number;
  nextDeletionDate: string | null;
  lastRunAt: string | null;
};

export async function fetchRgpdSettings() {
  return apiFetch<{
    success: true;
    settings: RgpdSettings;
  }>("/api/settings/rgpd");
}

export async function saveRgpdSettings(payload: {
  retentionDays: number;
  autoPurgeEnabled: boolean;
  purgeHour: string;
}) {
  return apiFetch<{
    success: true;
  }>("/api/settings/rgpd", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function fetchRgpdStats(retentionDays: number) {
  const query = new URLSearchParams({
    retentionDays: String(retentionDays),
  });

  return apiFetch<{
    success: true;
    stats: RgpdStats;
  }>(`/api/settings/rgpd/rgpd-stats?${query.toString()}`);
}

export async function runRgpdPurgeNow() {
  return apiFetch<{
    success: true;
    deleted: number;
    retentionDays?: number;
    executedAt?: string;
  }>("/api/settings/rgpd/purge-now", {
    method: "POST",
  });
}