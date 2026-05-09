import { describe, expect, it } from "vitest";

import { buildLabelledAvailableActions } from "./buildLabelledAvailableActions";
import {
  canStartTrial,
  deriveBillingProductState,
  deriveBillingUiMode,
  getBillingDebugSnapshot,
  isActiveTrial,
  billingPeriodDaysRemaining,
  billingPeriodElapsedProgressPercent,
  trialDaysRemaining,
  trialElapsedProgressPercent,
  type BillingUiMode,
  type BillingProductState,
} from "../../_core/billing-state";
import { shouldShowPlanCheckout } from "../../plan-checkout/_utils/billingPlanCheckout";
import { buildBillingDebugFunnelGates } from "../debug/billingDebugPanel";
import { shouldShowInvoiceRequest } from "../invoice-request/billingInvoiceRequest";

import type { AccountBillingOrderHistoryDto, AccountBillingSummaryV1 } from "@/types/api/account";

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

function minimalHistoryOrder(
  overrides: Partial<AccountBillingOrderHistoryDto> = {},
): AccountBillingOrderHistoryDto {
  return {
    id: 1,
    name: null,
    status: null,
    currency: "AUD",
    total: "100",
    isPaid: false,
    paymentStatus: null,
    checkoutStatus: null,
    paymentChannel: null,
    isActive: false,
    isPaused: false,
    cancelAtPeriodEnd: false,
    stripeStatus: null,
    stripeSubscriptionId: null,
    startAt: null,
    endAt: null,
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
    subscriptionTier: null,
    ...overrides,
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

  it("does not return payment_pending for stale submitted invoice request without order/checkout signals", () => {
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
    ).toBe("active_trial");
  });

  it("returns trial_expired when submitted invoice request is stale and all order rows are complete (no active subscription)", () => {
    const seasonPass = minimalHistoryOrder({
      id: 417,
      isPaid: true,
      paymentStatus: "paid",
      checkoutStatus: "complete",
      isActive: false,
      startAt: "2026-05-26",
      endAt: "2026-05-26",
    });
    const freeTrial = minimalHistoryOrder({
      id: 416,
      name: "Free Trial",
      total: "0",
      isPaid: true,
      paymentStatus: "paid",
      checkoutStatus: "complete",
      isActive: false,
      startAt: "2026-05-07",
      endAt: "2026-05-07",
    });
    expect(
      deriveBillingUiMode(
        baseSummary({
          billingStatus: "invoice_requested",
          accessStatus: "pending",
          trial: {
            isActive: false,
            endDate: "2026-05-21T00:00:00.000Z",
          },
          latestInvoiceRequest: {
            status: "submitted",
            submittedAt: "2026-05-07T02:16:09.653Z",
          },
        }),
        { referenceDate: ref, orders: [seasonPass, freeTrial] },
      ),
    ).toBe("trial_expired");
  });

  it("returns paid_active when GET /orders has isPaid+isActive row despite submitted invoice request (no activeOrder)", () => {
    const paidActivePass = minimalHistoryOrder({
      id: 413,
      name: "ybRcHQsSPB",
      currency: "aud",
      total: "480",
      isPaid: true,
      paymentStatus: "paid",
      checkoutStatus: "active",
      paymentChannel: "invoice",
      isActive: true,
      startAt: "2026-05-25",
      endAt: "2026-08-23",
    });
    const freeTrialRow = minimalHistoryOrder({
      id: 410,
      name: "Free Trial",
      total: "0",
      isPaid: true,
      paymentStatus: "paid",
      checkoutStatus: "complete",
      isActive: false,
    });
    expect(
      deriveBillingUiMode(
        baseSummary({
          billingStatus: "invoice_requested",
          accessStatus: "pending",
          currentPlan: null,
          activeOrder: null,
          trial: {
            eligible: false,
            isActive: false,
            startDate: "2026-05-06T00:00:00.000Z",
            endDate: "2026-05-06T00:00:00.000Z",
          },
          latestInvoiceRequest: {
            id: "4",
            status: "submitted",
            submittedAt: "2026-05-06T06:11:24.305Z",
          },
        }),
        { referenceDate: ref, orders: [paidActivePass, freeTrialRow] },
      ),
    ).toBe("paid_active");
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
            id: "1",
            name: "Club",
            description: "",
            category: "Club",
            price: 100,
            currency: "AUD",
            daysInPass: 30,
            isActive: true,
            includeSponsors: false,
            includedAssetTypes: [],
            orderId: null,
            paymentChannel: null,
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

  it("returns free_trial_available when only invoice request is pending (no order/checkout corroboration)", () => {
    expect(
      deriveBillingUiMode(
        baseSummary({
          billingStatus: "trial_available",
          latestInvoiceRequest: { status: "under_review", submittedAt: "2026-05-05" },
          availableActions: { canStartTrial: true },
        }),
        { referenceDate: ref },
      ),
    ).toBe("free_trial_available");
  });

  it("returns payment_pending when trial_available but order history has open checkout (corroborated pending)", () => {
    expect(
      deriveBillingUiMode(
        baseSummary({
          billingStatus: "trial_available",
          latestInvoiceRequest: { status: "under_review", submittedAt: "2026-05-05" },
          availableActions: { canStartTrial: true },
        }),
        {
          referenceDate: ref,
          orders: [minimalHistoryOrder({ checkoutStatus: "open" })],
        },
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

  it("returns payment_pending when checkout_status is invoice_issued and invoice request is no longer in-flight", () => {
    expect(
      deriveBillingUiMode(
        baseSummary({
          billingStatus: "invoice_requested",
          accessStatus: "pending",
          trial: { isActive: false, endDate: "2026-05-06T00:00:00.000Z" },
          latestInvoiceRequest: {
            status: "invoice_created",
            submittedAt: "2026-05-05",
          },
          activeOrder: {
            ...incompleteCheckoutOrder,
            checkout_status: "invoice_issued",
            stripe_status: null,
            payment_status: null,
          },
        }),
        { referenceDate: ref },
      ),
    ).toBe("payment_pending");
  });

  it("returns payment_pending when GET /orders shows invoice_issued but billing summary has no activeOrder", () => {
    expect(
      deriveBillingUiMode(
        baseSummary({
          billingStatus: "invoice_requested",
          latestInvoiceRequest: {
            status: "invoice_created",
            submittedAt: "2026-05-05",
          },
          activeOrder: null,
        }),
        {
          referenceDate: ref,
          orders: [minimalHistoryOrder({ checkoutStatus: "invoice_issued" })],
        },
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
    expect(snap.derivationFlags.qualifiesForFreeTrialStart).toBe(true);
  });

  it("sets uiModeIsPaymentPending when order history has pending checkout (invoice request alone is insufficient)", () => {
    const s = baseSummary({
      latestInvoiceRequest: { status: "submitted", submittedAt: "2026-05-05" },
      trial: { isActive: true },
    });
    const snap = getBillingDebugSnapshot(s, {
      referenceDate: ref,
      orders: [minimalHistoryOrder({ checkoutStatus: "open" })],
    });
    expect(snap.billingUiMode).toBe("payment_pending");
    expect(snap.derivationFlags.uiModeIsPaymentPending).toBe(true);
  });

  it("sets ordersHaveInvoiceIssuedCheckout when orders include invoice_issued", () => {
    const s = baseSummary({ activeOrder: null });
    const snap = getBillingDebugSnapshot(s, {
      referenceDate: ref,
      orders: [minimalHistoryOrder({ checkoutStatus: "invoice_issued" })],
    });
    expect(snap.summarySlice.ordersHaveInvoiceIssuedCheckout).toBe(true);
  });

  it("sets paidEntitlementFromOrderHistory when any order row is isPaid and isActive", () => {
    const s = baseSummary({ activeOrder: null });
    const snap = getBillingDebugSnapshot(s, {
      referenceDate: ref,
      orders: [minimalHistoryOrder({ isPaid: true, isActive: true, checkoutStatus: "active" })],
    });
    expect(snap.derivationFlags.paidEntitlementFromOrderHistory).toBe(true);
  });

  it("sets paidActiveDespitePendingSignalsInPayload when paid_active wins but another row still shows checkout pending", () => {
    const s = baseSummary({
      latestInvoiceRequest: { status: "submitted", submittedAt: "2026-05-05" },
      activeOrder: null,
    });
    const snap = getBillingDebugSnapshot(s, {
      referenceDate: ref,
      orders: [
        minimalHistoryOrder({
          id: 1,
          isPaid: true,
          isActive: true,
          checkoutStatus: "complete",
          paymentStatus: "paid",
        }),
        minimalHistoryOrder({ id: 2, checkoutStatus: "open", isPaid: false }),
      ],
    });
    expect(snap.billingUiMode).toBe("paid_active");
    expect(snap.derivationFlags.payloadHasPaymentPendingSignals).toBe(true);
    expect(snap.derivationFlags.uiModeIsPaymentPending).toBe(false);
    expect(snap.derivationFlags.paidActiveDespitePendingSignalsInPayload).toBe(true);
    expect(snap.summarySlice.availableActionsTrueShownInOverview).toEqual([]);
  });

  it("summarySlice availableActionsTrueShownInOverview drops invoice flags when paid_active from orders", () => {
    const s = baseSummary({
      latestInvoiceRequest: { status: "submitted", submittedAt: "2026-05-05" },
      activeOrder: null,
      availableActions: { canRequestInvoice: true, canContactSupport: true },
    });
    const snap = getBillingDebugSnapshot(s, {
      referenceDate: ref,
      orders: [minimalHistoryOrder({ isPaid: true, isActive: true })],
    });
    expect(snap.billingUiMode).toBe("paid_active");
    expect(snap.summarySlice.availableActionsTrueFromApi.sort()).toEqual(
      ["canContactSupport", "canRequestInvoice"].sort(),
    );
    expect(snap.summarySlice.availableActionsTrueShownInOverview).toEqual(["canContactSupport"]);
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

describe("trialElapsedProgressPercent", () => {
  const start = "2026-05-06T00:00:00.000Z";
  const end = "2026-05-20T00:00:00.000Z";

  it("is 0% at trial start when days remaining equals total whole days", () => {
    expect(
      trialElapsedProgressPercent(start, end, {
        referenceDate: new Date("2026-05-06T01:00:00.000Z"),
      }),
    ).toBe(0);
  });

  it("matches whole-day elapsed from days remaining", () => {
    expect(
      trialElapsedProgressPercent(start, end, {
        referenceDate: new Date("2026-05-13T12:00:00.000Z"),
      }),
    ).toBeCloseTo((7 / 14) * 100, 5);
  });

  it("is 100% after trial end", () => {
    expect(
      trialElapsedProgressPercent(start, end, {
        referenceDate: new Date("2026-05-21T00:00:00.000Z"),
      }),
    ).toBe(100);
  });
});

describe("billingPeriodDaysRemaining", () => {
  const periodStart = "2026-05-22T00:00:00.000Z";
  const periodEnd = "2027-05-22T00:00:00.000Z";

  it("uses period length when reference is before period start (not wall-clock days to renewal)", () => {
    const expectedWholePeriodDays = Math.ceil(
      (Date.parse(periodEnd) - Date.parse(periodStart)) / 86400000,
    );
    expect(
      billingPeriodDaysRemaining(periodStart, periodEnd, {
        referenceDate: new Date("2026-05-07T12:00:00.000Z"),
      }),
    ).toBe(expectedWholePeriodDays);
  });

  it("counts from reference when inside the window", () => {
    expect(
      billingPeriodDaysRemaining(periodStart, periodEnd, {
        referenceDate: new Date("2027-05-01T12:00:00.000Z"),
      }),
    ).toBe(
      Math.ceil(
        (Date.parse(periodEnd) - new Date("2027-05-01T12:00:00.000Z").getTime()) / 86400000,
      ),
    );
  });

  it("returns 0 after period end", () => {
    expect(
      billingPeriodDaysRemaining(periodStart, periodEnd, {
        referenceDate: new Date("2027-05-23T00:00:00.000Z"),
      }),
    ).toBe(0);
  });
});

describe("billingPeriodElapsedProgressPercent", () => {
  const start = "2026-05-22T00:00:00.000Z";
  const end = "2027-05-22T00:00:00.000Z";

  it("is 0% before period start", () => {
    expect(
      billingPeriodElapsedProgressPercent(start, end, {
        referenceDate: new Date("2026-05-07T12:00:00.000Z"),
      }),
    ).toBe(0);
  });

  it("is 100% after period end", () => {
    expect(
      billingPeriodElapsedProgressPercent(start, end, {
        referenceDate: new Date("2027-05-23T00:00:00.000Z"),
      }),
    ).toBe(100);
  });

  it("interpolates proportionally mid-period", () => {
    const mid = new Date("2026-11-22T00:00:00.000Z");
    const elapsed = (mid.getTime() - Date.parse(start)) / (Date.parse(end) - Date.parse(start));
    expect(
      billingPeriodElapsedProgressPercent(start, end, {
        referenceDate: mid,
      }),
    ).toBeCloseTo(elapsed * 100, 5);
  });
});

describe("checkout and invoice action gates", () => {
  it("shouldShowPlanCheckout accepts snake_case subscribe and checkout", () => {
    expect(shouldShowPlanCheckout({ can_checkout: true })).toBe(true);
    expect(shouldShowPlanCheckout({ can_subscribe: true })).toBe(true);
  });

  it("shouldShowPlanCheckout accepts billing v1 canStartCheckout flags", () => {
    expect(shouldShowPlanCheckout({ canStartCheckout: true })).toBe(true);
    expect(shouldShowPlanCheckout({ can_start_checkout: true })).toBe(true);
  });

  it("shouldShowInvoiceRequest accepts snake_case", () => {
    expect(shouldShowInvoiceRequest({ can_request_invoice: true })).toBe(true);
  });

  it("shouldShowInvoiceRequest is false when billingUiMode is paid_active", () => {
    expect(
      shouldShowInvoiceRequest({ canRequestInvoice: true }, { billingUiMode: "paid_active" }),
    ).toBe(false);
  });

  it("buildLabelledAvailableActions omits invoice keys when billingUiMode is paid_active", () => {
    expect(
      buildLabelledAvailableActions(
        { canRequestInvoice: true, canManageBilling: true },
        { billingUiMode: "paid_active" },
      ).map((x) => x.key),
    ).toEqual(["canManageBilling"]);
  });

  it("buildBillingDebugFunnelGates hides plan checkout when paid_active even if actions object is empty", () => {
    const s = baseSummary({
      latestInvoiceRequest: { status: "submitted", submittedAt: "2026-05-05" },
      availableActions: {},
      activeOrder: null,
    });
    const gates = buildBillingDebugFunnelGates(s, {
      orders: [minimalHistoryOrder({ isPaid: true, isActive: true })],
    });
    expect(gates.planCheckout).toBe(false);
    expect(gates.invoiceRequest).toBe(false);
  });
});
