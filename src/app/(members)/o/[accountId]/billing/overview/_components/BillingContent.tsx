"use client";

import { TypographyCardDescription, TypographyCardTitle } from "@/components/typography";
import { Card, CardHeader } from "@/components/ui/card";

import { BillingOverviewActions } from "./BillingOverviewActions";
import { BillingOverviewStatusState } from "./BillingOverviewStatusState";
import { BillingEndingBanner } from "../../_components/banners/BillingEndingBanner";
import { BillingPaymentPendingBanner } from "../../_components/banners/BillingPaymentPendingBanner";
import { CheckoutReturnBanner } from "../../_components/banners/CheckoutReturnBanner";
import { BillingProductStateBadge } from "../../_components/billing-product-state-badge";
import { BillingSections } from "../../_components/overview/BillingSections";
import { BillingDebugPanel } from "../../debug/billing-debug-panel";
import { BillingCreateSeasonPassCard } from "../../season-pass/billing-create-season-pass-card";
import { BillingTrialStartCard } from "../../trial/billing-trial-start-card";
import { useBillingOverviewContentState } from "../_hooks/useBillingOverviewContentState";

export function BillingContent({ accountId }: { accountId: string }) {
  const state = useBillingOverviewContentState(accountId);

  if (state.kind !== "ready") {
    return <BillingOverviewStatusState state={state} />;
  }

  return (
    <div className="grid gap-6">
      {state.checkoutReturnNotice ? (
        <CheckoutReturnBanner outcome={state.checkoutReturnNotice} />
      ) : null}

      {(state.billingUiMode === "paid_active" || state.billingUiMode === "active_trial") &&
      state.billingSummary.activeOrder?.cancel_at_period_end === true ? (
        <BillingEndingBanner order={state.billingSummary.activeOrder} />
      ) : null}

      {state.billingUiMode === "payment_pending" ? (
        <BillingPaymentPendingBanner
          accountId={accountId}
          summary={state.billingSummary}
          orders={state.ordersPayload}
        />
      ) : null}

      <div
        className="border-border bg-muted/30 flex flex-wrap items-center justify-between gap-3 rounded-lg border px-4 py-3"
        role="region"
        aria-label="Billing status and actions"
      >
        <BillingProductStateBadge accountId={accountId} />
        <BillingOverviewActions
          billingUiMode={state.billingUiMode}
          billingSummary={state.billingSummary}
          trialDetailsTrigger={state.trialDetailsTrigger}
          historyHref={state.historyHref}
          createHref={state.createHref}
        />
      </div>

      {state.billingUiMode === "access_denied" || state.billingUiMode === "unknown" ? (
        <Card>
          <CardHeader>
            <TypographyCardTitle className="font-brand">Billing access</TypographyCardTitle>
            <TypographyCardDescription>
              We could not place this account in a standard billing state. If you expected full
              access, contact support with your organisation details.
            </TypographyCardDescription>
          </CardHeader>
        </Card>
      ) : null}

      {state.billingUiMode === "free_trial_available" ? (
        <BillingTrialStartCard
          accountId={accountId}
          enabled={state.segmentOk}
          {...(state.availableActions !== undefined
            ? { availableActions: state.availableActions }
            : {})}
        />
      ) : null}

      {state.billingUiMode === "trial_expired" || state.billingUiMode === "no_billing" ? (
        <BillingCreateSeasonPassCard accountId={accountId} />
      ) : null}

      <BillingSections
        data={state.billingSummary}
        billingUiMode={state.billingUiMode}
        orders={state.ordersPayload}
        ordersLoadError={state.ordersLoadError}
        onRetryOrders={state.refetchOrders}
      />

      <BillingDebugPanel
        accountId={accountId}
        contextLabel="Overview"
        summary={state.billingSummary}
        orders={state.ordersPayload}
        isSummaryLoading={false}
      />
    </div>
  );
}
