import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { BillingContent } from "./BillingContent";

import type { OrganisationTrialPresentation } from "../../_types/trial/organisationTrialPresentation";
import type { BillingOverviewState } from "../_hooks/useBillingOverviewContentState";
import type { AccountBillingSummaryV1 } from "@/types/api/account";

const useBillingOverviewContentState = vi.hoisted(() => vi.fn());
const useBillingSupportReadOnly = vi.hoisted(() => vi.fn(() => false));

vi.mock("../_hooks/useBillingOverviewContentState", () => ({
  useBillingOverviewContentState,
}));

vi.mock("../../_hooks/useBillingSupportReadOnly", () => ({
  useBillingSupportReadOnly,
}));

vi.mock("../../_components/support/BillingSupportDiagnosticsPanel", () => ({
  BillingSupportDiagnosticsPanel: () => <div data-testid="billing-support-diagnostics" />,
}));

vi.mock("../../trial/billing-trial-start-card", () => ({
  BillingTrialStartCard: ({ accountId }: { accountId: string }) => (
    <div data-testid="billing-trial-start-card">trial-{accountId}</div>
  ),
}));

vi.mock("../../trial/billing-trial-used-card", () => ({
  BillingTrialUsedCard: () => <div data-testid="billing-trial-used-card" />,
}));

vi.mock("../../season-pass/billing-create-season-pass-card", () => ({
  BillingCreateSeasonPassCard: () => <div data-testid="billing-create-season-pass-card" />,
}));

