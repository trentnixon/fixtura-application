import { describe, expect, it } from "vitest";

import { resolveWithdrawableInvoiceRequestId } from "./resolveWithdrawableInvoiceRequestId";

import type { AccountBillingSummaryV1 } from "@/types/api/account";

function baseSummary(overrides: Partial<AccountBillingSummaryV1> = {}): AccountBillingSummaryV1 {
  return {
    billingStatus: "x",
    accessStatus: "active",
    currentPlan: null,
    trial: null,
    activeOrder: null,
    latestInvoiceRequest: null,
    availableActions: {},
    ...overrides,
  };
}

describe("resolveWithdrawableInvoiceRequestId", () => {
  it("returns id when flag and canWithdraw true", () => {
    expect(
      resolveWithdrawableInvoiceRequestId(
        baseSummary({
          availableActions: { ["canWithdrawInvoiceRequest"]: true },
          latestInvoiceRequest: {
            invoiceRequestId: "42",
            canWithdraw: true,
          },
        }),
      ),
    ).toBe("42");
  });

  it("uses numeric id when invoiceRequestId absent", () => {
    expect(
      resolveWithdrawableInvoiceRequestId(
        baseSummary({
          availableActions: { ["canWithdrawInvoiceRequest"]: true },
          latestInvoiceRequest: {
            id: 7,
            canWithdraw: true,
          },
        }),
      ),
    ).toBe("7");
  });

  it("returns null when canWithdrawInvoiceRequest false", () => {
    expect(
      resolveWithdrawableInvoiceRequestId(
        baseSummary({
          availableActions: { ["canWithdrawInvoiceRequest"]: false },
          latestInvoiceRequest: { invoiceRequestId: "1", canWithdraw: true },
        }),
      ),
    ).toBeNull();
  });

  it("returns null when canWithdraw not true on latest row", () => {
    expect(
      resolveWithdrawableInvoiceRequestId(
        baseSummary({
          availableActions: { ["canWithdrawInvoiceRequest"]: true },
          latestInvoiceRequest: { invoiceRequestId: "1", canWithdraw: false },
        }),
      ),
    ).toBeNull();
  });

  it("returns null when canWithdraw omitted on latest row", () => {
    expect(
      resolveWithdrawableInvoiceRequestId(
        baseSummary({
          availableActions: { ["canWithdrawInvoiceRequest"]: true },
          latestInvoiceRequest: { invoiceRequestId: "1" },
        }),
      ),
    ).toBeNull();
  });

  it("returns null when no latest row", () => {
    expect(
      resolveWithdrawableInvoiceRequestId(
        baseSummary({
          availableActions: { ["canWithdrawInvoiceRequest"]: true },
          latestInvoiceRequest: null,
        }),
      ),
    ).toBeNull();
  });
});
