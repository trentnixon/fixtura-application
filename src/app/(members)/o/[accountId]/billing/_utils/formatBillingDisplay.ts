export function formatMoney(amount: number | null, currency: string | null): string {
  if (amount == null) return "—";
  const c = currency?.trim() || "AUD";
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency: c }).format(amount);
  } catch {
    return `${amount} ${c}`;
  }
}

/** Long-form dates for billing/trial UI (e.g. “Wednesday, 6 May 2026”). */
export function formatBillingDateLong(
  value: string | null | undefined,
  locale: string = "en-AU",
): string {
  if (value == null || value === "") return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return new Intl.DateTimeFormat(locale, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}

/** Reader-friendly dates for dense tables (e.g. “7 May 2026”, locale-aware). */
export function formatBillingDateTable(
  value: string | null | undefined,
  locale: string = "en-AU",
): string {
  if (value == null || value === "") return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

export function formatDateLabel(value: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString();
}

export function formatBillingDateRangeLine(
  start: string | null | undefined,
  end: string | null | undefined,
): string {
  return `${formatDateLabel(start ?? null)} — ${formatDateLabel(end ?? null)}`;
}
