import { describe, expect, it } from "vitest";

import {
  hasBillingOverviewSubscriptionPath,
  resolveEffectiveBillingProductState,
  shouldShowBillingAccessUncertainCard,
  shouldShowCreateSeasonPassSection,
} from "./billingOverviewPresentation";

describe("billingOverviewPresentation", () => {
  it("suppresses access uncertain card when org notice explains the situation", () => {
    expect(
      shouldShowBillingAccessUncertainCard("unknown", "active_on_another_account", {
        canStartCheckout: true,
      }),
    ).toBe(false);
  });

  it("suppresses access uncertain card when create subscription is available", () => {
    expect(
      shouldShowBillingAccessUncertainCard("unknown", "blocked_by_billing", {
        canStartCheckout: true,
      }),
    ).toBe(false);
  });

  it("shows access uncertain card only when no org notice and no subscription path", () => {
    const noSubscriptionActions = { canStartCheckout: false, canRequestInvoice: false };

    expect(
      shouldShowBillingAccessUncertainCard("unknown", "blocked_by_billing", noSubscriptionActions),
    ).toBe(true);
    expect(
      shouldShowBillingAccessUncertainCard(
        "access_denied",
        "start_available",
        noSubscriptionActions,
      ),
    ).toBe(true);
  });

  it("maps unknown + subscription path to create_subscription product state", () => {
    expect(
      resolveEffectiveBillingProductState("unknown", "active_on_another_account", {
        canStartCheckout: false,
      }),
    ).toBe("create_subscription");
    expect(
      resolveEffectiveBillingProductState("unknown", "blocked_by_billing", {
        canStartCheckout: true,
      }),
    ).toBe("create_subscription");
  });

  it("shows season pass section for unknown when checkout is allowed", () => {
    expect(
      shouldShowCreateSeasonPassSection("unknown", "active_on_another_account", {
        canStartCheckout: true,
      }),
    ).toBe(true);
    expect(
      shouldShowCreateSeasonPassSection("unknown", "active_on_another_account", {
        canStartCheckout: false,
      }),
    ).toBe(false);
  });

  it("detects subscription path from org notice without checkout flag", () => {
    expect(hasBillingOverviewSubscriptionPath("unknown", "used", undefined)).toBe(true);
  });
});
