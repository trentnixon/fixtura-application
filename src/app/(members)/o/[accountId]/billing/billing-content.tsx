"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

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

import type { AccountBillingOrderDto, AccountBillingPayload } from "@/types/api/account";

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

function OrderRow({ order }: { order: AccountBillingOrderDto }) {
  return (
    <tr className="border-border border-b last:border-0">
      <td className="text-muted-foreground py-2 pr-3 align-top text-xs">
        {formatDateLabel(order.createdAt)}
      </td>
      <td className="py-2 pr-3 align-top text-sm font-medium">{order.Name ?? "—"}</td>
      <td className="py-2 pr-3 align-top text-sm">{formatMoney(order.total, order.currency)}</td>
      <td className="py-2 pr-3 align-top text-sm">
        <span className="text-muted-foreground">
          {order.stripe_status ?? order.payment_status ?? "—"}
        </span>
      </td>
      <td className="py-2 align-top text-sm">
        {order.hosted_invoice_url ? (
          <a
            href={order.hosted_invoice_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline-offset-4 hover:underline"
          >
            Invoice
          </a>
        ) : (
          "—"
        )}
      </td>
    </tr>
  );
}

function BillingSections({ data }: { data: AccountBillingPayload }) {
  const { summary, financialSummary, meta, orders, customers, trial, subscriptionTier } = data;
  const listTruncated = meta.ordersTotal > meta.ordersReturned;

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-brand text-lg">Current subscription</CardTitle>
            <CardDescription>Derived from active orders and payment state.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium">{summary.status}</span>
              {summary.isActive !== undefined ? (
                <Badge variant={summary.isActive ? "secondary" : "outline"}>
                  {summary.isActive ? "Active" : "Inactive"}
                </Badge>
              ) : null}
            </div>
            <dl className="text-muted-foreground grid gap-1">
              <div className="flex flex-wrap gap-x-2">
                <dt className="font-medium">Tier</dt>
                <dd>{summary.tier ?? "—"}</dd>
              </div>
              <div className="flex flex-wrap gap-x-2">
                <dt className="font-medium">Price</dt>
                <dd>{formatMoney(summary.price, summary.currency)}</dd>
              </div>
              <div className="flex flex-wrap gap-x-2">
                <dt className="font-medium">Period</dt>
                <dd>
                  {formatDateLabel(summary.startDate)} — {formatDateLabel(summary.endDate)}
                </dd>
              </div>
              <div className="flex flex-wrap gap-x-2">
                <dt className="font-medium">Days remaining</dt>
                <dd>{summary.daysRemaining}</dd>
              </div>
              {summary.cancelAtPeriodEnd !== undefined ? (
                <div className="flex flex-wrap gap-x-2">
                  <dt className="font-medium">Cancel at period end</dt>
                  <dd>{summary.cancelAtPeriodEnd ? "Yes" : "No"}</dd>
                </div>
              ) : null}
              {summary.autoRenew !== undefined ? (
                <div className="flex flex-wrap gap-x-2">
                  <dt className="font-medium">Auto renew</dt>
                  <dd>{summary.autoRenew ? "Yes" : "No"}</dd>
                </div>
              ) : null}
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-brand text-lg">Financial summary</CardTitle>
            <CardDescription>Totals across all orders for this account.</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="text-muted-foreground grid gap-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt>Total spent</dt>
                <dd className="text-foreground font-medium tabular-nums">
                  {formatMoney(financialSummary.totalSpent, null)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Total orders</dt>
                <dd className="tabular-nums">{financialSummary.totalOrders}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Paid orders</dt>
                <dd className="tabular-nums">{financialSummary.paidOrders}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Average order value</dt>
                <dd className="tabular-nums">{financialSummary.averageOrderValue.toFixed(2)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Lifetime value</dt>
                <dd className="tabular-nums">{financialSummary.lifetimeValue.toFixed(2)}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>

      {(subscriptionTier || trial) && (
        <div className="grid gap-4 md:grid-cols-2">
          {subscriptionTier ? (
            <Card>
              <CardHeader>
                <CardTitle className="font-brand text-lg">Subscription tier</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground text-sm">
                <p className="text-foreground font-medium">{subscriptionTier.Name}</p>
                {subscriptionTier.Title ? <p>{subscriptionTier.Title}</p> : null}
                {subscriptionTier.description ? (
                  <p className="mt-2 leading-relaxed">{subscriptionTier.description}</p>
                ) : null}
              </CardContent>
            </Card>
          ) : null}
          {trial ? (
            <Card>
              <CardHeader>
                <CardTitle className="font-brand text-lg">Trial</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground text-sm">
                <p>
                  {formatDateLabel(trial.startDate)} — {formatDateLabel(trial.endDate)}
                </p>
                <Badge className="mt-2" variant={trial.isActive ? "secondary" : "outline"}>
                  {trial.isActive ? "Trial active" : "Trial inactive"}
                </Badge>
              </CardContent>
            </Card>
          ) : null}
        </div>
      )}

      {customers.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="font-brand text-lg">Stripe customers</CardTitle>
            <CardDescription>Customer records linked to this account.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-3 text-sm">
              {customers.map((c) => (
                <li
                  key={c.id}
                  className="border-border bg-muted/30 flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2"
                >
                  <span className="font-mono text-xs">{c.stripe_customer_id ?? "—"}</span>
                  <span className="text-muted-foreground text-xs">
                    {c.stripe_invoice_prefix ? `Prefix ${c.stripe_invoice_prefix}` : null}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="font-brand text-lg">Orders</CardTitle>
          <CardDescription>
            Showing {meta.ordersReturned} of {meta.ordersTotal} orders (max {meta.orderListMax} per
            request).
            {listTruncated
              ? " Financial totals above include all orders; this list is the most recent only."
              : null}
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {orders.length === 0 ? (
            <p className="text-muted-foreground text-sm" role="status">
              No orders yet.
            </p>
          ) : (
            <table className="w-full min-w-lg text-left text-sm">
              <thead>
                <tr className="text-muted-foreground border-b text-xs uppercase">
                  <th className="pr-3 pb-2 font-medium">Date</th>
                  <th className="pr-3 pb-2 font-medium">Name</th>
                  <th className="pr-3 pb-2 font-medium">Total</th>
                  <th className="pr-3 pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">Invoice</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <OrderRow key={order.id} order={order} />
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function BillingContent({ accountId }: { accountId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const redirectingRef = useRef(false);
  const segmentOk = isValidAccountIdSegment(accountId);
  const q = useAccountBilling(accountId, { enabled: segmentOk });

  useEffect(() => {
    redirectingRef.current = false;
  }, [accountId]);

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
    return <BrandedLoader label="Loading billing" />;
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
      <ErrorState
        title="Could not load billing"
        description={err instanceof Error ? err.message : AUTH_ERROR_MESSAGES.network}
        onRetry={() => void q.refetch()}
      />
    );
  }

  if (!q.isSuccess || !q.data || isAccountBillingGatewayRedirect(q.data)) {
    return null;
  }

  return <BillingSections data={q.data.data} />;
}
