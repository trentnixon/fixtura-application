import type { BillingOrganisationTrialNoticePresentation } from "../../_components/trial/BillingOrganisationTrialNotice";
import type { BillingUiMode } from "../../_core/billing-state";
import type { OrganisationTrialPresentation } from "../../_types/trial/organisationTrialPresentation";

export function shouldSuppressOrganisationTrialNotices(billingUiMode: BillingUiMode): boolean {
  return billingUiMode === "paid_active" || billingUiMode === "payment_pending";
}

export function shouldShowBillingTrialStartCard(
  billingUiMode: BillingUiMode,
  organisationTrialPresentation: OrganisationTrialPresentation,
): boolean {
  return (
    billingUiMode === "free_trial_available" && organisationTrialPresentation === "start_available"
  );
}

export function resolveOrganisationTrialNoticePresentation(
  organisationTrialPresentation: OrganisationTrialPresentation,
): BillingOrganisationTrialNoticePresentation | null {
  if (
    organisationTrialPresentation === "active_on_another_account" ||
    organisationTrialPresentation === "used" ||
    organisationTrialPresentation === "unavailable"
  ) {
    return organisationTrialPresentation;
  }

  return null;
}

/** Page banner notices — active-elsewhere copy lives in Trial information dialog instead. */
export function resolveProminentOrganisationTrialNoticePresentation(
  organisationTrialPresentation: OrganisationTrialPresentation,
): BillingOrganisationTrialNoticePresentation | null {
  const notice = resolveOrganisationTrialNoticePresentation(organisationTrialPresentation);
  if (notice === "active_on_another_account") {
    return null;
  }
  return notice;
}

export function shouldShowOrganisationTrialNoticeInDialog(
  organisationTrialPresentation: OrganisationTrialPresentation,
): organisationTrialPresentation is "active_on_another_account" {
  return organisationTrialPresentation === "active_on_another_account";
}

export function shouldShowProminentOrganisationTrialNotice(
  billingUiMode: BillingUiMode,
  organisationTrialPresentation: OrganisationTrialPresentation,
): boolean {
  if (shouldSuppressOrganisationTrialNotices(billingUiMode)) {
    return false;
  }

  return (
    resolveProminentOrganisationTrialNoticePresentation(organisationTrialPresentation) !== null
  );
}

export function shouldShowOrganisationTrialNotice(
  billingUiMode: BillingUiMode,
  organisationTrialPresentation: OrganisationTrialPresentation,
): boolean {
  return shouldShowProminentOrganisationTrialNotice(billingUiMode, organisationTrialPresentation);
}

export function shouldShowBillingTrialUsedCardForUiMode(
  billingUiMode: BillingUiMode,
  organisationTrialPresentation: OrganisationTrialPresentation,
  hasTrialDetailsTrigger: boolean,
): boolean {
  if (!hasTrialDetailsTrigger) {
    return false;
  }

  if (billingUiMode === "payment_pending") {
    return true;
  }

  if (billingUiMode === "trial_expired") {
    return organisationTrialPresentation !== "used";
  }

  return false;
}
