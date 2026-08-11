import { BrandedLoader } from "@/components/ui/branded-loader";
import { ErrorState } from "@/components/ui/error-state";
import { AUTH_ERROR_MESSAGES } from "@/lib/auth/auth-errors";

import { BillingHistoryRedirectingStatus } from "./BillingHistoryRedirectingStatus";

import type { BillingHistoryState } from "../_types/billingHistory";

export function BillingHistoryStatusState({
  state,
}: {
  state: Exclude<BillingHistoryState, { kind: "ready" }>;
}) {
  if (state.kind === "invalid-account" || state.kind === "redirecting") {
    return <BillingHistoryRedirectingStatus />;
  }

  if (state.kind === "loading") {
    return <BrandedLoader label="Loading history" />;
  }

  return (
    <ErrorState
      title="Could not load history"
      description={state.message || AUTH_ERROR_MESSAGES.network}
      onRetry={state.refetchHistory}
    />
  );
}
