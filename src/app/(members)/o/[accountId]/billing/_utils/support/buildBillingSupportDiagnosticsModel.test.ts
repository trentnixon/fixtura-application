import { describe, expect, it } from "vitest";

import { buildBillingSupportDiagnosticsModel } from "./buildBillingSupportDiagnosticsModel";

import type { AccountBillingSummaryV1, InvoiceRequestSummary } from "@/types/api/account";

function baseSummary(overrides: Partial<AccountBillingSummaryV1> = {}): AccountBillingSummaryV1 {
  return {
    billingStatus: "trial_active",
    accessStatus: "active",
    currentPlan: null,
    trial: { isActive: true, isEligible: false, daysRemaining: 12 },
    organisationTrial: { consumptionStatus: "used", canStartTrial: false },
    activeOrder: null,
    availableActions: { canStartCheckout: true, canRequestInvoice: false },
    latestInvoiceRequest: { status: "cancelled", message: "Previous request failed" },
    ...overrides,
  };
}

describe("buildBillingSupportDiagnosticsModel", () => {
  it("builds triage rows including available actions and trial context", () => {
    const invoiceRequests: InvoiceRequestSummary[] = [
      { invoiceRequestId: "a", status: "cancelled" },
      { invoiceRequestId: "b", status: "submitted" },
    ];

    const model = buildBillingSupportDiagnosticsModel({
      accountId: "700",
      billingUiMode: "payment_pending",
      summary: baseSummary(),
      invoiceRequests,
    });

    expect(model.rows.map((r) => r.label)).toEqual(
      expect.arrayContaining([
        "UI mode",
        "Billing status",
        "Organisation trial",
        "Account trial",
        "Available actions (API)",
        "Latest invoice request (summary)",
      ]),
    );
    expect(model.invoiceRequestCount).toBe(2);
    expect(model.hasMultipleInvoiceRequests).toBe(true);
    expect(model.historyHref).toBe("/o/700/billing/history");
  });
});
