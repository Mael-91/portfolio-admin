import { getSettings, updateSetting } from "./settings.repository";
import {
  purgeExpiredMessages,
  countExpiredMessages,
} from "./rgpd-purge.service";

function parseTimeToMinutes(value: string) {
  const match = /^(\d{2}):(\d{2})$/.exec(value);

  if (!match) {
    return 180; 
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return 180;
  }

  return hours * 60 + minutes;
}

function formatHourValue(value: string | undefined) {
  if (!value || value.trim() === "") {
    return "03:00";
  }

  // compat ancien format "3", "14"
  if (/^\d{1,2}$/.test(value.trim())) {
    const hour = Number(value.trim());
    if (hour >= 0 && hour <= 23) {
      return `${String(hour).padStart(2, "0")}:00`;
    }
  }

  if (/^\d{2}:\d{2}$/.test(value.trim())) {
    return value.trim();
  }

  return "03:00";
}

function hasAlreadyRunToday(lastRunAt: string | null, now: Date) {
  if (!lastRunAt) return false;

  const last = new Date(lastRunAt);

  return (
    last.getFullYear() === now.getFullYear() &&
    last.getMonth() === now.getMonth() &&
    last.getDate() === now.getDate()
  );
}

function isTimeReached(purgeHour: string, now: Date) {
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  return currentMinutes >= parseTimeToMinutes(purgeHour);
}

function toSqlDateTime(date: Date) {
  return date.toISOString().slice(0, 19).replace("T", " ");
}

function getNextScheduledRun(purgeHour: string) {
  const now = new Date();
  const [hour, minute] = purgeHour.split(":").map(Number);

  const next = new Date();
  next.setHours(hour, minute, 0, 0);

  if (next <= now) {
    next.setDate(next.getDate() + 1);
  }

  return next;
}

export async function getAppSettings() {
  const settings = await getSettings();

  return {
    retentionDays: Number(settings.rgpd_retention_days || 90),
    autoPurgeEnabled: settings.rgpd_auto_purge_enabled === "true",
    purgeHour: formatHourValue(settings.rgpd_purge_hour),
    lastRunAt:
      settings.rgpd_last_run_at && settings.rgpd_last_run_at.trim() !== ""
        ? settings.rgpd_last_run_at
        : null,
  };
}

export async function updateAppSettings(data: {
  retentionDays: number;
  autoPurgeEnabled: boolean;
  purgeHour: string;
}) {
  await updateSetting("rgpd_retention_days", String(data.retentionDays));
  await updateSetting(
    "rgpd_auto_purge_enabled",
    data.autoPurgeEnabled ? "true" : "false"
  );
  await updateSetting("rgpd_purge_hour", data.purgeHour);
}

export async function updateRgpdLastRunAt(value: string | null) {
  await updateSetting("rgpd_last_run_at", value ?? "");
}

export async function purgeOldMessages() {
  const settings = await getAppSettings();
  return purgeExpiredMessages(settings.retentionDays);
}

export async function runRgpdPurgeNow() {
  const settings = await getAppSettings();

  const result = await purgeOldMessages();

  const now = new Date();
  const sqlDate = now.toISOString().slice(0, 19).replace("T", " ");

  await updateRgpdLastRunAt(sqlDate);

  return {
    deleted: result.deleted,
    retentionDays: settings.retentionDays,
    executedAt: sqlDate,
  };
}

export async function runScheduledRgpdPurgeIfDue() {
  const settings = await getAppSettings();

  if (!settings.autoPurgeEnabled) {
    return { ran: false, reason: "disabled" as const };
  }

  const now = new Date();

  if (!isTimeReached(settings.purgeHour, now)) {
    return { ran: false, reason: "time_not_reached" as const };
  }

  if (hasAlreadyRunToday(settings.lastRunAt, now)) {
    return { ran: false, reason: "already_ran_today" as const };
  }

  const result = await runRgpdPurgeNow();

  return {
    ran: true,
    reason: "executed" as const,
    deleted: result.deleted,
    executedAt: result.executedAt,
  };
}

export async function getRgpdStats(retentionDaysOverride?: number) {
  const settings = await getAppSettings();
  const retentionDays = retentionDaysOverride ?? settings.retentionDays;

  const toDelete = await countExpiredMessages(retentionDays);

  return {
    toDelete,
    nextDeletionDate: getNextScheduledRun(settings.purgeHour),
    lastRunAt: settings.lastRunAt,
  };
}