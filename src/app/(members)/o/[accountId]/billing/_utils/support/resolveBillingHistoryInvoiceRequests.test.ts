import { describe, expect, it } from "vitest";

import { resolveBillingHistoryInvoiceRequests } from "./resolveBillingHistoryInvoiceRequests";

import type { InvoiceRequestSummary } from "@/types/api/account";

const listRow: InvoiceRequestSummary = {
  invoiceRequestId: "list-1",
  status: "submitted",
};

describe("resolveBillingHistoryInvoiceRequests", () => {
  it("returns invoice requests from the list GET", () => {
    expect(
      resolveBillingHistoryInvoiceRequests({
        listFromQuery: [listRow],
      }),
    ).toEqual([listRow]);
  });

  it("returns empty array when list GET is empty", () => {
    expect(
      resolveBillingHistoryInvoiceRequests({
        listFromQuery: [],
      }),
    ).toEqual([]);
  });
});
