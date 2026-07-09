import { describe, expect, it } from "vitest";

import {
  readBillingCheckoutReturnOutcome,
  stripBillingCheckoutReturnParams,
} from "./billingCheckoutReturn";
import { BILLING_CHECKOUT_RETURN_PARAM } from "../../_constants/checkout/billingCheckoutReturnParams";

function searchParamsFromRecord(record: Record<string, string>) {
  return {
    get: (name: string) => record[name] ?? null,
  };
}

describe("readBillingCheckoutReturnOutcome", () => {
  it("returns cancelled when billing_checkout=cancelled", () => {
    expect(
      readBillingCheckoutReturnOutcome(
        searchParamsFromRecord({
          [BILLING_CHECKOUT_RETURN_PARAM.billingCheckout]: "cancelled",
        }),
      ),
    ).toBe("cancelled");
  });

  it("returns success when billing_checkout=success", () => {
    expect(
      readBillingCheckoutReturnOutcome(
        searchParamsFromRecord({
          [BILLING_CHECKOUT_RETURN_PARAM.billingCheckout]: "success",
        }),
      ),
    ).toBe("success");
  });

  it("returns success when session_id is present", () => {
    expect(
      readBillingCheckoutReturnOutcome(
        searchParamsFromRecord({
          [BILLING_CHECKOUT_RETURN_PARAM.sessionId]: "cs_123",
        }),
      ),
    ).toBe("success");
  });

  it("returns success when checkout_session_id is present", () => {
    expect(
      readBillingCheckoutReturnOutcome(
        searchParamsFromRecord({
          [BILLING_CHECKOUT_RETURN_PARAM.checkoutSessionId]: "cs_456",
        }),
      ),
    ).toBe("success");
  });

  it("returns null when no recognised params are present", () => {
    expect(readBillingCheckoutReturnOutcome(searchParamsFromRecord({}))).toBe(null);
  });

  it("prefers cancelled over session_id when both are present", () => {
    expect(
      readBillingCheckoutReturnOutcome(
        searchParamsFromRecord({
          [BILLING_CHECKOUT_RETURN_PARAM.billingCheckout]: "cancelled",
          [BILLING_CHECKOUT_RETURN_PARAM.sessionId]: "cs_123",
        }),
      ),
    ).toBe("cancelled");
  });
});

describe("stripBillingCheckoutReturnParams", () => {
  it("removes all recognised checkout return params", () => {
    const sp = new URLSearchParams({
      [BILLING_CHECKOUT_RETURN_PARAM.sessionId]: "cs_123",
      [BILLING_CHECKOUT_RETURN_PARAM.checkoutSessionId]: "cs_456",
      [BILLING_CHECKOUT_RETURN_PARAM.billingCheckout]: "cancelled",
      other: "keep",
    });

    stripBillingCheckoutReturnParams(sp);

    expect(sp.toString()).toBe("other=keep");
  });
});
