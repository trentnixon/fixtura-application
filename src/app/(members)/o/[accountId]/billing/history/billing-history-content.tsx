"use client";

import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { BrandedLoader } from "@/components/ui/branded-loader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { ApiError } from "@/lib/api/client/api-error";
import {
  isAccountBillingGatewayRedirect,
  useAccountBilling,
} from "@/lib/api/hooks/account/useAccountBilling";
import {
  isAccountBillingInvoiceRequestsGatewayRedirect,
  useAccountBillingInvoiceRequests,
} from "@/lib/api/hooks/account/useAccountBillingInvoiceRequests";
import {
  isAccountBillingOrdersGatewayRedirect,
  useAccountBillingOrders,
} from "@/lib/api/hooks/account/useAccountBillingOrders";
import { usePostAccountBillingCancelInvoiceRequest } from "@/lib/api/hooks/account/usePostAccountBillingCancelInvoiceRequest";
import { queryKeys } from "@/lib/api/query/query-keys";
import { AUTH_ERROR_MESSAGES } from "@/lib/auth/auth-errors";
import { isValidAccountIdSegment } from "@/lib/config/account-routes";
import {
  SELECT_ORG_GATEWAY_REASON,
  selectOrganisationUrlWithReason,
} from "@/lib/config/gateway-reasons";

import { getHistoryOrderStatus } from "../_utils/billingHistoryOrderUtils";
import { BillingDebugPanel } from "../debug/billing-debug-panel";

import type {
  AccountBillingOrderDto,
  AccountBillingOrderHistoryDto,
  InvoiceRequestSummary,
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

function parseHistoryOrderTotal(total: string | null): number | null {
  if (total == null || String(total).trim() === "") return null;
  const n = Number.parseFloat(String(total));
  return Number.isFinite(n) ? n : null;
}

/** Prefer row matching billing summary active order, then active flag, then newest (first in list). */
function pickHighlightedOrder(
  orders: AccountBillingOrderHistoryDto[],
  billingActive: AccountBillingOrderDto | null,
): AccountBillingOrderHistoryDto | null {
  if (orders.length === 0) return null;
  if (billingActive?.stripe_subscription_id) {
    const sid = billingActive.stripe_subscription_id.trim().toLowerCase();
    const bySub = orders.find((o) => o.stripeSubscriptionId?.trim().toLowerCase() === sid);
    if (bySub) return bySub;
  }
  if (billingActive?.id != null) {
    const byId = orders.find((o) => o.id === billingActive.id);
    if (byId) return byId;
  }
  const activeRow = orders.find((o) => o.isActive);
  if (activeRow) return activeRow;
  return orders[0] ?? null;
}

function HistoryOrderDetailSection({ order }: { order: AccountBillingOrderHistoryDto }) {
  const tierLabel = order.subscriptionTier?.name ?? null;
  const status = getHistoryOrderStatus(order);
  return (
    <dl className="text-muted-foreground grid gap-2 text-sm">
      {tierLabel ? (
        <div className="flex flex-wrap justify-between gap-x-4 gap-y-1">
          <dt className="text-foreground font-medium">Plan</dt>
          <dd className="text-right">{tierLabel}</dd>
        </div>
      ) : null}
      <div className="flex flex-wrap justify-between gap-x-4 gap-y-1">
        <dt className="text-foreground font-medium">Name</dt>
        <dd className="text-right">{order.name ?? "—"}</dd>
      </div>
      <div className="flex flex-wrap justify-between gap-x-4 gap-y-1">
        <dt className="text-foreground font-medium">Started</dt>
        <dd className="text-right">{formatDateLabel(order.startAt ?? null)}</dd>
      </div>
      <div className="flex flex-wrap justify-between gap-x-4 gap-y-1">
        <dt className="text-foreground font-medium">Total</dt>
        <dd className="text-right tabular-nums">
          {formatMoney(parseHistoryOrderTotal(order.total), order.currency)}
        </dd>
      </div>
      <div className="flex flex-wrap justify-between gap-x-4 gap-y-1">
        <dt className="text-foreground font-medium">Status</dt>
        <dd className="text-right">
          <span className="text-muted-foreground">{status}</span>
        </dd>
      </div>
    </dl>
  );
}

function ActiveOrderSection({ order }: { order: AccountBillingOrderDto }) {
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
      {order.invoice_pdf ? (
        <div>
          <a
            href={order.invoice_pdf}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary text-sm underline-offset-4 hover:underline"
          >
            Download invoice PDF
          </a>
        </div>
      ) : null}
    </dl>
  );
}

