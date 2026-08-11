import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { BillingTrialStartCard } from "./BillingTrialStartCard";

const useBillingTrialStart = vi.hoisted(() => vi.fn());

vi.mock("../../_hooks/useBillingTrialStart", () => ({
  useBillingTrialStart,
}));

function mockTrialStartHook(visible: boolean) {
  useBillingTrialStart.mockReturnValue({
    visible,
    mutation: { isPending: false },
    feedback: null,
    errorMessage: null,
    confirmOpen: false,
    accountName: "Westside Cricket Club",
    handleConfirmDialogOpenChange: vi.fn(),
    openConfirmDialog: vi.fn(),
    confirmStartTrial: vi.fn(),
  });
}

describe("BillingTrialStartCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders Start button with accessible name when visible", () => {
    mockTrialStartHook(true);

    render(
      <BillingTrialStartCard
        accountId="42"
        enabled
        availableActions={{ canStartTrial: true }}
        organisationTrialPresentation="start_available"
      />,
    );

    expect(screen.getByRole("button", { name: /Start free trial/i })).toBeInTheDocument();
  });

  it("is hidden unless hook reports visible (start_available gating)", () => {
    mockTrialStartHook(false);

    render(
      <BillingTrialStartCard
        accountId="42"
        enabled
        availableActions={{ canStartTrial: true }}
        organisationTrialPresentation="unavailable"
      />,
    );

    expect(screen.queryByRole("button", { name: /Start free trial/i })).not.toBeInTheDocument();
  });
});
