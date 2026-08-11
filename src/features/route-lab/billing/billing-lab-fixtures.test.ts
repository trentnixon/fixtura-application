import { describe, expect, it } from "vitest";

import { deriveOrganisationTrialPresentation } from "@/app/(members)/o/[accountId]/billing/_utils/trial/deriveOrganisationTrialPresentation";

import { billingLabSummaryForScenario } from "./billing-lab-fixtures";
import { BILLING_LAB_SCENARIO_OPTIONS } from "./lab-billing-types";
import { labSummaryToAccountBillingSummary } from "./labSummaryToAccountBillingSummary";

import type { OrganisationTrialPresentation } from "@/app/(members)/o/[accountId]/billing/_types/trial/organisationTrialPresentation";

const ORG_SCENARIO_EXPECTATIONS: Array<{
  scenario: string;
  presentation: OrganisationTrialPresentation;
  failClosed?: boolean;
}> = [
  { scenario: "org_start_available", presentation: "start_available" },
  { scenario: "org_active_here", presentation: "active_on_this_account" },
  { scenario: "org_active_elsewhere", presentation: "active_on_another_account" },
  { scenario: "org_used", presentation: "used" },
  { scenario: "org_blocked", presentation: "blocked_by_billing" },
  { scenario: "org_unavailable", presentation: "unavailable", failClosed: true },
  { scenario: "trial_available", presentation: "start_available" },
  { scenario: "trial_active", presentation: "active_on_this_account" },
  { scenario: "trial_ended", presentation: "used" },
];

const PRIVACY_FORBIDDEN = [/@/, /account\s*#\s*\d+/i, /user@/i, /other account id/i];

describe("billingLabSummaryForScenario org-trial matrix", () => {
  it.each(ORG_SCENARIO_EXPECTATIONS)(
    "$scenario derives presentation $presentation",
    ({ scenario, presentation, failClosed }) => {
      const lab = billingLabSummaryForScenario("575", scenario);
      const result = deriveOrganisationTrialPresentation(labSummaryToAccountBillingSummary(lab));

      expect(result.presentation).toBe(presentation);
      if (failClosed) {
        expect(result.failClosed).toBe(true);
      } else {
        expect(result.failClosed).toBe(false);
      }
    },
  );

  it.each(BILLING_LAB_SCENARIO_OPTIONS.filter((s) => s !== "default"))(
    "mirrors canStartTrial on organisationTrial for %s",
    (scenario) => {
      const lab = billingLabSummaryForScenario("575", scenario);
      expect(lab.availableActions.canStartTrial).toBe(lab.organisationTrial.canStartTrial);
    },
  );

  it.each(BILLING_LAB_SCENARIO_OPTIONS.filter((s) => s !== "default"))(
    "organisationTrial block has no cross-account identity leaks for %s",
    (scenario) => {
      const orgBlock = JSON.stringify(
        billingLabSummaryForScenario("575", scenario).organisationTrial,
      );
      for (const pattern of PRIVACY_FORBIDDEN) {
        expect(orgBlock).not.toMatch(pattern);
      }
    },
  );
});
