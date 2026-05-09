/** Human-readable end date for “subscription ending” copy; empty when unknown. */
export function formatBillingOrderEndLabel(value: string | null): string {
  if (!value) return "";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString();
}
