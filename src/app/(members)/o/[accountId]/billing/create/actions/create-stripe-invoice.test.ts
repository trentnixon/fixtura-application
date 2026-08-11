import { beforeEach, describe, expect, it, vi } from "vitest";

const fetchStrapiWithAuthCookie = vi.hoisted(() => vi.fn());

vi.mock("@/lib/strapi/server", () => ({
  fetchStrapiWithAuthCookie: (...args: unknown[]) => fetchStrapiWithAuthCookie(...args),
}));

import { createStrapiStripeInvoice } from "./create-stripe-invoice";

describe("createStrapiStripeInvoice", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects invalid route account id without calling Strapi", async () => {
    const result = await createStrapiStripeInvoice("not-valid", {
      AccountID: "not-valid",
      product_id: 1,
      startDate: "2026-01-01",
      endDate: "2026-12-31",
    });

    expect(result).toEqual({
      ok: false,
      status: 400,
      message: "Invalid organisation id.",
    });
    expect(fetchStrapiWithAuthCookie).not.toHaveBeenCalled();
  });

  it("rejects body AccountID that does not match route account id", async () => {
    const result = await createStrapiStripeInvoice("123", {
      AccountID: "456",
      product_id: 1,
      startDate: "2026-01-01",
      endDate: "2026-12-31",
    });

    expect(result).toEqual({
      ok: false,
      status: 400,
      message: "Organisation id does not match the current route.",
    });
    expect(fetchStrapiWithAuthCookie).not.toHaveBeenCalled();
  });

  it("calls Strapi when route and body account ids match", async () => {
    fetchStrapiWithAuthCookie.mockResolvedValue(
      new Response(
        JSON.stringify({
          message: "Invoice created.",
          invoiceId: "inv_1",
          customerId: 9,
          orderId: 77,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    const result = await createStrapiStripeInvoice("123", {
      AccountID: 123,
      product_id: 5,
      startDate: "2026-01-01",
      endDate: "2026-12-31",
    });

    expect(result).toEqual({
      ok: true,
      message: "Invoice created.",
      invoiceId: "inv_1",
      customerId: 9,
      orderId: 77,
    });
    expect(fetchStrapiWithAuthCookie).toHaveBeenCalledTimes(1);
    expect(fetchStrapiWithAuthCookie).toHaveBeenCalledWith(
      "/api/orders/stripe/create-invoice",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          AccountID: 123,
          product_id: 5,
          startDate: "2026-01-01",
          endDate: "2026-12-31",
        }),
      }),
    );
  });
});
