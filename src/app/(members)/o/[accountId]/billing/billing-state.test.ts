import { describe, expect, it } from "vitest";

import { shouldShowInvoiceRequest } from "./billing-invoice-request";
import { shouldShowPlanCheckout } from "./billing-plan-checkout";
import {
  canStartTrial,
  deriveBillingProductState,
  deriveBillingUiMode,
  getBillingDebugSnapshot,
  isActiveTrial,
  trialDaysRemaining,
  type BillingUiMode,
  type BillingProductState,
} from "./billing-state";

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

describe("deriveBillingUiMode", () => {
  const ref = new Date("2026-05-10T12:00:00.000Z");

  it("returns active_trial when trial.isActive is true", () => {
    expect(
      deriveBillingUiMode(
        baseSummary({
          trial: {
            isActive: true,
            startDate: "2026-05-01",
            endDate: "2026-05-25",
          },
        }),
        { referenceDate: ref },
      ),
    ).toBe("active_trial");
  });

  it("returns active_trial when billingStatus is trialing", () => {
    expect(
      deriveBillingUiMode(
        baseSummary({
          billingStatus: "trialing",
        }),
        { referenceDate: ref },
      ),
    ).toBe("active_trial");
  });

  /** Handoff: during an active trial `billingStatus` may read `active` (synthetic entitlement). */
  it("returns active_trial when billingStatus is active and trial.isActive is true", () => {
    expect(
      deriveBillingUiMode(
        baseSummary({
          billingStatus: "active",
          accessStatus: "active",
          trial: {
            isActive: true,
            startDate: "2026-05-01",
            endDate: "2026-05-20",
          },
        }),
        { referenceDate: ref },
      ),
    ).toBe("active_trial");
  });

  it("returns active_trial via future endDate when isActive is omitted", () => {
    expect(
      deriveBillingUiMode(
        baseSummary({
          billingStatus: "none",
          trial: { endDate: "2026-06-01T00:00:00.000Z" },
        }),
        { referenceDate: ref },
      ),
    ).toBe("active_trial");
  });

  it("does not use endDate fallback when isActive is explicitly false", () => {
    expect(
      isActiveTrial(
        baseSummary({
          trial: {
            isActive: false,
            endDate: "2026-06-01T00:00:00.000Z",
          },
        }),
        { referenceDate: ref },
      ),
    ).toBe(false);

    expect(
      deriveBillingUiMode(
        baseSummary({
          billingStatus: "none",
          trial: {
            isActive: false,
            endDate: "2026-06-01T00:00:00.000Z",
          },
        }),
        { referenceDate: ref },
      ),
    ).toBe("trial_expired");
  });

  it("returns paid_active before active_trial when order is active with clean status", () => {
    expect(
      deriveBillingUiMode(
        baseSummary({
          billingStatus: "trialing",
          activeOrder: {
            id: 1,
            Name: "Sub",
            total: 100,
            currency: "AUD",
            OrderPaid: true,
            payment_status: "paid",
            checkout_status: null,
            payment_channel: null,
            startOrderAt: null,
            endOrderAt: null,
            isActive: true,
            isPaused: false,
            cancel_at_period_end: false,
            stripe_subscription_id: null,
            stripe_status: "active",
            hosted_invoice_url: null,
            invoice_pdf: null,
            invoice_number: null,
            invoice_due_date: null,
            createdAt: "2026-01-01",
            updatedAt: "2026-01-01",
            subscriptionTier: null,
          },
        }),
        { referenceDate: ref },
      ),
    ).toBe("paid_active");
  });

  it("returns payment_pending when latest invoice request is submitted", () => {
    expect(
      deriveBillingUiMode(
        baseSummary({
          latestInvoiceRequest: {
            status: "submitted",
            submittedAt: "2026-05-05",
          },
          trial: {
            isActive: true,
          },
        }),
        { referenceDate: ref },
      ),
    ).toBe("payment_pending");
  });

  it("returns access_denied when accessStatus is denied", () => {
    expect(
      deriveBillingUiMode(baseSummary({ accessStatus: "denied" }), { referenceDate: ref }),
    ).toBe("access_denied");
  });

  it("returns trial_expired when trial exists and is inactive", () => {
    expect(
      deriveBillingUiMode(
        baseSummary({
          trial: { isActive: false, startDate: "2026-04-01", endDate: "2026-05-01" },
        }),
        { referenceDate: ref },
      ),
    ).toBe("trial_expired");
  });

  it("returns no_billing when portfolio is empty and access is not denied-like", () => {
    expect(
      deriveBillingUiMode(baseSummary({ accessStatus: "inactive", billingStatus: "inactive" }), {
        referenceDate: ref,
      }),
    ).toBe("no_billing");
  });

  it("returns paid_active from currentPlan with active billing when no order", () => {
    expect(
      deriveBillingUiMode(
        baseSummary({
          billingStatus: "active",
          currentPlan: {
            id: 1,
            Name: "Club",
            Title: null,
            currency: "AUD",
            price: 100,
          },
        }),
        { referenceDate: ref },
      ),
    ).toBe("paid_active");
  });

  it("returns free_trial_available when billing is trial_available and canStartTrial is true", () => {
    expect(
      deriveBillingUiMode(
        baseSummary({
          billingStatus: "trial_available",
          accessStatus: "pending",
          trial: {
            eligible: true,
            isActive: false,
          },
          availableActions: {
            canStartTrial: true,
          },
        }),
        { referenceDate: ref },
      ),
    ).toBe("free_trial_available");
  });

  it("returns snake_case free start flag for free_trial_available", () => {
    expect(
      deriveBillingUiMode(
        baseSummary({
          billingStatus: "trial_available",
          availableActions: { can_start_trial: true },
        }),
        { referenceDate: ref },
      ),
    ).toBe("free_trial_available");
  });

  it("returns unknown when trial_available but CMS does not allow start explicitly", () => {
    expect(
      deriveBillingUiMode(
        baseSummary({
          billingStatus: "trial_available",
          accessStatus: "pending",
          availableActions: {},
        }),
        { referenceDate: ref },
      ),
    ).toBe("unknown");
  });

  const incompleteCheckoutOrder = {
    id: 99,
    Name: "Pending",
    total: null,
    currency: "AUD",
    OrderPaid: null,
    payment_status: null,
    checkout_status: "inComplete",
    payment_channel: null,
    startOrderAt: null,
    endOrderAt: null,
    isActive: false,
    isPaused: false,
    cancel_at_period_end: null,
    stripe_subscription_id: null,
    stripe_status: null,
    hosted_invoice_url: null,
    invoice_pdf: null,
    invoice_number: null,
    invoice_due_date: null,
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
    subscriptionTier: null,
  } as const satisfies NonNullable<AccountBillingSummaryV1["activeOrder"]>;

  it("returns payment_pending when incomplete checkout beats trial_available grouping", () => {
    expect(
      deriveBillingUiMode(
        baseSummary({
          billingStatus: "trial_available",
          availableActions: { canStartTrial: true },
          activeOrder: { ...incompleteCheckoutOrder },
        }),
        { referenceDate: ref },
      ),
    ).toBe("payment_pending");
  });

  it("returns payment_pending when pending invoice beats trial_available", () => {
    expect(
      deriveBillingUiMode(
        baseSummary({
          billingStatus: "trial_available",
          latestInvoiceRequest: { status: "under_review", submittedAt: "2026-05-05" },
          availableActions: { canStartTrial: true },
        }),
        { referenceDate: ref },
      ),
    ).toBe("payment_pending");
  });

  it("returns paid_active when paid order clears stale trial.isActive signal", () => {
    expect(
      deriveBillingUiMode(
        baseSummary({
          trial: { isActive: true },
          activeOrder: {
            id: 1,
            Name: "Sub",
            total: 100,
            currency: "AUD",
            OrderPaid: true,
            payment_status: "paid",
            checkout_status: null,
            payment_channel: null,
            startOrderAt: null,
            endOrderAt: null,
            isActive: true,
            isPaused: false,
            cancel_at_period_end: false,
            stripe_subscription_id: null,
            stripe_status: "active",
            hosted_invoice_url: null,
            invoice_pdf: null,
            invoice_number: null,
            invoice_due_date: null,
            createdAt: "2026-01-01",
            updatedAt: "2026-01-01",
            subscriptionTier: null,
          },
        }),
        { referenceDate: ref },
      ),
    ).toBe("paid_active");
  });

  it("returns paid_active despite cancel_at_period_end marker while subscription is paid", () => {
    expect(
      deriveBillingUiMode(
        baseSummary({
          activeOrder: {
            id: 1,
            Name: "Sub",
            total: 100,
            currency: "AUD",
            OrderPaid: true,
            payment_status: "paid",
            checkout_status: null,
            payment_channel: null,
            startOrderAt: null,
            endOrderAt: "2026-07-01",
            isActive: true,
            isPaused: false,
            cancel_at_period_end: true,
            stripe_subscription_id: null,
            stripe_status: "active",
            hosted_invoice_url: null,
            invoice_pdf: null,
            invoice_number: null,
            invoice_due_date: null,
            createdAt: "2026-01-01",
            updatedAt: "2026-01-01",
            subscriptionTier: null,
          },
        }),
        { referenceDate: ref },
      ),
    ).toBe("paid_active");
  });

  it("maps inactive checkout_status lowercase incomplete to payment_pending", () => {
    expect(
      deriveBillingUiMode(
        baseSummary({
          activeOrder: {
            ...incompleteCheckoutOrder,
            checkout_status: "incomplete",
          },
        }),
        { referenceDate: ref },
      ),
    ).toBe("payment_pending");
  });
});

