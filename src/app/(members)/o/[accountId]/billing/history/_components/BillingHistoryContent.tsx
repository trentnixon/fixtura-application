"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";

import { BillingHistoryCurrentOrderCard } from "./BillingHistoryCurrentOrderCard";
import { BillingHistoryInvoiceRequestsCard } from "./BillingHistoryInvoiceRequestsCard";
import { BillingHistoryOrdersTableCard } from "./BillingHistoryOrdersTableCard";
import { BillingHistoryStatusState } from "./BillingHistoryStatusState";
import { BillingDebugPanel } from "../../debug/billing-debug-panel";
import { useBillingHistoryContentState } from "../_hooks/useBillingHistoryContentState";

export function BillingHistoryContent({ accountId }: { accountId: string }) {
  const state = useBillingHistoryContentState(accountId);

  if (state.kind !== "ready") {
    return <BillingHistoryStatusState state={state} />;
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" size="sm" asChild>
          <Link href={state.baseHref}>Back to billing</Link>
        </Button>
      </div>

      <BillingHistoryCurrentOrderCard
        activeOrder={state.summary?.activeOrder}
        orders={state.orders}
      />

      <BillingHistoryOrdersTableCard
        orders={state.orders}
        loadError={state.ordersLoadError}
        onRetry={state.refetchOrders}
      />

      <BillingHistoryInvoiceRequestsCard
        invoiceRequests={state.invoiceRequests}
        invoiceWithdrawError={state.invoiceWithdrawError}
        withdrawPending={state.cancelInvoiceRequestPending}
        onWithdraw={state.withdrawInvoiceRequest}
      />

      <BillingDebugPanel
        accountId={accountId}
        contextLabel="History"
        summary={state.summary}
        orders={state.orders}
        isSummaryLoading={false}
        extra={{
          invoiceRequestsCount: state.invoiceRequests.length,
          ordersCount: state.orders.length,
          ordersQueryError: Boolean(state.ordersLoadError),
        }}
      />
    </div>
  );
}
