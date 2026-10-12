import { describe, expect, it } from "vitest";

import { readAccountBillingSummary } from "./useAccountBilling";

import type { AccountBillingSummaryV1 } from "@/types/api/account";

function summary(): AccountBillingSummaryV1 {
  return {
    billingStatus: "active",
    accessStatus: "active",
    currentPlan: null,
    trial: null,
    activeOrder: null,
    latestInvoiceRequest: null,
  };
}

describe("readAccountBillingSummary", () => {
  it("reads a wrapped billing response", () => {
    expect(readAccountBillingSummary({ data: summary() })?.billingStatus).toBe("active");
  });

  it("reads a summary stored without a data wrapper", () => {
    expect(readAccountBillingSummary(summary())?.activeOrder).toBeNull();
  });

  it("returns undefined for a gateway redirect and for a response with no summary", () => {
    expect(
      readAccountBillingSummary({ _tag: "billingGatewayRedirect", reason: "forbidden" }),
    ).toBeUndefined();
    expect(readAccountBillingSummary({ data: undefined })).toBeUndefined();
    expect(readAccountBillingSummary(undefined)).toBeUndefined();
  });
});