describe("getBillingDebugSnapshot", () => {
  const ref = new Date("2026-05-10T12:00:00.000Z");

  it("matches deriveBillingUiMode and surfaces free-trial derivation flags", () => {
    const s = baseSummary({
      billingStatus: "trial_available",
      availableActions: { canStartTrial: true },
    });
    const snap = getBillingDebugSnapshot(s, { referenceDate: ref });
    expect(snap.billingUiMode).toBe(deriveBillingUiMode(s, { referenceDate: ref }));
    expect(snap.billingProductState).toBe("activate_trial");
    expect(snap.helpers.canStartTrial).toBe(true);
    expect(snap.derivationFlags.qualifiesFreeTrialAvailable).toBe(true);
  });
});

describe("deriveBillingProductState", () => {
  const cases: [BillingUiMode, BillingProductState][] = [
    ["free_trial_available", "activate_trial"],
    ["active_trial", "active_account"],
    ["paid_active", "active_account"],
    ["payment_pending", "pending"],
    ["trial_expired", "create_subscription"],
    ["no_billing", "create_subscription"],
    ["access_denied", "access_uncertain"],
    ["unknown", "access_uncertain"],
  ];

  it.each(cases)("maps BillingUiMode %s to product state %s", (mode, product) => {
    expect(deriveBillingProductState(mode)).toBe(product);
  });
});

