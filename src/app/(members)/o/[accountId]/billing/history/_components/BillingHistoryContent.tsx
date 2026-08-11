"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";

import { BillingHistoryInvoiceRequestsCard } from "./BillingHistoryInvoiceRequestsCard";
import { BillingHistoryOrdersTableCard } from "./BillingHistoryOrdersTableCard";
import { BillingHistoryStatusState } from "./BillingHistoryStatusState";
import { BillingInvoiceRequestWithdrawDialog } from "../../_components/invoice-request/BillingInvoiceRequestWithdrawDialog";
import { BILLING_SUPPORT_READ_ONLY_COPY } from "../../_constants/support/billingSupportReadOnly";
import { useBillingInvoiceRequestWithdraw } from "../../_hooks/useBillingInvoiceRequestWithdraw";
import { useBillingHistoryContentState } from "../_hooks/useBillingHistoryContentState";

export function BillingHistoryContent({ accountId }: { accountId: string }) {
  const state = useBillingHistoryContentState(accountId);
  const withdraw = useBillingInvoiceRequestWithdraw(accountId);

  if (state.kind !== "ready") {
    return <BillingHistoryStatusState state={state} />;
  }

  const showInvoiceWithdraw = !state.isSupportView;

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" size="sm" asChild>
          <Link href={state.baseHref}>Back to billing</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[8fr_4fr] md:items-start">
        <div className="min-w-0">
          <BillingHistoryOrdersTableCard
            orders={state.orders}
            activeOrder={state.summary.activeOrder}
            loadError={state.ordersLoadError}
            onRetry={state.refetchOrders}
          />
        </div>

        <div className="min-w-0">
          <BillingHistoryInvoiceRequestsCard
            invoiceRequests={state.invoiceRequests}
            withdrawPending={showInvoiceWithdraw ? withdraw.isPending : false}
            {...(state.isSupportView
              ? {
                  description: BILLING_SUPPORT_READ_ONLY_COPY.invoiceRequestsCardDescription,
                }
              : {})}
            {...(showInvoiceWithdraw
              ? { onWithdraw: withdraw.openWithdrawFromInvoiceRequest }
              : {})}
          />
        </div>
      </div>

      {showInvoiceWithdraw ? (
        <BillingInvoiceRequestWithdrawDialog
          open={withdraw.confirmOpen}
          onOpenChange={withdraw.handleDialogOpenChange}
          target={withdraw.withdrawTarget}
          copyVariant={withdraw.copyVariant}
          errorMessage={withdraw.errorMessage}
          isPending={withdraw.isPending}
          onCancel={withdraw.closeDialog}
          onConfirm={withdraw.confirmWithdraw}
        />
      ) : null}
    </div>
  );
}
