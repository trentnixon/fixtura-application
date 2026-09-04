import { labelForBillingStatus } from "../overview/billingSummaryLabels";
import { buildLabelledAvailableActions } from "../overview/buildLabelledAvailableActions";

import type { BillingUiMode } from "../../_core/billing-state";
import type {
  AccountBillingSummaryV1,
  BillingTrialSummaryV1,
  InvoiceRequestSummary,
} from "@/types/api/account";

function formatAccountTrialSummary(trial: BillingTrialSummaryV1): string | null {
  const parts: string[] = [];
  if (trial.isActive != null) {
    parts.push(trial.isActive ? "active" : "inactive");
  }
  if (trial.isEligible != null) {
    parts.push(trial.isEligible ? "eligible" : "not eligible");
  }
  if (trial.daysRemaining != null) {
    parts.push(`${trial.daysRemaining} days remaining`);
  }
  return parts.length > 0 ? parts.join(", ") : null;
}

export type BillingSupportDiagnosticsRow = {
  label: string;
  value: string;
};

export type BillingSupportDiagnosticsModel = {
  rows: BillingSupportDiagnosticsRow[];
  invoiceRequestCount: number;
  hasMultipleInvoiceRequests: boolean;
  historyHref: string;
};

export function buildBillingSupportDiagnosticsModel({
  accountId,
  billingUiMode,
  summary,
  invoiceRequests,
}: {
  accountId: string;
  billingUiMode: BillingUiMode;
  summary: AccountBillingSummaryV1;
  invoiceRequests: InvoiceRequestSummary[];
}): BillingSupportDiagnosticsModel {
  const rows: BillingSupportDiagnosticsRow[] = [
    { label: "UI mode", value: billingUiMode },
    {
      label: "Billing status",
      value: summary.billingStatus ? labelForBillingStatus(summary.billingStatus) : "—",
    },
  ];

  const orgTrial = summary.organisationTrial;
  if (orgTrial?.consumptionStatus) {
    rows.push({
      label: "Organisation trial",
      value: orgTrial.consumptionStatus,
    });
  }

  const trial = summary.trial;
  const trialSummary = trial ? formatAccountTrialSummary(trial) : null;
  if (trialSummary) {
    rows.push({ label: "Account trial", value: trialSummary });
  }

  const labelledActions = buildLabelledAvailableActions(summary.availableActions, {
    billingUiMode,
  });
  rows.push({
    label: "Available actions (API)",
    value: labelledActions.length > 0 ? labelledActions.map((a) => a.label).join(", ") : "None",
  });

  const latest = summary.latestInvoiceRequest;
  if (latest?.status) {
    rows.push({
      label: "Latest invoice request (summary)",
      value: latest.message ? `${latest.status} — ${latest.message}` : latest.status,
    });
  }

  return {
    rows,
    invoiceRequestCount: invoiceRequests.length,
    hasMultipleInvoiceRequests: invoiceRequests.length > 1,
    historyHref: `/o/${encodeURIComponent(accountId)}/billing/history`,
  };
}
