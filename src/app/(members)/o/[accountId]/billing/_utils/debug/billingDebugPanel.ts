import { deriveBillingUiMode } from "../../_core/billing-state";
import { shouldShowPlanCheckout } from "../create-subscription/checkoutActionGate";
import { shouldShowInvoiceRequest } from "../invoice-request/billingInvoiceRequest";

import type { AccountBillingOrderHistoryDto, AccountBillingSummaryV1 } from "@/types/api/account";

export type BillingDebugFunnelGates = {
  planCheckout: boolean;
  invoiceRequest: boolean;
};

export function buildBillingDebugFunnelGates(
  summary: AccountBillingSummaryV1 | null,
  options?: {
    orders?: AccountBillingOrderHistoryDto[] | null;
  },
): BillingDebugFunnelGates {
  if (!summary) {
    return { planCheckout: false, invoiceRequest: false };
  }
  const billingUiMode = deriveBillingUiMode(summary, { orders: options?.orders ?? null });
  return {
    planCheckout:
      billingUiMode !== "paid_active" && shouldShowPlanCheckout(summary.availableActions),
    invoiceRequest: shouldShowInvoiceRequest(summary.availableActions, { billingUiMode }),
  };
}

export type BillingDebugPanelExtraValue = string | number | boolean | null;

export function collectBillingDebugPanelExtraEntries(
  extra: Record<string, string | number | boolean | null | undefined> | undefined,
): Array<[string, BillingDebugPanelExtraValue]> {
  if (!extra) return [];
  const out: Array<[string, BillingDebugPanelExtraValue]> = [];
  for (const [k, v] of Object.entries(extra)) {
    if (v !== undefined) out.push([k, v]);
  }
  return out;
}

export function resolveBillingDebugPanelFetchStatus(
  summary: AccountBillingSummaryV1 | null,
  options: {
    isSummaryLoading: boolean;
    summaryError?: string | null | undefined;
  },
): string {
  if (options.isSummaryLoading) {
    return "loading";
  }

  if (options.summaryError) {
    return `error: ${options.summaryError}`;
  }

  if (!summary) {
    return "no payload";
  }

  return "ok";
}
