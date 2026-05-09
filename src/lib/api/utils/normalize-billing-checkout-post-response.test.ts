import { describe, expect, it } from "vitest";

import {
  normalizeCreateCheckoutResponse,
  normalizeDeletePendingOrderResponse,
  normalizeResumeCheckoutResponse,
} from "./normalize-billing-checkout-post-response";

describe("normalize-billing-checkout-post-response", () => {
  it("normalizeCreateCheckoutResponse reads camelCase at root", () => {
    expect(
      normalizeCreateCheckoutResponse({
        checkoutSessionId: "cs_1",
        orderId: "42",
        checkoutUrl: "https://checkout.test",
      }),
    ).toEqual({
      checkoutSessionId: "cs_1",
      orderId: "42",
      checkoutUrl: "https://checkout.test",
    });
  });

  it("normalizeCreateCheckoutResponse maps snake_case", () => {
    expect(
      normalizeCreateCheckoutResponse({
        checkout_session_id: "cs_1",
        order_id: 99,
        checkout_url: "https://checkout.test",
      }),
    ).toEqual({
      checkoutSessionId: "cs_1",
      orderId: "99",
      checkoutUrl: "https://checkout.test",
    });
  });

  it("normalizeCreateCheckoutResponse unwraps data when inner holds checkout fields", () => {
    expect(
      normalizeCreateCheckoutResponse({
        data: {
          checkout_session_id: "cs_1",
          order_id: "7",
          checkout_url: "https://x",
        },
      }),
    ).toEqual({
      checkoutSessionId: "cs_1",
      orderId: "7",
      checkoutUrl: "https://x",
    });
  });

  it("normalizeResumeCheckoutResponse maps reused_existing and url", () => {
    expect(
      normalizeResumeCheckoutResponse({
        checkout_session_id: "cs_2",
        order_id: "100",
        checkout_url: "https://resume",
        reused_existing: true,
      }),
    ).toEqual({
      checkoutSessionId: "cs_2",
      orderId: "100",
      checkoutUrl: "https://resume",
      reusedExisting: true,
    });
  });

  it("normalizeDeletePendingOrderResponse maps active discard shape", () => {
    expect(
      normalizeDeletePendingOrderResponse({
        orderId: "12345",
        checkoutStatus: "incomplete_expired",
        stripeSessionExpired: true,
        noOp: false,
      }),
    ).toEqual({
      orderId: "12345",
      checkoutStatus: "incomplete_expired",
      stripeSessionExpired: true,
      noOp: false,
    });
  });

  it("normalizeDeletePendingOrderResponse maps idempotent no_op and unwraps data", () => {
    expect(
      normalizeDeletePendingOrderResponse({
        data: {
          order_id: "12345",
          no_op: true,
          checkout_status: "incomplete_expired",
        },
      }),
    ).toEqual({
      orderId: "12345",
      noOp: true,
      checkoutStatus: "incomplete_expired",
    });
  });
});