describe("canStartTrial", () => {
  it("is false without explicit flags", () => {
    expect(canStartTrial(undefined)).toBe(false);
    expect(canStartTrial({})).toBe(false);
    expect(canStartTrial({ canCheckout: true })).toBe(false);
  });

  it("is true only for canStartTrial or can_start_trial", () => {
    expect(canStartTrial({ canStartTrial: true })).toBe(true);
    expect(canStartTrial({ can_start_trial: true })).toBe(true);
  });
});

describe("trialDaysRemaining", () => {
  it("returns ceil of days until end", () => {
    expect(
      trialDaysRemaining("2026-05-12T00:00:00.000Z", {
        referenceDate: new Date("2026-05-10T12:00:00.000Z"),
      }),
    ).toBe(2);
  });

  it("returns 0 after end", () => {
    expect(
      trialDaysRemaining("2026-05-01T00:00:00.000Z", {
        referenceDate: new Date("2026-05-10T12:00:00.000Z"),
      }),
    ).toBe(0);
  });
});

describe("checkout and invoice action gates", () => {
  it("shouldShowPlanCheckout accepts snake_case subscribe and checkout", () => {
    expect(shouldShowPlanCheckout({ can_checkout: true })).toBe(true);
    expect(shouldShowPlanCheckout({ can_subscribe: true })).toBe(true);
  });

  it("shouldShowInvoiceRequest accepts snake_case", () => {
    expect(shouldShowInvoiceRequest({ can_request_invoice: true })).toBe(true);
  });
});
