import { describe, expect, it } from "vitest";

import { resolveBillingHistoryInvoiceRequests } from "./resolveBillingHistoryInvoiceRequests";

import type { AccountBillingSummaryV1, InvoiceRequestSummary } from "@/types/api/account";

const listRow: InvoiceRequestSummary = {
  invoiceRequestId: "list-1",
  status: "submitted",
};

const latestRow: InvoiceRequestSummary = {
  invoiceRequestId: "latest-1",
  status: "pending",
};

const summaryWithLatest = {
  latestInvoiceRequest: latestRow,
} as AccountBillingSummaryV1;

describe("resolveBillingHistoryInvoiceRequests", () => {
  it("returns list from query for normal billing history", () => {
    expect(
      resolveBillingHistoryInvoiceRequests({
        isSupportView: false,
        summary: summaryWithLatest,
        listFromQuery: [listRow],
      }),
    ).toEqual([listRow]);
  });

  it("returns latest from summary only in support view", () => {
    expect(
      resolveBillingHistoryInvoiceRequests({
        isSupportView: true,
        summary: summaryWithLatest,
        listFromQuery: [listRow],
      }),
    ).toEqual([latestRow]);
  });

  it("returns empty array in support view when summary has no latest row", () => {
    expect(
      resolveBillingHistoryInvoiceRequests({
        isSupportView: true,
        summary: { latestInvoiceRequest: null } as AccountBillingSummaryV1,
        listFromQuery: [listRow],
      }),
    ).toEqual([]);
  });
});
