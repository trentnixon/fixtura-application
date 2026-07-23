import { canStartTrial } from "../../_core/_utils/billing-state-helpers";

import type { OrganisationTrialPresentationResult } from "../../_types/trial/organisationTrialPresentation";
import type { AccountBillingSummaryV1 } from "@/types/api/account";

function failClosed(reason: string): OrganisationTrialPresentationResult {
  return { presentation: "unavailable", failClosed: true, reason };
}

/**
 * Pure org-trial presentation from GET billing `organisationTrial` + action flags.
 * Fail-closed on missing, omitted, contradictory, or inconsistent CMS signals.
 * Orthogonal to `deriveBillingUiMode` — UI wiring is APP-TRIAL-003+.
 */
export function deriveOrganisationTrialPresentation(
  summary: AccountBillingSummaryV1,
): OrganisationTrialPresentationResult {
  const block = summary.organisationTrial;
  if (block == null) {
    return failClosed("organisationTrial block missing");
  }

  const { consumptionStatus, allocationStatus, canStartTrial: orgCanStartTrial } = block;
  const actionsCanStartTrial = canStartTrial(summary.availableActions);

  if (consumptionStatus === undefined || allocationStatus === undefined) {
    return failClosed("consumptionStatus or allocationStatus omitted (ambiguous org)");
  }

  if (orgCanStartTrial !== actionsCanStartTrial) {
    return failClosed("organisationTrial.canStartTrial !== availableActions.canStartTrial");
  }

  if (orgCanStartTrial && consumptionStatus === "used") {
    return failClosed("canStartTrial true with consumptionStatus used");
  }

  if (consumptionStatus === "available" && allocationStatus !== "none") {
    return failClosed("consumptionStatus available with non-none allocationStatus");
  }

  if (orgCanStartTrial) {
    if (summary.billingStatus !== "trial_available") {
      return failClosed("canStartTrial true but billingStatus is not trial_available");
    }
    if (summary.trial?.isEligible !== true) {
      return failClosed("canStartTrial true but trial.isEligible is not true");
    }
  }

  if (allocationStatus === "active_on_this_account") {
    if (consumptionStatus !== "used") {
      return failClosed("active_on_this_account requires consumptionStatus used");
    }
    return { presentation: "active_on_this_account", failClosed: false };
  }

  if (allocationStatus === "active_on_another_account") {
    if (consumptionStatus !== "used") {
      return failClosed("active_on_another_account requires consumptionStatus used");
    }
    return { presentation: "active_on_another_account", failClosed: false };
  }

  if (consumptionStatus === "used" && allocationStatus === "ended") {
    return { presentation: "used", failClosed: false };
  }

  if (consumptionStatus === "available" && allocationStatus === "none") {
    if (orgCanStartTrial) {
      return { presentation: "start_available", failClosed: false };
    }
    return { presentation: "blocked_by_billing", failClosed: false };
  }

  return failClosed("unmapped organisationTrial combination");
}
