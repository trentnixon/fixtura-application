import type { BillingUiMode } from "../../_core/billing-state";
import type { AccountBillingOrderHistoryDto, BillingTrialSummaryV1 } from "@/types/api/account";

export type BillingTrialDetailsTriggerOptions = {
  referenceDate?: Date;
  orders?: AccountBillingOrderHistoryDto[] | null;
};

export type BillingTrialDetailsDialogProps = {
  trial: BillingTrialSummaryV1 | null | undefined;
  uiMode: BillingUiMode;
  emphasize: boolean;
  /** Default `button` matches billing overview actions; `text` sits below Season Pass card. */
  triggerVariant?: "button" | "text";
  /** Org-trial context shown inside the dialog (e.g. active elsewhere). */
  organisationTrialNoticePresentation?: "active_on_another_account" | null;
};

export type TrialDetailsBodyProps = {
  trial: BillingTrialSummaryV1 | null | undefined;
  uiMode: BillingUiMode;
  emphasize: boolean;
  organisationTrialNoticePresentation?: "active_on_another_account" | null;
};

export type TrialDetailsBodyTrialInfoProps = {
  trial: BillingTrialSummaryV1;
  uiMode: BillingUiMode;
};