function InvoiceRequestRow({
  req,
  onWithdraw,
  withdrawPending = false,
}: {
  req: InvoiceRequestSummary;
  onWithdraw?: () => void;
  withdrawPending?: boolean;
}) {
  return (
    <li className="border-border rounded-lg border p-4">
      <dl className="grid gap-1 text-sm">
        <div className="flex flex-wrap justify-between gap-2">
          <dt className="text-muted-foreground">Request ID</dt>
          <dd className="text-right font-mono text-xs">{req.invoiceRequestId ?? req.id ?? "—"}</dd>
        </div>
        <div className="flex flex-wrap justify-between gap-2">
          <dt className="text-muted-foreground">Status</dt>
          <dd>{req.status ?? "—"}</dd>
        </div>
        <div className="flex flex-wrap justify-between gap-2">
          <dt className="text-muted-foreground">Submitted</dt>
          <dd>{formatDateLabel(req.submittedAt ?? null)}</dd>
        </div>
        {req.requestedStartDate ? (
          <div className="flex flex-wrap justify-between gap-2">
            <dt className="text-muted-foreground">Requested start</dt>
            <dd>{formatDateLabel(req.requestedStartDate)}</dd>
          </div>
        ) : null}
        {req.subscriptionTierId ? (
          <div className="flex flex-wrap justify-between gap-2">
            <dt className="text-muted-foreground">Tier</dt>
            <dd>{req.subscriptionTierId}</dd>
          </div>
        ) : null}
        {req.message ? (
          <div className="pt-1">
            <p className="text-muted-foreground text-xs">{req.message}</p>
          </div>
        ) : null}
        {onWithdraw ? (
          <div className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={withdrawPending}
              onClick={() => void onWithdraw()}
            >
              {withdrawPending ? "Withdrawing…" : "Withdraw request"}
            </Button>
          </div>
        ) : null}
      </dl>
    </li>
  );
}

