import type { BillingUiMode } from "../core/billing-state";
import type { AccountBillingOrderHistoryDto, BillingTrialSummaryV1 } from "@/types/api/account";

export type BillingTrialDetailsTriggerOptions = {
  referenceDate?: Date;
  orders?: AccountBillingOrderHistoryDto[] | null;
};

export type BillingTrialDetailsDialogProps = {
  trial: BillingTrialSummaryV1 | null | undefined;
  uiMode: BillingUiMode;
  emphasize: boolean;
};

export type TrialDetailsBodyProps = {
  trial: BillingTrialSummaryV1 | null | undefined;
  uiMode: BillingUiMode;
  emphasize: boolean;
};

export type TrialDetailsBodyTrialInfoProps = {
  trial: BillingTrialSummaryV1;
  uiMode: BillingUiMode;
};