vi.mock("../../_components/banners/BillingPaymentPendingBanner", () => ({
  BillingPaymentPendingBanner: () => <div data-testid="billing-payment-pending-banner" />,
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

const minimalSummary: AccountBillingSummaryV1 = {
  billingStatus: "trial_available",
  accessStatus: "pending",
  currentPlan: null,
  trial: { isEligible: true, isActive: false },
  organisationTrial: {
    consumptionStatus: "available",
    allocationStatus: "none",
    canStartTrial: true,
  },
  activeOrder: null,
  latestInvoiceRequest: null,
  availableActions: { canStartTrial: true },
};

type ReadyStateOverrides = Partial<Extract<BillingOverviewState, { kind: "ready" }>>;

function readyState(
  overrides: ReadyStateOverrides = {},
): Extract<BillingOverviewState, { kind: "ready" }> {
  return {
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
    organisationTrialPresentation: "start_available",
    refetchOrders: vi.fn(),
    ...overrides,
  };
}

describe("BillingContent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useBillingSupportReadOnly.mockReturnValue(false);
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
    mockHook(readyState());

    render(<BillingContent accountId="42" />);

    expect(screen.getByRole("region", { name: "Billing status and actions" })).toBeInTheDocument();
    expect(screen.getByTestId("billing-trial-start-card")).toHaveTextContent("trial-42");
    expect(screen.getByTestId("billing-sections")).toBeInTheDocument();
  });

  it("shows start card for start_available presentation with free_trial_available mode", () => {
    mockHook(
      readyState({
        billingUiMode: "free_trial_available",
        organisationTrialPresentation: "start_available",
      }),
    );

    render(<BillingContent accountId="42" />);

    expect(screen.getByTestId("billing-trial-start-card")).toBeInTheDocument();
  });

  it("hides start card and org notice for active_on_this_account", () => {
    mockHook(
      readyState({
        billingUiMode: "active_trial",
        organisationTrialPresentation: "active_on_this_account",
      }),
    );

    render(<BillingContent accountId="42" />);

    expect(screen.queryByTestId("billing-trial-start-card")).not.toBeInTheDocument();
    expect(screen.queryByTestId(/billing-org-trial-notice-/)).not.toBeInTheDocument();
  });

  it("shows checkout return banner when checkout was cancelled", () => {
    mockHook(
      readyState({
        checkoutReturnNotice: "cancelled",
      }),
    );

    render(<BillingContent accountId="42" />);

    expect(screen.getByRole("status")).toHaveTextContent(/Checkout was cancelled/);
  });

  it.each<[OrganisationTrialPresentation]>([
    ["unavailable"],
    ["used"],
    ["active_on_another_account"],
    ["blocked_by_billing"],
  ])("hides start card when presentation is %s", (organisationTrialPresentation) => {
    mockHook(
      readyState({
        billingUiMode: "free_trial_available",
        organisationTrialPresentation,
      }),
    );

    render(<BillingContent accountId="42" />);

    expect(screen.queryByTestId("billing-trial-start-card")).not.toBeInTheDocument();
  });

  it.each<[OrganisationTrialPresentation, string]>([
    ["unavailable", "Organisation trial eligibility unavailable"],
  ])("shows prominent org notice for %s", (organisationTrialPresentation, title) => {
    mockHook(
      readyState({
        billingUiMode: "no_billing",
        organisationTrialPresentation,
      }),
    );

    render(<BillingContent accountId="42" />);

    expect(
      screen.getByTestId(`billing-org-trial-notice-${organisationTrialPresentation}`),
    ).toHaveTextContent(title);
  });

  it("does not show prominent org notice for active_on_another_account", () => {
    mockHook(
      readyState({
        billingUiMode: "unknown",
        organisationTrialPresentation: "active_on_another_account",
        availableActions: { canStartCheckout: true, canStartTrial: false },
      }),
    );

    render(<BillingContent accountId="42" />);

    expect(
      screen.queryByTestId("billing-org-trial-notice-active_on_another_account"),
    ).not.toBeInTheDocument();
  });

  it("suppresses org notices under paid_active and payment_pending", () => {
    mockHook(
      readyState({
        billingUiMode: "paid_active",
        organisationTrialPresentation: "used",
      }),
    );

    const { rerender } = render(<BillingContent accountId="42" />);
    expect(screen.queryByTestId("billing-org-trial-notice-used")).not.toBeInTheDocument();

    mockHook(
      readyState({
        billingUiMode: "payment_pending",
        organisationTrialPresentation: "active_on_another_account",
      }),
    );
    rerender(<BillingContent accountId="42" />);
    expect(
      screen.queryByTestId("billing-org-trial-notice-active_on_another_account"),
    ).not.toBeInTheDocument();
  });

  it("does not show org notice for blocked_by_billing", () => {
    mockHook(
      readyState({
        billingUiMode: "no_billing",
        organisationTrialPresentation: "blocked_by_billing",
      }),
    );

    render(<BillingContent accountId="42" />);

    expect(screen.queryByTestId(/billing-org-trial-notice-/)).not.toBeInTheDocument();
  });

  it("does not show org used notice on billing overview", () => {
    mockHook(
      readyState({
        billingUiMode: "no_billing",
        organisationTrialPresentation: "used",
      }),
    );

    render(<BillingContent accountId="42" />);

    expect(screen.queryByTestId("billing-org-trial-notice-used")).not.toBeInTheDocument();
  });

  it("shows account used card on trial_expired when org trial is used", () => {
    mockHook(
      readyState({
        billingUiMode: "trial_expired",
        organisationTrialPresentation: "used",
        trialDetailsTrigger: { emphasize: false },
      }),
    );

    render(<BillingContent accountId="42" />);

    expect(screen.queryByTestId("billing-org-trial-notice-used")).not.toBeInTheDocument();
    expect(screen.getByTestId("billing-trial-used-card")).toBeInTheDocument();
  });

  it("shows customer billing cards and diagnostics in support view", () => {
    useBillingSupportReadOnly.mockReturnValue(true);
    mockHook(
      readyState({
        billingUiMode: "trial_expired",
        organisationTrialPresentation: "used",
        trialDetailsTrigger: { emphasize: false },
      }),
    );

    render(<BillingContent accountId="42" />);

    expect(screen.getByTestId("billing-create-season-pass-card")).toBeInTheDocument();
    expect(screen.getByTestId("billing-trial-used-card")).toBeInTheDocument();
    expect(screen.getByTestId("billing-support-diagnostics")).toBeInTheDocument();
  });

  it("hides access uncertain card and shows season pass when org trial is active elsewhere", () => {
    mockHook(
      readyState({
        billingUiMode: "unknown",
        organisationTrialPresentation: "active_on_another_account",
        availableActions: { canStartCheckout: true, canStartTrial: false },
      }),
    );

    render(<BillingContent accountId="42" />);

    expect(
      screen.queryByTestId("billing-org-trial-notice-active_on_another_account"),
    ).not.toBeInTheDocument();
    expect(screen.getByTestId("billing-create-season-pass-card")).toBeInTheDocument();
    expect(screen.queryByText(/Need help with billing/i)).not.toBeInTheDocument();
    expect(
      screen.queryByText(/could not place this account in a standard billing state/i),
    ).not.toBeInTheDocument();
  });
});
