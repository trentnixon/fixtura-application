import { describe, expect, it } from "vitest";

import { normalizeInvoiceRequestPostBody } from "./normalize-invoice-request-post-body";

describe("normalizeInvoiceRequestPostBody", () => {
  it("passes through when billingAddress is omitted", () => {
    const raw = {
      subscriptionTierId: "12",
      billingEmail: "a@b.com",
    } as Record<string, unknown>;
    const r = normalizeInvoiceRequestPostBody(raw);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.body).toEqual(raw);
  });

  it("removes null billingAddress", () => {
    const r = normalizeInvoiceRequestPostBody({
      subscriptionTierId: "12",
      billingAddress: null,
    });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.body).not.toHaveProperty("billingAddress");
  });

  it("removes empty billingAddress object", () => {
    const r = normalizeInvoiceRequestPostBody({
      subscriptionTierId: "12",
      billingAddress: {},
    });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.body).not.toHaveProperty("billingAddress");
  });

  it("rejects partial billingAddress", () => {
    const r = normalizeInvoiceRequestPostBody({
      subscriptionTierId: "12",
      billingAddress: { line1: "1 Main St" },
    });
    expect(r.ok).toBe(false);
  });

  it("keeps complete billingAddress with optional line2", () => {
    const r = normalizeInvoiceRequestPostBody({
      subscriptionTierId: "12",
      billingAddress: {
        line1: "1 Main St",
        city: "Sydney",
        state: "NSW",
        postcode: "2000",
        country: "AU",
      },
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.body["billingAddress"]).toEqual({
        line1: "1 Main St",
        city: "Sydney",
        state: "NSW",
        postcode: "2000",
        country: "AU",
      });
    }
  });
});
