import {
  TypographyBodySmall,
  TypographyCaption,
  TypographyCardDescription,
  TypographyCardTitle,
  TypographyDataLabel,
  TypographyDataValue,
  TypographyErrorText,
} from "@/components/typography";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { formatBillingHistoryDate } from "../_utils/formatBillingHistory";

import type { InvoiceRequestSummary } from "@/types/api/account";

function InvoiceRequestRow({
  request,
  onWithdraw,
  withdrawPending = false,
}: {
  request: InvoiceRequestSummary;
  onWithdraw?: () => void;
  withdrawPending?: boolean;
}) {
  return (
    <li className="border-border rounded-lg border p-4">
      <dl className="grid gap-1">
        <div className="flex flex-wrap justify-between gap-2">
          <TypographyDataLabel as="dt">Request ID</TypographyDataLabel>
          <TypographyDataValue as="dd" className="text-right font-mono text-xs">
            {request.invoiceRequestId ?? request.id ?? "—"}
          </TypographyDataValue>
        </div>
        <div className="flex flex-wrap justify-between gap-2">
          <TypographyDataLabel as="dt">Status</TypographyDataLabel>
          <TypographyDataValue as="dd">{request.status ?? "—"}</TypographyDataValue>
        </div>
        <div className="flex flex-wrap justify-between gap-2">
          <TypographyDataLabel as="dt">Submitted</TypographyDataLabel>
          <TypographyDataValue as="dd">
            {formatBillingHistoryDate(request.submittedAt ?? null)}
          </TypographyDataValue>
        </div>
        {request.requestedStartDate ? (
          <div className="flex flex-wrap justify-between gap-2">
            <TypographyDataLabel as="dt">Requested start</TypographyDataLabel>
            <TypographyDataValue as="dd">
              {formatBillingHistoryDate(request.requestedStartDate)}
            </TypographyDataValue>
          </div>
        ) : null}
        {request.subscriptionTierId ? (
          <div className="flex flex-wrap justify-between gap-2">
            <TypographyDataLabel as="dt">Tier</TypographyDataLabel>
            <TypographyDataValue as="dd">{request.subscriptionTierId}</TypographyDataValue>
          </div>
        ) : null}
        {request.message ? (
          <div className="pt-1">
            <TypographyCaption>{request.message}</TypographyCaption>
          </div>
        ) : null}
        {onWithdraw ? (
          <div className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={withdrawPending}
              onClick={() => void onWithdraw()}
            >
              {withdrawPending ? "Withdrawing…" : "Withdraw request"}
            </Button>
          </div>
        ) : null}
      </dl>
    </li>
  );
}

export function BillingHistoryInvoiceRequestsCard({
  invoiceRequests,
  invoiceWithdrawError,
  withdrawPending,
  onWithdraw,
}: {
  invoiceRequests: InvoiceRequestSummary[];
  invoiceWithdrawError: string | null;
  withdrawPending: boolean;
  onWithdraw: (request: InvoiceRequestSummary) => Promise<void>;
}) {
  return (
    <Card>
      <CardHeader>
        <TypographyCardTitle className="font-brand">Invoice requests</TypographyCardTitle>
        <TypographyCardDescription>
          History from GET /billing/invoice-requests.
        </TypographyCardDescription>
      </CardHeader>
      <CardContent>
        {invoiceWithdrawError ? (
          <TypographyErrorText className="mb-3" role="alert">
            {invoiceWithdrawError}
          </TypographyErrorText>
        ) : null}
        {invoiceRequests.length === 0 ? (
          <TypographyBodySmall role="status">No invoice requests yet.</TypographyBodySmall>
        ) : (
          <ul className="grid gap-3">
            {invoiceRequests.map((request, index) => (
              <InvoiceRequestRow
                key={String(request.invoiceRequestId ?? request.id ?? index)}
                request={request}
                withdrawPending={withdrawPending}
                {...(request.canWithdraw === true
                  ? {
                      onWithdraw: () => onWithdraw(request),
                    }
                  : {})}
              />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
