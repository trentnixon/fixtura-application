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

export {
  parseOrderTotalRaw as parseBillingHistoryOrderTotal,
  resolveHistoryOrderTotalForDisplay,
  resolveSummaryOrderTotalForDisplay,
} from "../../_utils/orders/billingHistoryOrderUtils";
