import { FileText } from "lucide-react";

import {
  TypographyBodySmall,
  TypographyCaption,
  TypographyDataLabel,
  TypographyDataValue,
} from "@/components/typography";
import { Button } from "@/components/ui/button";

import { AccountSectionShell } from "../../../account/_components/AccountSectionShell";
import { formatBillingDateTable } from "../../_utils/overview/formatBillingDisplay";

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
    <li className="border-border border-b px-6 py-4 last:border-b-0">
      <dl className="grid gap-1">
        <div className="flex flex-wrap justify-between gap-2">
          <TypographyDataLabel as="dt">Submitted</TypographyDataLabel>
          <TypographyDataValue as="dd">
            {formatBillingDateTable(request.submittedAt)}
          </TypographyDataValue>
        </div>
        <div className="flex flex-wrap justify-between gap-2">
          <TypographyDataLabel as="dt">Requested</TypographyDataLabel>
          <TypographyDataValue as="dd">
            {formatBillingDateTable(request.requestedStartDate)}
          </TypographyDataValue>
        </div>
        <div className="flex flex-wrap justify-between gap-2">
          <TypographyDataLabel as="dt">Status</TypographyDataLabel>
          <TypographyDataValue as="dd">{request.status ?? "—"}</TypographyDataValue>
        </div>
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
  withdrawPending,
  onWithdraw,
}: {
  invoiceRequests: InvoiceRequestSummary[];
  withdrawPending: boolean;
  onWithdraw: (request: InvoiceRequestSummary) => void;
}) {
  return (
    <AccountSectionShell
      title="Invoice requests"
      icon={<FileText className="size-5" aria-hidden />}
      headerTone="slate"
    >
      <div className="px-0 pb-0">
        {invoiceRequests.length === 0 ? (
          <TypographyBodySmall className="px-6 py-5" role="status">
            No invoice requests yet.
          </TypographyBodySmall>
        ) : (
          <ul className="border-border divide-border divide-y border-t">
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
      </div>
    </AccountSectionShell>
  );
}
