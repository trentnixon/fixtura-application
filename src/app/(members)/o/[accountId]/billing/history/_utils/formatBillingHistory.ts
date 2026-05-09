export function formatBillingHistoryMoney(amount: number | null, currency: string | null): string {
  if (amount == null) return "—";

  const resolvedCurrency = currency?.trim() || "AUD";

  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: resolvedCurrency,
    }).format(amount);
  } catch {
    return `${amount} ${resolvedCurrency}`;
  }
}

export function formatBillingHistoryDate(value: string | null): string {
  if (!value) return "—";

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString();
}

export function parseBillingHistoryOrderTotal(total: string | null): number | null {
  if (total == null || String(total).trim() === "") return null;

  const parsed = Number.parseFloat(String(total));
  return Number.isFinite(parsed) ? parsed : null;
}
