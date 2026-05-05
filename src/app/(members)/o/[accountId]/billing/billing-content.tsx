"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { BrandedLoader } from "@/components/ui/branded-loader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import {
  isAccountBillingGatewayRedirect,
  useAccountBilling,
} from "@/lib/api/hooks/account/useAccountBilling";
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
import { BillingInvoiceRequest, shouldShowInvoiceRequest } from "./billing-invoice-request";
import { BillingPlanCheckout } from "./billing-plan-checkout";
import {
  accessStatusBadgeVariant,
  labelForAccessStatus,
  labelForAvailableAction,
  labelForBillingStatus,
} from "./billing-summary-labels";

import type { AccountBillingOrderDto, AccountBillingSummaryV1 } from "@/types/api/account";

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

function ActiveOrderCompact({ order }: { order: AccountBillingOrderDto }) {
  const status = order.stripe_status ?? order.payment_status ?? "—";
  return (
    <dl className="text-muted-foreground grid gap-2 text-sm">
      <div className="flex flex-wrap justify-between gap-x-4 gap-y-1">
        <dt className="text-foreground font-medium">Name</dt>
        <dd className="text-right">{order.Name ?? "—"}</dd>
      </div>
      <div className="flex flex-wrap justify-between gap-x-4 gap-y-1">
        <dt className="text-foreground font-medium">Started</dt>
        <dd className="text-right">{formatDateLabel(order.startOrderAt ?? null)}</dd>
      </div>
      <div className="flex flex-wrap justify-between gap-x-4 gap-y-1">
        <dt className="text-foreground font-medium">Total</dt>
        <dd className="text-right tabular-nums">{formatMoney(order.total, order.currency)}</dd>
      </div>
      <div className="flex flex-wrap justify-between gap-x-4 gap-y-1">
        <dt className="text-foreground font-medium">Status</dt>
        <dd className="text-right">
          <span className="text-muted-foreground">{status}</span>
        </dd>
      </div>
      {order.hosted_invoice_url ? (
        <div className="pt-1">
          <a
            href={order.hosted_invoice_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary text-sm underline-offset-4 hover:underline"
          >
            View hosted invoice
          </a>
        </div>
      ) : null}
    </dl>
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

function BillingSections({ data }: { data: AccountBillingSummaryV1 }) {
  const {
    billingStatus,
    accessStatus,
    currentPlan,
    trial,
    activeOrder,
    latestInvoiceRequest,
    availableActions,
  } = data;

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
        <Card>
          <CardHeader>
            <CardTitle className="font-brand text-lg">Billing status</CardTitle>
            <CardDescription>Lifecycle and access from the billing service.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium">{labelForBillingStatus(billingStatus)}</span>
              <Badge variant={accessStatusBadgeVariant(accessStatus)}>
                {labelForAccessStatus(accessStatus)}
              </Badge>
            </div>
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
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="font-brand text-lg">Current plan</CardTitle>
              <CardDescription>No plan on file.</CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-brand text-lg">Trial</CardTitle>
            <CardDescription>Trial eligibility and dates for this account.</CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            {trial ? (
              <>
                <p>
                  {formatDateLabel(trial.startDate ?? null)} —{" "}
                  {formatDateLabel(trial.endDate ?? null)}
                </p>
                {trial.eligible !== undefined ? (
                  <p className="mt-1 text-xs">Eligible: {trial.eligible ? "Yes" : "No"}</p>
                ) : null}
                <Badge className="mt-2" variant={trial.isActive ? "secondary" : "outline"}>
                  {trial.isActive ? "Trial active" : "Trial inactive"}
                </Badge>
              </>
            ) : (
              <p role="status">No trial for this account.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {activeOrder ? (
        <Card>
          <CardHeader>
            <CardTitle className="font-brand text-lg">Active order</CardTitle>
            <CardDescription>
              Current paid entitlement order linked to this account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ActiveOrderCompact order={activeOrder} />
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="font-brand text-lg">Latest invoice request</CardTitle>
          <CardDescription>Most recent pay-by-invoice request (if any).</CardDescription>
        </CardHeader>
        <CardContent className="text-muted-foreground text-sm">
          {latestInvoiceRequest ? (
            <dl className="grid gap-1">
              <div className="flex flex-wrap gap-x-2">
                <dt className="font-medium">Request ID</dt>
                <dd className="font-mono text-xs">
                  {latestInvoiceRequest.invoiceRequestId ?? latestInvoiceRequest.id ?? "—"}
                </dd>
              </div>
              <div className="flex flex-wrap gap-x-2">
                <dt className="font-medium">Status</dt>
                <dd>{latestInvoiceRequest.status ?? "—"}</dd>
              </div>
              <div className="flex flex-wrap gap-x-2">
                <dt className="font-medium">Submitted</dt>
                <dd>{formatDateLabel(latestInvoiceRequest.submittedAt ?? null)}</dd>
              </div>
              {latestInvoiceRequest.requestedStartDate ? (
                <div className="flex flex-wrap gap-x-2">
                  <dt className="font-medium">Requested start</dt>
                  <dd>{formatDateLabel(latestInvoiceRequest.requestedStartDate)}</dd>
                </div>
              ) : null}
              {latestInvoiceRequest.subscriptionTierId ? (
                <div className="flex flex-wrap gap-x-2">
                  <dt className="font-medium">Tier</dt>
                  <dd>{latestInvoiceRequest.subscriptionTierId}</dd>
                </div>
              ) : null}
              {latestInvoiceRequest.message ? (
                <div className="flex flex-wrap gap-x-2">
                  <dt className="font-medium">Message</dt>
                  <dd>{latestInvoiceRequest.message}</dd>
                </div>
              ) : null}
            </dl>
          ) : (
            <p className="text-muted-foreground" role="status">
              No invoice requests yet.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function BillingContent({ accountId }: { accountId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const redirectingRef = useRef(false);
  const stripeReturnSignatureRef = useRef<string | null>(null);
  const segmentOk = isValidAccountIdSegment(accountId);
  const q = useAccountBilling(accountId, { enabled: segmentOk });
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
    router.replace(path);
  }, [segmentOk, accountId, queryClient, router, searchParams]);

  useEffect(() => {
    if (!checkoutReturnNotice) return;
    if (!q.isFetching) {
      setCheckoutReturnNotice(null);
    }
  }, [checkoutReturnNotice, q.isFetching]);

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

  if (!segmentOk) {
    return (
      <div className="text-muted-foreground grid gap-2 text-center text-sm" role="status">
        <p>Redirecting…</p>
      </div>
    );
  }

  if (q.isPending) {
    return (
      <>
        {checkoutReturnNotice ? <CheckoutReturnBanner outcome={checkoutReturnNotice} /> : null}
        <BrandedLoader label="Loading billing" />
      </>
    );
  }

  if (q.isSuccess && q.data && isAccountBillingGatewayRedirect(q.data)) {
    return (
      <div className="text-muted-foreground grid gap-2 text-center text-sm" role="status">
        <p>Redirecting…</p>
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
      </>
    );
  }

  if (!q.isSuccess || !q.data || isAccountBillingGatewayRedirect(q.data)) {
    return null;
  }

  return (
    <>
      {checkoutReturnNotice ? <CheckoutReturnBanner outcome={checkoutReturnNotice} /> : null}
      <BillingSections data={q.data.data} />
      <BillingPlanCheckout
        accountId={accountId}
        enabled={segmentOk}
        {...(q.data.data.availableActions !== undefined
          ? { availableActions: q.data.data.availableActions }
          : {})}
      />
      {shouldShowInvoiceRequest(q.data.data.availableActions) ? (
        <BillingInvoiceRequest
          accountId={accountId}
          enabled={segmentOk}
          {...(q.data.data.availableActions !== undefined
            ? { availableActions: q.data.data.availableActions }
            : {})}
        />
      ) : null}
    </>
  );
}
