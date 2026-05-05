"use client";

import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { BrandedLoader } from "@/components/ui/branded-loader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import {
  isAccountBillingGatewayRedirect,
  useAccountBilling,
} from "@/lib/api/hooks/account/useAccountBilling";
import {
  isAccountBillingOrdersGatewayRedirect,
  useAccountBillingOrders,
} from "@/lib/api/hooks/account/useAccountBillingOrders";
import { queryKeys } from "@/lib/api/query/query-keys";
import { AUTH_ERROR_MESSAGES } from "@/lib/auth/auth-errors";
import { isValidAccountIdSegment } from "@/lib/config/account-routes";
import {
  SELECT_ORG_GATEWAY_REASON,
  selectOrganisationUrlWithReason,
} from "@/lib/config/gateway-reasons";

import {
  readBillingCheckoutReturnOutcome,
  stripBillingCheckoutReturnParams,
  type BillingCheckoutReturnOutcome,
} from "./billing-checkout-return";
import { BillingCreateSeasonPassCard } from "./billing-create-season-pass-card";
import { BillingDebugPanel } from "./billing-debug-panel";
import { BillingEndingBanner } from "./billing-ending-banner";
import { BillingInvoiceRequest, shouldShowInvoiceRequest } from "./billing-invoice-request";
import { shouldShowPlanCheckout } from "./billing-plan-checkout";
import { deriveBillingUiMode, trialDaysRemaining, type BillingUiMode } from "./billing-state";
import { labelForAvailableAction } from "./billing-summary-labels";
import { BillingTrialStartCard } from "./billing-trial-start-card";

import type {
  AccountBillingOrderDto,
  AccountBillingOrderHistoryDto,
  AccountBillingSummaryV1,
  BillingTrialSummaryV1,
} from "@/types/api/account";

function formatMoney(amount: number | null, currency: string | null): string {
  if (amount == null) return "—";
  const c = currency?.trim() || "AUD";
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency: c }).format(amount);
  } catch {
    return `${amount} ${c}`;
  }
}

function formatDateLabel(value: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString();
}

function hasMeaningfulActiveOrder(order: AccountBillingOrderDto | null | undefined): boolean {
  if (!order) return false;
  return Boolean(
    order.Name?.trim() ||
    order.startOrderAt ||
    order.total != null ||
    order.stripe_status?.trim() ||
    order.payment_status?.trim() ||
    order.hosted_invoice_url?.trim(),
  );
}

/** Stable match key for billing-summary `activeOrder` rows. */
function normalizeSummaryOrderKey(order: AccountBillingOrderDto): string {
  const raw = order.id ?? order.invoice_number ?? order.stripe_subscription_id ?? order.Name ?? "";
  return String(raw).trim().toLowerCase();
}

function normalizeHistoryOrderKey(order: AccountBillingOrderHistoryDto): string {
  const raw = order.id ?? order.stripeSubscriptionId ?? order.name ?? "";
  return String(raw).trim().toLowerCase();
}

function parseHistoryOrderTotal(total: string | null): number | null {
  if (total == null || String(total).trim() === "") return null;
  const n = Number.parseFloat(String(total));
  return Number.isFinite(n) ? n : null;
}

function getHistoryOrderStatus(order: AccountBillingOrderHistoryDto): string {
  return order.stripeStatus ?? order.paymentStatus ?? order.checkoutStatus ?? "—";
}

function historyRowMatchesSummaryActiveOrder(
  row: AccountBillingOrderHistoryDto,
  active: AccountBillingOrderDto | null,
): boolean {
  if (!active) return false;
  const aSub = active.stripe_subscription_id?.trim().toLowerCase() ?? "";
  const rSub = row.stripeSubscriptionId?.trim().toLowerCase() ?? "";
  if (aSub && rSub && aSub === rSub) return true;
  if (active.id != null && row.id === active.id) return true;
  const ak = normalizeSummaryOrderKey(active);
  const rk = normalizeHistoryOrderKey(row);
  return ak !== "" && rk !== "" && ak === rk;
}