function OrdersHistoryTableSection({
  orders,
  loadError,
  onRetry,
}: {
  orders: AccountBillingOrderHistoryDto[];
  loadError: Error | null;
  onRetry: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-brand text-lg">Order history</CardTitle>
        <CardDescription>All orders for this account (newest first).</CardDescription>
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
            No orders recorded yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-border border-b text-left">
                  <th className="px-3 py-2 font-medium">ID</th>
                  <th className="px-3 py-2 font-medium">Plan</th>
                  <th className="px-3 py-2 font-medium">Started</th>
                  <th className="px-3 py-2 font-medium">Total</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, idx) => (
                  <tr
                    key={`${order.id}-${idx}`}
                    className="border-border/70 border-b last:border-b-0"
                  >
                    <td className="px-3 py-2 font-mono text-xs">{order.id}</td>
                    <td className="px-3 py-2">{order.subscriptionTier?.name ?? "—"}</td>
                    <td className="px-3 py-2">{formatDateLabel(order.startAt ?? null)}</td>
                    <td className="px-3 py-2 tabular-nums">
                      {formatMoney(parseHistoryOrderTotal(order.total), order.currency)}
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

export function BillingHistoryContent({ accountId }: { accountId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const redirectingRef = useRef(false);
  const segmentOk = isValidAccountIdSegment(accountId);
  const cancelInvoiceReq = usePostAccountBillingCancelInvoiceRequest(accountId);
  const [invoiceWithdrawError, setInvoiceWithdrawError] = useState<string | null>(null);

  const withdrawInvoiceRequestRow = useCallback(
    async (req: InvoiceRequestSummary) => {
      const raw = req.invoiceRequestId ?? (req.id != null ? String(req.id) : "");
      const id = raw.trim();
      if (!id) return;
      if (!window.confirm("Withdraw this invoice request? You can submit a new one later.")) return;
      setInvoiceWithdrawError(null);
      try {
        await cancelInvoiceReq.mutateAsync(id);
      } catch (e) {
        setInvoiceWithdrawError(
          e instanceof ApiError ? e.message : "Something went wrong. Try again.",
        );
      }
    },
    [cancelInvoiceReq],
  );

  const billingQ = useAccountBilling(accountId, { enabled: segmentOk });
  const invoiceReqQ = useAccountBillingInvoiceRequests(accountId, { enabled: segmentOk });

  const billingResolved = Boolean(
    billingQ.isSuccess && billingQ.data && !isAccountBillingGatewayRedirect(billingQ.data),
  );
  const invoiceResolved = Boolean(
    invoiceReqQ.isSuccess &&
    invoiceReqQ.data &&
    !isAccountBillingInvoiceRequestsGatewayRedirect(invoiceReqQ.data),
  );
  const ordersEnabled = segmentOk && billingResolved && invoiceResolved;
  const ordersQ = useAccountBillingOrders(accountId, { enabled: ordersEnabled });

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
    if (!billingQ.isSuccess || !billingQ.data || redirectingRef.current) return;
    if (!isAccountBillingGatewayRedirect(billingQ.data)) return;
    redirectingRef.current = true;
    void queryClient.removeQueries({ queryKey: queryKeys.account.billing(accountId) });
    router.replace(selectOrganisationUrlWithReason(billingQ.data.reason));
  }, [billingQ.isSuccess, billingQ.data, accountId, queryClient, router, segmentOk]);

  useEffect(() => {
    if (!segmentOk) return;
    if (!invoiceReqQ.isSuccess || !invoiceReqQ.data || redirectingRef.current) return;
    if (!isAccountBillingInvoiceRequestsGatewayRedirect(invoiceReqQ.data)) return;
    redirectingRef.current = true;
    void queryClient.removeQueries({
      queryKey: queryKeys.account.billingInvoiceRequests(accountId),
    });
    router.replace(selectOrganisationUrlWithReason(invoiceReqQ.data.reason));
  }, [invoiceReqQ.isSuccess, invoiceReqQ.data, accountId, queryClient, router, segmentOk]);

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
          contextLabel="History"
          summary={null}
          isSummaryLoading={false}
          extra={{ validAccountSegment: false }}
        />
      </div>
    );
  }

  if (billingQ.isPending || invoiceReqQ.isPending) {
    return (
      <>
        <BrandedLoader label="Loading history" />
        <BillingDebugPanel
          accountId={accountId}
          contextLabel="History"
          summary={null}
          isSummaryLoading
          extra={{
            billingPending: billingQ.isPending,
            invoiceRequestsPending: invoiceReqQ.isPending,
          }}
        />
      </>
    );
  }

  if (ordersEnabled && ordersQ.isPending) {
    return (
      <>
        <BrandedLoader label="Loading history" />
        <BillingDebugPanel
          accountId={accountId}
          contextLabel="History"
          summary={
            billingQ.isSuccess && billingQ.data && !isAccountBillingGatewayRedirect(billingQ.data)
              ? billingQ.data.data
              : null
          }
          isSummaryLoading
          extra={{
            ordersPending: true,
          }}
        />
      </>
    );
  }

  if (ordersQ.isSuccess && ordersQ.data && isAccountBillingOrdersGatewayRedirect(ordersQ.data)) {
    const billingSummaryForDebug =
      billingQ.isSuccess && billingQ.data && !isAccountBillingGatewayRedirect(billingQ.data)
        ? billingQ.data.data
        : null;
    return (
      <div className="text-muted-foreground grid gap-2 text-center text-sm" role="status">
        <p>Redirecting…</p>
        <BillingDebugPanel
          accountId={accountId}
          contextLabel="History"
          summary={billingSummaryForDebug}
          isSummaryLoading={false}
          extra={{ ordersGateway: ordersQ.data.reason }}
        />
      </div>
    );
  }

  if (billingQ.isSuccess && billingQ.data && isAccountBillingGatewayRedirect(billingQ.data)) {
    return (
      <div className="text-muted-foreground grid gap-2 text-center text-sm" role="status">
        <p>Redirecting…</p>
        <BillingDebugPanel
          accountId={accountId}
          contextLabel="History"
          summary={null}
          isSummaryLoading={false}
          extra={{ gateway: billingQ.data.reason }}
        />
      </div>
    );
  }

  if (
    invoiceReqQ.isSuccess &&
    invoiceReqQ.data &&
    isAccountBillingInvoiceRequestsGatewayRedirect(invoiceReqQ.data)
  ) {
    const billingSummaryForDebug =
      billingQ.isSuccess && billingQ.data && !isAccountBillingGatewayRedirect(billingQ.data)
        ? billingQ.data.data
        : null;
    return (
      <div className="text-muted-foreground grid gap-2 text-center text-sm" role="status">
        <p>Redirecting…</p>
        <BillingDebugPanel
          accountId={accountId}
          contextLabel="History"
          summary={billingSummaryForDebug}
          isSummaryLoading={false}
          extra={{ invoiceRequestsGateway: invoiceReqQ.data.reason }}
        />
      </div>
    );
  }

  const billingErr = billingQ.isError ? billingQ.error : null;
  const invoiceErr = invoiceReqQ.isError ? invoiceReqQ.error : null;

  if (billingErr || invoiceErr) {
    const err = billingErr ?? invoiceErr;
    const billingSummaryForDebug =
      billingQ.isSuccess && billingQ.data && !isAccountBillingGatewayRedirect(billingQ.data)
        ? billingQ.data.data
        : null;
    return (
      <>
        <ErrorState
          title="Could not load history"
          description={err instanceof Error ? err.message : AUTH_ERROR_MESSAGES.network}
          onRetry={() => {
            void billingQ.refetch();
            void invoiceReqQ.refetch();
          }}
        />
        <BillingDebugPanel
          accountId={accountId}
          contextLabel="History"
          summary={billingSummaryForDebug}
          isSummaryLoading={false}
          summaryError={err instanceof Error ? err.message : AUTH_ERROR_MESSAGES.network}
          extra={{
            billingQueryError: Boolean(billingErr),
            invoiceRequestsQueryError: Boolean(invoiceErr),
          }}
        />
      </>
    );
  }

  const summary =
    billingQ.isSuccess && billingQ.data && !isAccountBillingGatewayRedirect(billingQ.data)
      ? billingQ.data.data
      : null;

  const invoiceRequests =
    invoiceReqQ.isSuccess &&
    invoiceReqQ.data &&
    !isAccountBillingInvoiceRequestsGatewayRedirect(invoiceReqQ.data)
      ? invoiceReqQ.data.invoiceRequests
      : [];

  const ordersList =
    ordersQ.isSuccess && ordersQ.data && !isAccountBillingOrdersGatewayRedirect(ordersQ.data)
      ? ordersQ.data.orders
      : [];

  const ordersLoadError = ordersQ.isError
    ? ordersQ.error instanceof Error
      ? ordersQ.error
      : new Error(String(ordersQ.error))
    : null;

  const highlightedOrder = pickHighlightedOrder(ordersList, summary?.activeOrder ?? null);

  const base = `/o/${encodeURIComponent(accountId)}/billing`;

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" size="sm" asChild>
          <Link href={base}>Back to billing</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-brand text-lg">Current order</CardTitle>
          <CardDescription>
            Primary subscription order (from order history when available, otherwise billing
            summary).
          </CardDescription>
        </CardHeader>
        <CardContent>
          {highlightedOrder ? (
            <HistoryOrderDetailSection order={highlightedOrder} />
          ) : summary?.activeOrder ? (
            <ActiveOrderSection order={summary.activeOrder} />
          ) : (
            <p className="text-muted-foreground text-sm" role="status">
              No current order on file.
            </p>
          )}
        </CardContent>
      </Card>

      <OrdersHistoryTableSection
        orders={ordersList}
        loadError={ordersLoadError}
        onRetry={() => void ordersQ.refetch()}
      />

      <Card>
        <CardHeader>
          <CardTitle className="font-brand text-lg">Invoice requests</CardTitle>
          <CardDescription>History from GET /billing/invoice-requests.</CardDescription>
        </CardHeader>
        <CardContent>
          {invoiceWithdrawError ? (
            <p className="text-destructive mb-3 text-sm" role="alert">
              {invoiceWithdrawError}
            </p>
          ) : null}
          {invoiceRequests.length === 0 ? (
            <p className="text-muted-foreground text-sm" role="status">
              No invoice requests yet.
            </p>
          ) : (
            <ul className="grid gap-3">
              {invoiceRequests.map((req, idx) => (
                <InvoiceRequestRow
                  key={String(req.invoiceRequestId ?? req.id ?? idx)}
                  req={req}
                  withdrawPending={cancelInvoiceReq.isPending}
                  {...(req.canWithdraw === true
                    ? {
                        onWithdraw: () => {
                          void withdrawInvoiceRequestRow(req);
                        },
                      }
                    : {})}
                />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
      <BillingDebugPanel
        accountId={accountId}
        contextLabel="History"
        summary={summary}
        orders={ordersList}
        isSummaryLoading={false}
        extra={{
          invoiceRequestsCount: invoiceRequests.length,
          ordersCount: ordersList.length,
          ordersQueryError: Boolean(ordersLoadError),
        }}
      />
    </div>
  );
}
