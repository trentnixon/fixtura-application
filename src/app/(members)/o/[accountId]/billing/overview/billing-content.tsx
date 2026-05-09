"use client";

import Link from "next/link";

import { BrandedLoader } from "@/components/ui/branded-loader";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import {
  isAccountBillingGatewayRedirect,
  useAccountBilling,
} from "@/lib/api/hooks/account/useAccountBilling";
import {
  isAccountBillingOrdersGatewayRedirect,
  useAccountBillingOrders,
} from "@/lib/api/hooks/account/useAccountBillingOrders";
import { AUTH_ERROR_MESSAGES } from "@/lib/auth/auth-errors";
import { isValidAccountIdSegment } from "@/lib/config/account-routes";

import { CheckoutReturnBanner } from "../_components/banners/CheckoutReturnBanner";
import { BillingSections } from "../_components/overview/BillingSections";
import { useBillingOverviewLifecycle } from "../_hooks/useBillingOverviewLifecycle";
import { showCreateSubscriptionCta } from "../_utils/showCreateSubscriptionCta";
import { BillingEndingBanner } from "../banners/billing-ending-banner";
import { BillingPaymentPendingBanner } from "../banners/billing-payment-pending-banner";
import { deriveBillingUiMode } from "../core/billing-state";
import { BillingDebugPanel } from "../debug/billing-debug-panel";
import { BillingCreateSeasonPassCard } from "../season-pass/billing-create-season-pass-card";
import {
  BillingTrialDetailsDialog,
  billingTrialDetailsTriggerState,
} from "../trial/billing-trial-details-dialog";
import { BillingTrialStartCard } from "../trial/billing-trial-start-card";

