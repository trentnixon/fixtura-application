import Link from "next/link";

import { Button } from "@/components/ui/button";

import { BillingTrialDetailsDialog } from "../../trial/billing-trial-details-dialog";
import {
  ACTIVE_TRIAL_CREATE_SUBSCRIPTION_LABEL,
  BILLING_HISTORY_VISIBLE_MODES,
  DEFAULT_CREATE_SUBSCRIPTION_LABEL,
} from "../_constants/billingOverviewActions";
import { showCreateSubscriptionCta } from "../_utils/showCreateSubscriptionCta";

import type { BillingOverviewActionsProps } from "../_types/billingOverviewActions";

export function BillingOverviewActions({
  billingUiMode,
  billingSummary,
  trialDetailsTrigger,
  historyHref,
  createHref,
}: BillingOverviewActionsProps) {
  const showBillingHistory = BILLING_HISTORY_VISIBLE_MODES.includes(billingUiMode);
  const showCreateCta = showCreateSubscriptionCta(billingUiMode, billingSummary.availableActions);
  const createCtaLabel =
    billingUiMode === "active_trial"
      ? ACTIVE_TRIAL_CREATE_SUBSCRIPTION_LABEL
      : DEFAULT_CREATE_SUBSCRIPTION_LABEL;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {showBillingHistory ? (
        <Button type="button" variant="outline" size="sm" asChild>
          <Link href={historyHref}>View billing history</Link>
        </Button>
      ) : null}

      {trialDetailsTrigger ? (
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
