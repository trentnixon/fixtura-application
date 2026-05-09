import { TypographyBodySmall } from "@/components/typography";
import { BrandedLoader } from "@/components/ui/branded-loader";
import { ErrorState } from "@/components/ui/error-state";

import { CheckoutReturnBanner } from "../../_components/banners/CheckoutReturnBanner";
import { BillingDebugPanel } from "../../debug/billing-debug-panel";

import type { BillingOverviewState } from "../_hooks/useBillingOverviewContentState";

type BillingOverviewStatusStateProps = {
  state: Exclude<BillingOverviewState, { kind: "ready" }>;
  onRetryBilling?: () => void;
};

export function BillingOverviewStatusState({
  state,
  onRetryBilling,
}: BillingOverviewStatusStateProps) {
  if (state.kind === "invalid-account") {
    return (
      <div className="grid gap-2 text-center" role="status">
        <TypographyBodySmall>Redirecting...</TypographyBodySmall>
        <BillingDebugPanel
          accountId={state.accountId}
          contextLabel="Overview"
          summary={null}
          isSummaryLoading={false}
          extra={{ validAccountSegment: false }}
        />
      </div>
    );
  }

  if (state.kind === "billing-loading") {
    return (
      <>
        {state.checkoutReturnNotice ? (
          <CheckoutReturnBanner outcome={state.checkoutReturnNotice} />
        ) : null}
        <BrandedLoader label="Loading billing" />
        <BillingDebugPanel
          accountId={state.accountId}
          contextLabel="Overview"
          summary={null}
          isSummaryLoading
        />
      </>
    );
  }

  if (state.kind === "billing-gateway-redirect") {
    return (
      <div className="grid gap-2 text-center" role="status">
        <TypographyBodySmall>Redirecting...</TypographyBodySmall>
        <BillingDebugPanel
          accountId={state.accountId}
          contextLabel="Overview"
          summary={null}
          isSummaryLoading={false}
          extra={{ gateway: state.gatewayReason }}
        />
      </div>
    );
  }

  if (state.kind === "billing-error") {
    return (
      <>
        {state.checkoutReturnNotice ? (
          <CheckoutReturnBanner outcome={state.checkoutReturnNotice} />
        ) : null}
        <ErrorState
          title="Could not load billing"
          description={state.message}
          {...(onRetryBilling ? { onRetry: onRetryBilling } : {})}
        />
        <BillingDebugPanel
          accountId={state.accountId}
          contextLabel="Overview"
          summary={null}
          isSummaryLoading={false}
          summaryError={state.message}
        />
      </>
    );
  }

  if (state.kind === "unexpected-empty") {
    return (
      <BillingDebugPanel
        accountId={state.accountId}
        contextLabel="Overview"
        summary={null}
        isSummaryLoading={false}
        extra={{ state: "unexpected_empty" }}
      />
    );
  }

  if (state.kind === "orders-loading") {
    return (
      <>
        {state.checkoutReturnNotice ? (
          <CheckoutReturnBanner outcome={state.checkoutReturnNotice} />
        ) : null}
        <BrandedLoader label="Loading billing" />
        <BillingDebugPanel
          accountId={state.accountId}
          contextLabel="Overview"
          summary={state.billingSummary}
          isSummaryLoading
          extra={{ ordersPending: true }}
        />
      </>
    );
  }

  return (
    <div className="grid gap-2 text-center" role="status">
      <TypographyBodySmall>Redirecting...</TypographyBodySmall>
      <BillingDebugPanel
        accountId={state.accountId}
        contextLabel="Overview"
        summary={state.billingSummary}
        isSummaryLoading={false}
        extra={{ gateway: state.gatewayReason, gatewaySource: "orders" }}
      />
    </div>
  );
}
