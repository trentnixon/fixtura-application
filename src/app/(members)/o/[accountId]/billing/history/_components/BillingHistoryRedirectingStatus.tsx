import { TypographyBodySmall } from "@/components/typography";

import { BillingDebugPanel } from "../../debug/billing-debug-panel";

import type { AccountBillingSummaryV1 } from "@/types/api/account";

export function BillingHistoryRedirectingStatus({
  accountId,
  summary,
  extra,
}: {
  accountId: string;
  summary: AccountBillingSummaryV1 | null;
  extra: Record<string, string | number | boolean | null | undefined>;
}) {
  return (
    <div className="grid gap-2 text-center" role="status">
      <TypographyBodySmall>Redirecting…</TypographyBodySmall>
      <BillingDebugPanel
        accountId={accountId}
        contextLabel="History"
        summary={summary}
        isSummaryLoading={false}
        extra={extra}
      />
    </div>
  );
}
