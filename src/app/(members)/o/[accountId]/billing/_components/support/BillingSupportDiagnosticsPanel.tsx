"use client";

import { LifeBuoy } from "lucide-react";
import Link from "next/link";

import {
  TypographyBodySmall,
  TypographyDataLabel,
  TypographyDataValue,
} from "@/components/typography";
import { Button } from "@/components/ui/button";
import {
  isAccountBillingInvoiceRequestsGatewayRedirect,
  useAccountBillingInvoiceRequests,
} from "@/lib/api/hooks/account/useAccountBillingInvoiceRequests";

import { AccountSectionShell } from "../../../account/_components/AccountSectionShell";
import { BILLING_SUPPORT_READ_ONLY_COPY } from "../../_constants/support/billingSupportReadOnly";
import { buildBillingSupportDiagnosticsModel } from "../../_utils/support/buildBillingSupportDiagnosticsModel";

import type { BillingUiMode } from "../../_core/billing-state";
import type { AccountBillingSummaryV1 } from "@/types/api/account";

type BillingSupportDiagnosticsPanelProps = {
  accountId: string;
  billingUiMode: BillingUiMode;
  billingSummary: AccountBillingSummaryV1;
};

export function BillingSupportDiagnosticsPanel({
  accountId,
  billingUiMode,
  billingSummary,
}: BillingSupportDiagnosticsPanelProps) {
  const invoiceRequestsQuery = useAccountBillingInvoiceRequests(accountId, { enabled: true });

  const invoiceRequests =
    invoiceRequestsQuery.isSuccess &&
    invoiceRequestsQuery.data &&
    !isAccountBillingInvoiceRequestsGatewayRedirect(invoiceRequestsQuery.data)
      ? invoiceRequestsQuery.data.invoiceRequests
      : [];

  const model = buildBillingSupportDiagnosticsModel({
    accountId,
    billingUiMode,
    summary: billingSummary,
    invoiceRequests,
  });

  return (
    <AccountSectionShell
      title="Support billing diagnostics"
      description={BILLING_SUPPORT_READ_ONLY_COPY.diagnosticsDescription}
      icon={<LifeBuoy className="size-5" aria-hidden />}
      headerTone="slate"
    >
      <div className="space-y-4 px-6 py-5">
        <dl className="grid gap-3 text-sm">
          {model.rows.map((row) => (
            <div key={row.label} className="grid gap-0.5">
              <TypographyDataLabel>{row.label}</TypographyDataLabel>
              <TypographyDataValue className="text-sm font-normal">{row.value}</TypographyDataValue>
            </div>
          ))}
          <div className="grid gap-0.5">
            <TypographyDataLabel>Invoice requests (list GET)</TypographyDataLabel>
            <TypographyDataValue className="text-sm font-normal">
              {invoiceRequestsQuery.isPending
                ? "Loading…"
                : invoiceRequestsQuery.isError
                  ? "Failed to load list"
                  : `${model.invoiceRequestCount} request${model.invoiceRequestCount === 1 ? "" : "s"}`}
            </TypographyDataValue>
          </div>
        </dl>

        {model.hasMultipleInvoiceRequests ? (
          <TypographyBodySmall className="text-muted-foreground" role="status">
            Multiple invoice requests on file — compare list history with summary latest when
            diagnosing blocked checkout.
          </TypographyBodySmall>
        ) : null}

        <Button type="button" variant="outline" size="sm" asChild>
          <Link href={model.historyHref}>Open billing history</Link>
        </Button>
      </div>
    </AccountSectionShell>
  );
}
