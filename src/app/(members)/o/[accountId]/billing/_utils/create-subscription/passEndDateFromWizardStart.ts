import { addDays, format, startOfDay } from "date-fns";

/** Aligns with wizard calendar (local day, midnight-normalised). */
export function parseBillingIsoToCalendarDate(iso: string): Date | undefined {
  if (!iso) return undefined;
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return undefined;
  return startOfDay(d);
}

/**
 * End date (YYYY-MM-DD, local) for an inclusive pass of {@link daysInPass} days starting {@link startDateYyyyMmDd}.
 * Example: days 365 from 2026-01-01 → 2026-12-30.
 */
export function computePassEndDateYyyyMmDd(startDateYyyyMmDd: string, daysInPass: number): string {
  const base = parseBillingIsoToCalendarDate(startDateYyyyMmDd);
  if (!base) {
    throw new Error(`Invalid start date for pass end computation: "${startDateYyyyMmDd}"`);
  }
  const inclusiveDays = Math.max(1, Math.floor(daysInPass));
  const end = addDays(base, inclusiveDays - 1);
  return format(end, "yyyy-MM-dd");
}
