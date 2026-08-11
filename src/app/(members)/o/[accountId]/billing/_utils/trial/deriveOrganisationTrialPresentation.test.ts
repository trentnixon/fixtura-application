import { describe, expect, it } from "vitest";

import { deriveOrganisationTrialPresentation } from "./deriveOrganisationTrialPresentation";

import type { AccountBillingSummaryV1 } from "@/types/api/account";

function baseSummary(over: Partial<AccountBillingSummaryV1> = {}): AccountBillingSummaryV1 {
  return {
    billingStatus: "none",
    accessStatus: "none",
    currentPlan: null,
    trial: null,
    activeOrder: null,
    latestInvoiceRequest: null,
    availableActions: {},
    ...over,
  };
}

function orgBlock(
  over: Partial<NonNullable<AccountBillingSummaryV1["organisationTrial"]>>,
): NonNullable<AccountBillingSummaryV1["organisationTrial"]> {
  return {
    canStartTrial: false,
    ...over,
  };
}

describe("deriveOrganisationTrialPresentation", () => {
  it("returns start_available for a fully consistent eligible snapshot", () => {
    expect(
      deriveOrganisationTrialPresentation(
        baseSummary({
          billingStatus: "trial_available",
          accessStatus: "pending",
          trial: { isEligible: true, isActive: false },
          organisationTrial: orgBlock({
            consumptionStatus: "available",
            allocationStatus: "none",
            canStartTrial: true,
          }),
          availableActions: { canStartTrial: true },
        }),
      ),
    ).toEqual({ presentation: "start_available", failClosed: false });
  });

  it("returns blocked_by_billing when org is available but action is false", () => {
    expect(
      deriveOrganisationTrialPresentation(
        baseSummary({
          organisationTrial: orgBlock({
            consumptionStatus: "available",
            allocationStatus: "none",
            canStartTrial: false,
          }),
          availableActions: { canStartTrial: false },
        }),
      ),
    ).toEqual({ presentation: "blocked_by_billing", failClosed: false });
  });

  it("returns active_on_this_account for used + active_on_this_account", () => {
    expect(
      deriveOrganisationTrialPresentation(
        baseSummary({
          organisationTrial: orgBlock({
            consumptionStatus: "used",
            allocationStatus: "active_on_this_account",
            canStartTrial: false,
          }),
          availableActions: { canStartTrial: false },
        }),
      ),
    ).toEqual({ presentation: "active_on_this_account", failClosed: false });
  });

  it("returns active_on_another_account for used + active_on_another_account", () => {
    expect(
      deriveOrganisationTrialPresentation(
        baseSummary({
          organisationTrial: orgBlock({
            consumptionStatus: "used",
            allocationStatus: "active_on_another_account",
            canStartTrial: false,
          }),
          availableActions: { canStartTrial: false },
        }),
      ),
    ).toEqual({ presentation: "active_on_another_account", failClosed: false });
  });

  it("returns used for used + ended", () => {
    expect(
      deriveOrganisationTrialPresentation(
        baseSummary({
          organisationTrial: orgBlock({
            consumptionStatus: "used",
            allocationStatus: "ended",
            canStartTrial: false,
          }),
          availableActions: { canStartTrial: false },
        }),
      ),
    ).toEqual({ presentation: "used", failClosed: false });
  });

  it("fail-closes unavailable when org statuses are omitted", () => {
    const result = deriveOrganisationTrialPresentation(
      baseSummary({
        organisationTrial: { canStartTrial: false },
        availableActions: { canStartTrial: false },
      }),
    );
    expect(result.presentation).toBe("unavailable");
    expect(result.failClosed).toBe(true);
    expect(result.reason).toMatch(/omitted/i);
  });

  it("fail-closes when organisationTrial block is missing", () => {
    const result = deriveOrganisationTrialPresentation(baseSummary());
    expect(result).toEqual({
      presentation: "unavailable",
      failClosed: true,
      reason: "organisationTrial block missing",
    });
  });

  it("fail-closes when org and action canStartTrial flags disagree", () => {
    const result = deriveOrganisationTrialPresentation(
      baseSummary({
        organisationTrial: orgBlock({
          consumptionStatus: "available",
          allocationStatus: "none",
          canStartTrial: true,
        }),
        availableActions: { canStartTrial: false },
      }),
    );
    expect(result.presentation).toBe("unavailable");
    expect(result.failClosed).toBe(true);
    expect(result.reason).toMatch(/canStartTrial/i);
  });

  it("fail-closes for available consumption with active_on_this_account allocation", () => {
    const result = deriveOrganisationTrialPresentation(
      baseSummary({
        organisationTrial: orgBlock({
          consumptionStatus: "available",
          allocationStatus: "active_on_this_account",
          canStartTrial: false,
        }),
        availableActions: { canStartTrial: false },
      }),
    );
    expect(result.presentation).toBe("unavailable");
    expect(result.failClosed).toBe(true);
    expect(result.reason).toMatch(/non-none allocationStatus/i);
  });

  it("fail-closes when canStartTrial true with consumptionStatus used", () => {
    const result = deriveOrganisationTrialPresentation(
      baseSummary({
        billingStatus: "trial_available",
        trial: { isEligible: true, isActive: false },
        organisationTrial: orgBlock({
          consumptionStatus: "used",
          allocationStatus: "none",
          canStartTrial: true,
        }),
        availableActions: { canStartTrial: true },
      }),
    );
    expect(result.presentation).toBe("unavailable");
    expect(result.failClosed).toBe(true);
    expect(result.reason).toMatch(/consumptionStatus used/i);
  });

  it("fail-closes when canStartTrial true but billingStatus is not trial_available", () => {
    const result = deriveOrganisationTrialPresentation(
      baseSummary({
        billingStatus: "active",
        trial: { isEligible: true, isActive: false },
        organisationTrial: orgBlock({
          consumptionStatus: "available",
          allocationStatus: "none",
          canStartTrial: true,
        }),
        availableActions: { canStartTrial: true },
      }),
    );
    expect(result.presentation).toBe("unavailable");
    expect(result.failClosed).toBe(true);
    expect(result.reason).toMatch(/billingStatus/i);
  });

  it("fail-closes when canStartTrial true but trial.isEligible is false", () => {
    const result = deriveOrganisationTrialPresentation(
      baseSummary({
        billingStatus: "trial_available",
        trial: { isEligible: false, isActive: false },
        organisationTrial: orgBlock({
          consumptionStatus: "available",
          allocationStatus: "none",
          canStartTrial: true,
        }),
        availableActions: { canStartTrial: true },
      }),
    );
    expect(result.presentation).toBe("unavailable");
    expect(result.failClosed).toBe(true);
    expect(result.reason).toMatch(/isEligible/i);
  });

  it("fail-closes when availableActions is empty but org canStartTrial is true", () => {
    const result = deriveOrganisationTrialPresentation(
      baseSummary({
        billingStatus: "trial_available",
        trial: { isEligible: true, isActive: false },
        organisationTrial: orgBlock({
          consumptionStatus: "available",
          allocationStatus: "none",
          canStartTrial: true,
        }),
        availableActions: {},
      }),
    );
    expect(result.presentation).toBe("unavailable");
    expect(result.failClosed).toBe(true);
    expect(result.reason).toMatch(/canStartTrial/i);
  });

  it("fail-closes for used consumption with none allocation", () => {
    const result = deriveOrganisationTrialPresentation(
      baseSummary({
        organisationTrial: orgBlock({
          consumptionStatus: "used",
          allocationStatus: "none",
          canStartTrial: false,
        }),
        availableActions: { canStartTrial: false },
      }),
    );
    expect(result.presentation).toBe("unavailable");
    expect(result.failClosed).toBe(true);
    expect(result.reason).toMatch(/unmapped/i);
  });
});
