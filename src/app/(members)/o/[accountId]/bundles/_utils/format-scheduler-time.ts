/** Format CMS scheduler `Time` (e.g. `06:00:00.000`) for display; returns null when unset or unparseable. */
export function formatSchedulerTime(raw: string | null | undefined): string | null {
  if (!raw?.trim()) return null;

  const match = /^(\d{1,2}):(\d{2})/.exec(raw.trim());
  if (!match) return null;

  const hours = Number.parseInt(match[1] ?? "", 10);
  const minutes = Number.parseInt(match[2] ?? "", 10);
  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return null;
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;

  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}