function OrdersTableSection({
  orders,
  activeOrder,
  loadError,
  onRetry,
}: {
  orders: AccountBillingOrderHistoryDto[];
  activeOrder: AccountBillingOrderDto | null;
  loadError: Error | null;
  onRetry: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-brand text-lg">Orders</CardTitle>
        <CardDescription>Current and previous annual billing orders.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {loadError ? (
          <ErrorState
            title="Could not load orders"
            description={loadError.message || AUTH_ERROR_MESSAGES.network}
            onRetry={onRetry}
          />
        ) : orders.length === 0 ? (
          <p className="text-muted-foreground text-sm" role="status">
            No orders available yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-border border-b text-left">
                  <th className="px-3 py-2 font-medium">Type</th>
                  <th className="px-3 py-2 font-medium">Name</th>
                  <th className="px-3 py-2 font-medium">Started</th>
                  <th className="px-3 py-2 font-medium">Total</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, idx) => (
                  <tr
                    key={`${normalizeHistoryOrderKey(order) || "order"}-${idx}`}
                    className="border-border/70 border-b last:border-b-0"
                  >
                    <td className="px-3 py-2">
                      {historyRowMatchesSummaryActiveOrder(order, activeOrder)
                        ? "Current"
                        : "Previous"}
                    </td>
                    <td className="px-3 py-2">{order.name ?? "—"}</td>
                    <td className="px-3 py-2">{formatDateLabel(order.startAt ?? null)}</td>
                    <td className="px-3 py-2 tabular-nums">
                      {formatMoney(parseHistoryOrderTotal(order.total), order.currency ?? null)}
                    </td>
                    <td className="px-3 py-2">{getHistoryOrderStatus(order)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CheckoutReturnBanner({ outcome }: { outcome: BillingCheckoutReturnOutcome }) {
  return (
    <div
      className="bg-muted/50 border-border mb-4 rounded-lg border px-4 py-3 text-sm"
      role="status"
    >
      {outcome === "cancelled"
        ? "Checkout was cancelled. Refreshing billing status…"
        : "Returning from checkout. Refreshing billing status…"}
    </div>
  );
}

function TrialPanel({
  trial,
  uiMode,
  emphasize,
}: {
  trial: BillingTrialSummaryV1 | null | undefined;
  uiMode: BillingUiMode;
  emphasize: boolean;
}) {
  const daysRemaining =
    uiMode === "active_trial" ? trialDaysRemaining(trial?.endDate ?? null) : null;
  const tierLabel = trial?.subscriptionTier?.Name ?? trial?.subscriptionTier?.Title ?? null;

  return (
    <Card
      className={
        emphasize ? undefined : "border-muted/60 bg-muted/10 supports-backdrop-filter:bg-muted/10"
      }
    >
      <CardHeader className={emphasize ? undefined : "pb-3"}>
        <CardTitle
          className={
            emphasize ? "font-brand text-lg" : "font-brand text-muted-foreground text-base"
          }
        >
          Trial
        </CardTitle>
        <CardDescription className={emphasize ? undefined : "text-xs"}>
          {!emphasize
            ? "Previous trial window (shown for reference)."
            : uiMode === "free_trial_available"
              ? "You can begin the evaluation above. Dates appear after the trial is active."
              : "Trial eligibility and dates for this account."}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-muted-foreground text-sm">
        {trial ? (
          <>
            {tierLabel ? <p className="text-foreground mb-2 font-medium">{tierLabel}</p> : null}
            <p>
              {formatDateLabel(trial.startDate ?? null)} — {formatDateLabel(trial.endDate ?? null)}
            </p>
            {daysRemaining != null ? (
              <p className="mt-2 text-xs">
                {daysRemaining === 0
                  ? "Last day of trial."
                  : `About ${daysRemaining} day${daysRemaining === 1 ? "" : "s"} remaining.`}
              </p>
            ) : null}
            {trial.eligible !== undefined ? (
              <p className="mt-1 text-xs">Eligible: {trial.eligible ? "Yes" : "No"}</p>
            ) : null}
            <Badge className="mt-2" variant={uiMode === "active_trial" ? "secondary" : "outline"}>
              {uiMode === "active_trial"
                ? "Trial active"
                : uiMode === "free_trial_available"
                  ? "Trial not started"
                  : "Trial inactive"}
            </Badge>
          </>
        ) : (
          <p role="status">No trial for this account.</p>
        )}
      </CardContent>
    </Card>
  );
}

function BillingSections({
  data,
  billingUiMode,
  orders,
  ordersLoadError,
  onRetryOrders,
}: {
  data: AccountBillingSummaryV1;
  billingUiMode: BillingUiMode;
  orders: AccountBillingOrderHistoryDto[];
  ordersLoadError: Error | null;
  onRetryOrders: () => void;
}) {
  const { currentPlan, trial, activeOrder, availableActions } = data;

  const uiMode = billingUiMode;

  const showTrialBelowPaidOrder = uiMode === "paid_active" && Boolean(activeOrder);
  const meaningfulActiveOrder = hasMeaningfulActiveOrder(activeOrder) ? activeOrder : null;

  const labelledActions = useMemo(() => {
    const actionsSafe = availableActions ?? {};
    const out: { key: string; label: string }[] = [];
    for (const [key, v] of Object.entries(actionsSafe)) {
      if (v !== true) {
        continue;
      }
      const label = labelForAvailableAction(key);
      if (label) {
        out.push({ key, label });
      }
    }
    return out;
  }, [availableActions]);

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-2">
        {uiMode === "paid_active" ? (
          <Card className="overflow-hidden md:col-span-2">
            <div className="from-primary via-brand-secondary to-brand-accent h-2 w-full bg-linear-to-r" />
            <CardHeader>
              <CardTitle className="font-brand text-lg">Billing status</CardTitle>
              <CardDescription>Lifecycle and access from the billing service.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm">
              {labelledActions.length > 0 ? (
                <div className="text-muted-foreground">
                  <p className="text-foreground mb-1 font-medium">Available actions</p>
                  <ul className="list-inside list-disc text-xs">
                    {labelledActions.map(({ key, label }) => (
                      <li key={key}>{label}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </CardContent>
          </Card>
        ) : null}

        {currentPlan ? (
          <Card>
            <CardHeader>
              <CardTitle className="font-brand text-lg">Current plan</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm">
              <p className="text-foreground font-medium">
                {currentPlan.Name ?? String(currentPlan.id)}
              </p>
              {currentPlan.Title ? <p>{currentPlan.Title}</p> : null}
              {currentPlan.description ? (
                <p className="mt-2 leading-relaxed">{currentPlan.description}</p>
              ) : null}
              <p className="mt-2 tabular-nums">
                {formatMoney(currentPlan.price ?? null, currentPlan.currency ?? null)}
              </p>
            </CardContent>
          </Card>
        ) : null}
      </div>

      {showTrialBelowPaidOrder && meaningfulActiveOrder ? (
        <>
          <OrdersTableSection
            orders={orders}
            activeOrder={meaningfulActiveOrder}
            loadError={ordersLoadError}
            onRetry={onRetryOrders}
          />
          <TrialPanel trial={trial} uiMode={uiMode} emphasize={false} />
        </>
      ) : (
        <>
          {uiMode !== "free_trial_available" && uiMode !== "active_trial" ? (
            <div className="grid gap-4 md:grid-cols-2">
              <TrialPanel trial={trial} uiMode={uiMode} emphasize />
            </div>
          ) : null}

          <OrdersTableSection
            orders={orders}
            activeOrder={meaningfulActiveOrder}
            loadError={ordersLoadError}
            onRetry={onRetryOrders}
          />
        </>
      )}
    </div>
  );
}

function showCreateSubscriptionCta(
  mode: BillingUiMode,
  availableActions: Partial<Record<string, boolean>> | undefined,
): boolean {
  if (mode === "paid_active" || mode === "free_trial_available" || mode === "payment_pending") {
    return false;
  }
  return shouldShowPlanCheckout(availableActions) || shouldShowInvoiceRequest(availableActions);
}

export function BillingContent({ accountId }: { accountId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const redirectingRef = useRef(false);
  const stripeReturnSignatureRef = useRef<string | null>(null);
  const segmentOk = isValidAccountIdSegment(accountId);
  const q = useAccountBilling(accountId, { enabled: segmentOk });
  const billingReady = Boolean(q.isSuccess && q.data && !isAccountBillingGatewayRedirect(q.data));
  const ordersQ = useAccountBillingOrders(accountId, { enabled: segmentOk && billingReady });
  const [checkoutReturnNotice, setCheckoutReturnNotice] =
    useState<BillingCheckoutReturnOutcome | null>(null);

  useEffect(() => {
    redirectingRef.current = false;
    stripeReturnSignatureRef.current = null;
  }, [accountId]);

  useEffect(() => {
    if (!segmentOk) return;
    const outcome = readBillingCheckoutReturnOutcome(searchParams);
    if (outcome == null) return;

    const signature = searchParams.toString();
    if (stripeReturnSignatureRef.current === signature) return;
    stripeReturnSignatureRef.current = signature;

    setCheckoutReturnNotice(outcome);

    const sp = new URLSearchParams(searchParams.toString());
    stripBillingCheckoutReturnParams(sp);
    const qs = sp.toString();
    const path = `/o/${encodeURIComponent(accountId)}/billing${qs ? `?${qs}` : ""}`;

    void queryClient.invalidateQueries({ queryKey: queryKeys.account.billing(accountId) });
    void queryClient.invalidateQueries({
      queryKey: queryKeys.account.billingAvailableTiers(accountId),
    });
    void queryClient.invalidateQueries({
      queryKey: queryKeys.account.billingInvoiceRequests(accountId),
    });
    void queryClient.invalidateQueries({ queryKey: queryKeys.account.billingOrders(accountId) });
    router.replace(path);
  }, [segmentOk, accountId, queryClient, router, searchParams]);

  useEffect(() => {
    if (!checkoutReturnNotice) return;
    if (!q.isFetching && !ordersQ.isFetching) {
      setCheckoutReturnNotice(null);
    }
  }, [checkoutReturnNotice, q.isFetching, ordersQ.isFetching]);

  useEffect(() => {
    if (segmentOk || redirectingRef.current) return;
    redirectingRef.current = true;
    router.replace(selectOrganisationUrlWithReason(SELECT_ORG_GATEWAY_REASON.invalidOrg));
  }, [segmentOk, router]);

  useEffect(() => {
    if (!segmentOk) return;
    if (!q.isSuccess || !q.data || redirectingRef.current) return;
    if (!isAccountBillingGatewayRedirect(q.data)) return;
    redirectingRef.current = true;
    void queryClient.removeQueries({ queryKey: queryKeys.account.billing(accountId) });
    router.replace(selectOrganisationUrlWithReason(q.data.reason));
  }, [q.isSuccess, q.data, accountId, queryClient, router, segmentOk]);

  useEffect(() => {
    if (!segmentOk) return;
    if (!ordersQ.isSuccess || !ordersQ.data || redirectingRef.current) return;
    if (!isAccountBillingOrdersGatewayRedirect(ordersQ.data)) return;
    redirectingRef.current = true;
    void queryClient.removeQueries({ queryKey: queryKeys.account.billingOrders(accountId) });
    router.replace(selectOrganisationUrlWithReason(ordersQ.data.reason));
  }, [ordersQ.isSuccess, ordersQ.data, accountId, queryClient, router, segmentOk]);

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
  const billingUiMode = deriveBillingUiMode(billingSummary);
  const historyHref = `/o/${encodeURIComponent(accountId)}/billing/history`;
  const createHref = `/o/${encodeURIComponent(accountId)}/billing/create`;

  return (
    <div className="grid gap-6">
      {checkoutReturnNotice ? <CheckoutReturnBanner outcome={checkoutReturnNotice} /> : null}

      {(billingUiMode === "paid_active" || billingUiMode === "active_trial") &&
      billingSummary.activeOrder?.cancel_at_period_end === true ? (
        <BillingEndingBanner order={billingSummary.activeOrder} />
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        {(billingUiMode === "paid_active" ||
          billingUiMode === "active_trial" ||
          billingUiMode === "payment_pending") && (
          <Button type="button" variant="outline" size="sm" asChild>
            <Link href={historyHref}>View billing history</Link>
          </Button>
        )}
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

      {billingUiMode === "payment_pending" &&
      shouldShowInvoiceRequest(billingSummary.availableActions) ? (
        <BillingInvoiceRequest
          accountId={accountId}
          enabled={segmentOk}
          {...(billingSummary.availableActions !== undefined
            ? { availableActions: billingSummary.availableActions }
            : {})}
        />
      ) : null}

      <BillingDebugPanel
        accountId={accountId}
        contextLabel="Overview"
        summary={billingSummary}
        isSummaryLoading={false}
      />
    </div>
  );
}
