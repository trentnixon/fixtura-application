import { describe, expect, it, vi, beforeEach } from "vitest";

const redirect = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  redirect,
}));

import BillingCheckoutCancelPage from "./page";

describe("BillingCheckoutCancelPage", () => {
  beforeEach(() => {
    redirect.mockClear();
  });

  it("redirects to billing with billing_checkout=cancelled", async () => {
    await BillingCheckoutCancelPage({
      params: Promise.resolve({ accountId: "42" }),
    });

    expect(redirect).toHaveBeenCalledTimes(1);
    expect(redirect).toHaveBeenCalledWith("/o/42/billing?billing_checkout=cancelled");
  });
});
