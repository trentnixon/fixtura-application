import { describe, expect, it } from "vitest";

import { normalizeCancelInvoiceRequestResponse } from "./normalize-cancel-invoice-request-response";

describe("normalizeCancelInvoiceRequestResponse", () => {
  it("maps camelCase root payload", () => {
    expect(
      normalizeCancelInvoiceRequestResponse({
        invoiceRequestId: "12",
        noOp: false,
        status: "cancelled",
      }),
    ).toEqual({
      invoiceRequestId: "12",
      noOp: false,
      status: "cancelled",
    });
  });

  it("maps snake_case and data wrapper", () => {
    expect(
      normalizeCancelInvoiceRequestResponse({
        data: {
          invoice_request_id: 99,
          no_op: true,
        },
      }),
    ).toEqual({
      invoiceRequestId: "99",
      noOp: true,
    });
  });
});
