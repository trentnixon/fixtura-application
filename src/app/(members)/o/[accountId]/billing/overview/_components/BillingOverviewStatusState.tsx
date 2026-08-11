import { TypographyBodySmall } from "@/components/typography";
import { BrandedLoader } from "@/components/ui/branded-loader";
import { ErrorState } from "@/components/ui/error-state";

import { CheckoutReturnBanner } from "../../_components/banners/CheckoutReturnBanner";

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
      </>
    );
  }

  if (state.kind === "billing-gateway-redirect") {
    return (
      <div className="grid gap-2 text-center" role="status">
        <TypographyBodySmall>Redirecting...</TypographyBodySmall>
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
      </>
    );
  }

  if (state.kind === "unexpected-empty") {
    return (
      <ErrorState
        title="Could not load billing"
        description="We received an unexpected response. Try again or contact support if this continues."
        {...(onRetryBilling ? { onRetry: onRetryBilling } : {})}
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
      </>
    );
  }

  return (
    <div className="grid gap-2 text-center" role="status">
      <TypographyBodySmall>Redirecting...</TypographyBodySmall>
    </div>
  );
}
