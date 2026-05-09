import type { BillingUiMode } from "../../_core/billing-state";
import type { billingTrialDetailsTriggerState } from "../../trial/billing-trial-details-dialog";
import type { AccountBillingSummaryV1 } from "@/types/api/account";

export type BillingOverviewActionsProps = {
  billingUiMode: BillingUiMode;
  billingSummary: AccountBillingSummaryV1;
  trialDetailsTrigger: ReturnType<typeof billingTrialDetailsTriggerState>;
  historyHref: string;
  createHref: string;
};
