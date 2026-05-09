import type { BillingUiMode } from "../../_core/billing-state";
import type {
  AccountBillingOrderDto,
  AccountBillingOrderHistoryDto,
  AccountBillingSummaryV1,
  BillingSummaryCurrentPlan,
  BillingTrialSummaryV1,
} from "@/types/api/account";

export type LabelledAvailableAction = {
  key: string;
  label: string;
};

export type BillingSectionsProps = {
  data: AccountBillingSummaryV1;
  billingUiMode: BillingUiMode;
  orders: AccountBillingOrderHistoryDto[];
  ordersLoadError: Error | null;
  onRetryOrders: () => void;
};

export type BillingPaidActiveStatusCardProps = {
  activeOrder: AccountBillingOrderDto | null;
  currentPlan: BillingSummaryCurrentPlan | null;
  orders: AccountBillingOrderHistoryDto[];
};

export type BillingActiveTrialStatusCardProps = {
  trial: BillingTrialSummaryV1 | null;
};