export function BillingContent({ accountId }: { accountId: string }) {
  const segmentOk = isValidAccountIdSegment(accountId);
  const q = useAccountBilling(accountId, { enabled: segmentOk });
  const billingReady = Boolean(q.isSuccess && q.data && !isAccountBillingGatewayRedirect(q.data));
  const ordersQ = useAccountBillingOrders(accountId, { enabled: segmentOk && billingReady });

  const { checkoutReturnNotice } = useBillingOverviewLifecycle({
    accountId,
    segmentOk,
    billingQuery: q,
    ordersQuery: ordersQ,
  });

  if (!segmentOk) {
    return (
      <div className="text-muted-foreground grid gap-2 text-center text-sm" role="status">
        <p>Redirecting…</p>
        <BillingDebugPanel
          accountId={accountId}
          contextLabel="Overview"
          summary={null}
          isSummaryLoading={false}
          extra={{ validAccountSegment: false }}
        />
      </div>
    );
  }

  if (q.isPending) {
    return (
      <>
        {checkoutReturnNotice ? <CheckoutReturnBanner outcome={checkoutReturnNotice} /> : null}
        <BrandedLoader label="Loading billing" />
        <BillingDebugPanel
          accountId={accountId}
          contextLabel="Overview"
          summary={null}
          isSummaryLoading
        />
      </>
    );
  }

  if (q.isSuccess && q.data && isAccountBillingGatewayRedirect(q.data)) {
    return (
      <div className="text-muted-foreground grid gap-2 text-center text-sm" role="status">
        <p>Redirecting…</p>
        <BillingDebugPanel
          accountId={accountId}
          contextLabel="Overview"
          summary={null}
          isSummaryLoading={false}
          extra={{ gateway: q.data.reason }}
        />
      </div>
    );
  }

  if (q.isError) {
    const err = q.error;
    return (
      <>
        {checkoutReturnNotice ? <CheckoutReturnBanner outcome={checkoutReturnNotice} /> : null}
        <ErrorState
          title="Could not load billing"
          description={err instanceof Error ? err.message : AUTH_ERROR_MESSAGES.network}
          onRetry={() => void q.refetch()}
        />
        <BillingDebugPanel
          accountId={accountId}
          contextLabel="Overview"
          summary={null}
          isSummaryLoading={false}
          summaryError={err instanceof Error ? err.message : AUTH_ERROR_MESSAGES.network}
        />
      </>
    );
  }

  if (!q.isSuccess || !q.data || isAccountBillingGatewayRedirect(q.data)) {
    return (
      <>
        <BillingDebugPanel
          accountId={accountId}
          contextLabel="Overview"
          summary={null}
          isSummaryLoading={false}
          extra={{ state: "unexpected_empty" }}
        />
      </>
    );
  }

  if (ordersQ.isPending) {
    return (
      <>
        {checkoutReturnNotice ? <CheckoutReturnBanner outcome={checkoutReturnNotice} /> : null}
        <BrandedLoader label="Loading billing" />
        <BillingDebugPanel
          accountId={accountId}
          contextLabel="Overview"
          summary={q.data.data}
          isSummaryLoading
          extra={{ ordersPending: true }}
        />
      </>
    );
  }

  if (ordersQ.isSuccess && ordersQ.data && isAccountBillingOrdersGatewayRedirect(ordersQ.data)) {
    return (
      <div className="text-muted-foreground grid gap-2 text-center text-sm" role="status">
        <p>Redirecting…</p>
        <BillingDebugPanel
          accountId={accountId}
          contextLabel="Overview"
          summary={q.data.data}
          isSummaryLoading={false}
          extra={{ gateway: ordersQ.data.reason, gatewaySource: "orders" }}
        />
      </div>
    );
  }

  const billingSummary = q.data.data;
  const ordersPayload =
    ordersQ.isSuccess && ordersQ.data && !isAccountBillingOrdersGatewayRedirect(ordersQ.data)
      ? ordersQ.data.orders
      : [];
  const ordersLoadError = ordersQ.isError
    ? ordersQ.error instanceof Error
      ? ordersQ.error
      : new Error(String(ordersQ.error))
    : null;
  const billingUiMode = deriveBillingUiMode(billingSummary, { orders: ordersPayload });
  const trialDetailsTrigger = billingTrialDetailsTriggerState(billingSummary, billingUiMode, {
    orders: ordersPayload,
  });
  const historyHref = `/o/${encodeURIComponent(accountId)}/billing/history`;
  const createHref = `/o/${encodeURIComponent(accountId)}/billing/create`;

  return (
    <div className="grid gap-6">
      {checkoutReturnNotice ? <CheckoutReturnBanner outcome={checkoutReturnNotice} /> : null}

      {(billingUiMode === "paid_active" || billingUiMode === "active_trial") &&
      billingSummary.activeOrder?.cancel_at_period_end === true ? (
        <BillingEndingBanner order={billingSummary.activeOrder} />
      ) : null}

      {billingUiMode === "payment_pending" ? (
        <BillingPaymentPendingBanner
          accountId={accountId}
          summary={billingSummary}
          orders={ordersPayload}
        />
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        {(billingUiMode === "paid_active" ||
          billingUiMode === "active_trial" ||
          billingUiMode === "payment_pending") && (
          <Button type="button" variant="outline" size="sm" asChild>
            <Link href={historyHref}>View billing history</Link>
          </Button>
        )}
        {trialDetailsTrigger ? (
          <BillingTrialDetailsDialog
            trial={billingSummary.trial}
            uiMode={billingUiMode}
            emphasize={trialDetailsTrigger.emphasize}
          />
        ) : null}
        {showCreateSubscriptionCta(billingUiMode, billingSummary.availableActions) ? (
          <Button type="button" size="sm" asChild>
            <Link href={createHref}>
              {billingUiMode === "active_trial"
                ? "Subscribe or request invoice"
                : "Create subscription"}
            </Link>
          </Button>
        ) : null}
      </div>

      {billingUiMode === "access_denied" || billingUiMode === "unknown" ? (
        <Card>
          <CardHeader>
            <CardTitle className="font-brand text-lg">Billing access</CardTitle>
            <CardDescription>
              We could not place this account in a standard billing state. If you expected full
              access, contact support with your organisation details.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      {billingUiMode === "free_trial_available" ? (
        <BillingTrialStartCard
          accountId={accountId}
          enabled={segmentOk}
          {...(billingSummary.availableActions !== undefined
            ? { availableActions: billingSummary.availableActions }
            : {})}
        />
      ) : null}

      {billingUiMode === "trial_expired" || billingUiMode === "no_billing" ? (
        <BillingCreateSeasonPassCard accountId={accountId} />
      ) : null}

      <BillingSections
        data={billingSummary}
        billingUiMode={billingUiMode}
        orders={ordersPayload}
        ordersLoadError={ordersLoadError}
        onRetryOrders={() => void ordersQ.refetch()}
      />

      <BillingDebugPanel
        accountId={accountId}
        contextLabel="Overview"
        summary={billingSummary}
        orders={ordersPayload}
        isSummaryLoading={false}
      />
    </div>
  );
}
