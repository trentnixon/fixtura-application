import { BrandedLoader } from "@/components/ui/branded-loader";
import { ErrorState } from "@/components/ui/error-state";
import { AUTH_ERROR_MESSAGES } from "@/lib/auth/auth-errors";

import { BillingHistoryRedirectingStatus } from "./BillingHistoryRedirectingStatus";
import { BillingDebugPanel } from "../../debug/billing-debug-panel";

import type { BillingHistoryState } from "../_types/billingHistory";

export function BillingHistoryStatusState({
  state,
}: {
  state: Exclude<BillingHistoryState, { kind: "ready" }>;
}) {
  if (state.kind === "invalid-account") {
    return (
      <BillingHistoryRedirectingStatus
        accountId={state.accountId}
        summary={null}
        extra={{ validAccountSegment: false }}
      />
    );
  }

  if (state.kind === "redirecting") {
    return (
      <BillingHistoryRedirectingStatus
        accountId={state.accountId}
        summary={state.summary}
        extra={state.extra}
      />
    );
  }

  if (state.kind === "loading") {
    return (
      <>
        <BrandedLoader label="Loading history" />
        <BillingDebugPanel
          accountId={state.accountId}
          contextLabel="History"
          summary={state.summary}
          isSummaryLoading
          extra={state.extra}
        />
      </>
    );
  }

  return (
    <>
      <ErrorState
        title="Could not load history"
        description={state.message || AUTH_ERROR_MESSAGES.network}
        onRetry={state.refetchHistory}
      />
      <BillingDebugPanel
        accountId={state.accountId}
        contextLabel="History"
        summary={state.summary}
        isSummaryLoading={false}
        summaryError={state.message || AUTH_ERROR_MESSAGES.network}
        extra={state.extra}
      />
    </>
  );
}
