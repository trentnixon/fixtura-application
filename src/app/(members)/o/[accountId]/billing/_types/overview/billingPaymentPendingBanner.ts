import type { AccountBillingOrderHistoryDto, AccountBillingSummaryV1 } from "@/types/api/account";

export type BillingPaymentPendingBannerProps = {
  accountId: string;
  summary: AccountBillingSummaryV1;
  orders?: AccountBillingOrderHistoryDto[] | null;
};
