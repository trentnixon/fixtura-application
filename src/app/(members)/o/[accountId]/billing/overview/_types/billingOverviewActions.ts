import type { BillingUiMode } from "../../_core/billing-state";
import type { billingTrialDetailsTriggerState } from "../../trial/billing-trial-details-dialog";
import type { AccountBillingSummaryV1 } from "@/types/api/account";

export type BillingOverviewActionsProps = {
  billingUiMode: BillingUiMode;
  billingSummary: AccountBillingSummaryV1;
  trialDetailsTrigger: ReturnType<typeof billingTrialDetailsTriggerState>;
  createHref: string;
  organisationTrialNoticePresentation?: "active_on_another_account" | null;
  /** Hide create-subscription CTA when a paid future-start order is already on file. */
  suppressCreateSubscriptionCta?: boolean;
  /** Support view: hide billing mutation CTAs (reads only). */
  readOnly?: boolean;
};
