import Link from "next/link";

import { Button } from "@/components/ui/button";

import { BillingTrialDetailsDialog } from "../../trial/billing-trial-details-dialog";
import {
  ACTIVE_TRIAL_CREATE_SUBSCRIPTION_LABEL,
  DEFAULT_CREATE_SUBSCRIPTION_LABEL,
} from "../_constants/billingOverviewActions";
import { showCreateSubscriptionCta } from "../_utils/showCreateSubscriptionCta";

import type { BillingUiMode } from "../../_core/billing-state";
import type { BillingOverviewActionsProps } from "../_types/billingOverviewActions";

function showTrialDetailsInActionsBar(
  billingUiMode: BillingUiMode,
  trialDetailsTrigger: BillingOverviewActionsProps["trialDetailsTrigger"],
): trialDetailsTrigger is NonNullable<BillingOverviewActionsProps["trialDetailsTrigger"]> {
  if (!trialDetailsTrigger) {
    return false;
  }

  return (
    billingUiMode !== "trial_expired" &&
    billingUiMode !== "no_billing" &&
    billingUiMode !== "payment_pending"
  );
}

export function BillingOverviewActions({
  billingUiMode,
  billingSummary,
  trialDetailsTrigger,
  createHref,
}: BillingOverviewActionsProps) {
  const showCreateCta = showCreateSubscriptionCta(billingUiMode, billingSummary.availableActions);
  const createCtaLabel =
    billingUiMode === "active_trial"
      ? ACTIVE_TRIAL_CREATE_SUBSCRIPTION_LABEL
      : DEFAULT_CREATE_SUBSCRIPTION_LABEL;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {showTrialDetailsInActionsBar(billingUiMode, trialDetailsTrigger) ? (
        <BillingTrialDetailsDialog
          trial={billingSummary.trial}
          uiMode={billingUiMode}
          emphasize={trialDetailsTrigger.emphasize}
        />
      ) : null}

      {showCreateCta ? (
        <Button type="button" size="sm" asChild>
          <Link href={createHref}>{createCtaLabel}</Link>
        </Button>
      ) : null}
    </div>
  );
}
