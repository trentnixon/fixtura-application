import type { AccountBillingSummaryV1, AccountBillingOrderHistoryDto } from "@/types/api/account";

export type BillingDebugPanelProps = {
  accountId: string;
  contextLabel?: string;
  summary: AccountBillingSummaryV1 | null;
  /** When set (e.g. overview), snapshot derivation matches pending detection that uses GET /orders rows. */
  orders?: AccountBillingOrderHistoryDto[] | null;
  isSummaryLoading: boolean;
  summaryError?: string | null;
  extra?: Record<string, string | number | boolean | null | undefined>;
};
