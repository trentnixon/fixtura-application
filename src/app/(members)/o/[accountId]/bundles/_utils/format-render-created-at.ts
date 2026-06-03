function parseRenderCreatedAt(iso: string): Date | null {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

export function formatRenderCreatedDate(iso: string): string {
  const date = parseRenderCreatedAt(iso);
  if (!date) return iso;
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatRenderCreatedTime(iso: string): string {
  const date = parseRenderCreatedAt(iso);
  if (!date) return "";
  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Combined date and time (detail views, headers). */
export function formatRenderCreatedAt(iso: string): string {
  const date = parseRenderCreatedAt(iso);
  if (!date) return iso;
  const datePart = formatRenderCreatedDate(iso);
  const timePart = formatRenderCreatedTime(iso);
  return timePart ? `${datePart}, ${timePart}` : datePart;
}
