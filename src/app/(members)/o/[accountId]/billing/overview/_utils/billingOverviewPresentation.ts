import { showCreateSubscriptionCta } from "./showCreateSubscriptionCta";
import {
  deriveBillingProductState,
  type BillingProductState,
  type BillingUiMode,
} from "../../_core/billing-state";
import {
  resolveOrganisationTrialNoticePresentation,
  shouldSuppressOrganisationTrialNotices,
} from "../../_utils/trial/billingOrganisationTrialOverview";

import type { OrganisationTrialPresentation } from "../../_types/trial/organisationTrialPresentation";

function isAccessUncertainUiMode(billingUiMode: BillingUiMode): boolean {
  return billingUiMode === "access_denied" || billingUiMode === "unknown";
}

/** Subscription funnel is available — org notice or create CTA already guides the user. */
export function hasBillingOverviewSubscriptionPath(
  billingUiMode: BillingUiMode,
  organisationTrialPresentation: OrganisationTrialPresentation,
  availableActions: Partial<Record<string, boolean>> | undefined,
): boolean {
  if (
    !shouldSuppressOrganisationTrialNotices(billingUiMode) &&
    resolveOrganisationTrialNoticePresentation(organisationTrialPresentation) !== null
  ) {
    return true;
  }

  return showCreateSubscriptionCta(billingUiMode, availableActions);
}

export function resolveEffectiveBillingProductState(
  billingUiMode: BillingUiMode,
  organisationTrialPresentation: OrganisationTrialPresentation,
  availableActions: Partial<Record<string, boolean>> | undefined,
): BillingProductState {
  if (
    isAccessUncertainUiMode(billingUiMode) &&
    hasBillingOverviewSubscriptionPath(
      billingUiMode,
      organisationTrialPresentation,
      availableActions,
    )
  ) {
    return "create_subscription";
  }

  return deriveBillingProductState(billingUiMode);
}

export function shouldShowBillingAccessUncertainCard(
  billingUiMode: BillingUiMode,
  organisationTrialPresentation: OrganisationTrialPresentation,
  availableActions: Partial<Record<string, boolean>> | undefined,
): boolean {
  if (!isAccessUncertainUiMode(billingUiMode)) {
    return false;
  }

  return !hasBillingOverviewSubscriptionPath(
    billingUiMode,
    organisationTrialPresentation,
    availableActions,
  );
}

export function shouldShowCreateSeasonPassSection(
  billingUiMode: BillingUiMode,
  organisationTrialPresentation: OrganisationTrialPresentation,
  availableActions: Partial<Record<string, boolean>> | undefined,
): boolean {
  if (billingUiMode === "trial_expired" || billingUiMode === "no_billing") {
    return true;
  }

  return (
    isAccessUncertainUiMode(billingUiMode) &&
    showCreateSubscriptionCta(billingUiMode, availableActions)
  );
}
