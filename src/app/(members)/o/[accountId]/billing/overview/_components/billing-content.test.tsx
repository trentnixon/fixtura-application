import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { BillingContent } from "./BillingContent";

import type { BillingOverviewState } from "../_hooks/useBillingOverviewContentState";
import type { AccountBillingSummaryV1 } from "@/types/api/account";

const useBillingOverviewContentState = vi.hoisted(() => vi.fn());

vi.mock("../_hooks/useBillingOverviewContentState", () => ({
  useBillingOverviewContentState,
}));

vi.mock("../../trial/billing-trial-start-card", () => ({
  BillingTrialStartCard: ({ accountId }: { accountId: string }) => (
    <div data-testid="billing-trial-start-card">trial-{accountId}</div>
  ),
}));

vi.mock("../../_components/overview/BillingSections", () => ({
  BillingSections: () => <div data-testid="billing-sections" />,
}));

vi.mock("../../_components/billing-product-state-badge", () => ({
  BillingProductStateBadge: () => <div data-testid="billing-product-state-badge" />,
}));

vi.mock("./BillingOverviewActions", () => ({
  BillingOverviewActions: () => <div data-testid="billing-overview-actions" />,
}));

function mockHook(state: BillingOverviewState, refetchBilling: ReturnType<typeof vi.fn> = vi.fn()) {
  useBillingOverviewContentState.mockReturnValue({ state, refetchBilling });
  return refetchBilling;
}

const minimalSummary = {
  billingStatus: "trial_available",
  accessStatus: "pending",
  trial: { eligible: true, isActive: false },
  availableActions: { canStartTrial: true },
} as AccountBillingSummaryV1;

describe("BillingContent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows redirecting state when account segment is invalid", () => {
    mockHook({
      kind: "invalid-account",
      accountId: "not-a-number",
      checkoutReturnNotice: null,
    });

    render(<BillingContent accountId="not-a-number" />);

    expect(screen.getByRole("status")).toHaveTextContent(/Redirecting/);
  });

  it("shows loading state while billing query is pending", () => {
    mockHook({
      kind: "billing-loading",
      accountId: "42",
      checkoutReturnNotice: null,
    });

    render(<BillingContent accountId="42" />);

    expect(screen.getByText("Loading billing")).toBeInTheDocument();
  });

  it("shows error state with retry on billing load failure", () => {
    const refetchBilling = mockHook({
      kind: "billing-error",
      accountId: "42",
      checkoutReturnNotice: null,
      message: "Billing failed",
    });

    render(<BillingContent accountId="42" />);

    expect(screen.getByText("Could not load billing")).toBeInTheDocument();
    expect(screen.getByText("Billing failed")).toBeInTheDocument();
    screen.getByRole("button", { name: /retry/i }).click();
    expect(refetchBilling).toHaveBeenCalledTimes(1);
  });

  it("shows error state with retry on unexpected empty response", () => {
    const refetchBilling = mockHook({
      kind: "unexpected-empty",
      accountId: "42",
      checkoutReturnNotice: null,
    });

    render(<BillingContent accountId="42" />);

    expect(screen.getByText("Could not load billing")).toBeInTheDocument();
    expect(screen.getByText(/We received an unexpected response/)).toBeInTheDocument();
    screen.getByRole("button", { name: /retry/i }).click();
    expect(refetchBilling).toHaveBeenCalledTimes(1);
  });

  it("renders ready state UI for free trial available mode", () => {
    mockHook({
      kind: "ready",
      accountId: "42",
      segmentOk: true,
      checkoutReturnNotice: null,
      billingSummary: minimalSummary,
      billingUiMode: "free_trial_available",
      ordersPayload: [],
      ordersLoadError: null,
      trialDetailsTrigger: null,
      historyHref: "/o/42/billing/history",
      createHref: "/o/42/billing/create",
      availableActions: { canStartTrial: true },
      refetchOrders: vi.fn(),
    });

    render(<BillingContent accountId="42" />);

    expect(screen.getByRole("region", { name: "Billing status and actions" })).toBeInTheDocument();
    expect(screen.getByTestId("billing-trial-start-card")).toHaveTextContent("trial-42");
    expect(screen.getByTestId("billing-sections")).toBeInTheDocument();
  });

  it("shows checkout return banner when checkout was cancelled", () => {
    mockHook({
      kind: "ready",
      accountId: "42",
      segmentOk: true,
      checkoutReturnNotice: "cancelled",
      billingSummary: minimalSummary,
      billingUiMode: "free_trial_available",
      ordersPayload: [],
      ordersLoadError: null,
      trialDetailsTrigger: null,
      historyHref: "/o/42/billing/history",
      createHref: "/o/42/billing/create",
      availableActions: { canStartTrial: true },
      refetchOrders: vi.fn(),
    });

    render(<BillingContent accountId="42" />);

    expect(screen.getByRole("status")).toHaveTextContent(/Checkout was cancelled/);
  });
});
