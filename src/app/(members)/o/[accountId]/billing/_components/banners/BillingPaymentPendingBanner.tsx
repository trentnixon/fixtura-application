"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { BILLING_SUPPORT_EMAIL } from "../../_constants/billingSupport";
import { useBillingPaymentPendingBannerActions } from "../../_hooks/useBillingPaymentPendingBannerActions";
import {
  isInvoiceIssuedCheckout,
  paymentPendingBannerCopy,
} from "../../_utils/billingPaymentPending";
import { resolveDeletablePendingOrderId } from "../../_utils/resolveDeletablePendingOrderId";
import { resolveWithdrawableInvoiceRequestId } from "../../_utils/resolveWithdrawableInvoiceRequestId";

import type { BillingPaymentPendingBannerProps } from "../../_types/billingPaymentPendingBanner";

/**
 * Top-of-page hero for `billingUiMode === "payment_pending"`: invoice request in flight or checkout/payment incomplete.
 */
export function BillingPaymentPendingBanner({
  accountId,
  summary,
  orders,
}: BillingPaymentPendingBannerProps) {
  const { eyebrow, title, body, variant } = paymentPendingBannerCopy(summary, orders);
  const createHref = `/o/${encodeURIComponent(accountId)}/billing/create`;

  const orderId = summary.currentPlan?.orderId ?? null;
  const deletableOrderId = resolveDeletablePendingOrderId(summary, orders);
  const withdrawableInvoiceRequestId = resolveWithdrawableInvoiceRequestId(summary);
  const invoiceIssuedAwaitingPayment = isInvoiceIssuedCheckout(summary, orders);
  const showWithdrawInvoiceRequest = variant === "invoice" && Boolean(withdrawableInvoiceRequestId);
  const {
    billingActionPending,
    cancelInvoiceRequest,
    discard,
    discardError,
    onContinuePayment,
    onDiscardPendingOrder,
    onWithdrawInvoiceRequest,
    resume,
    resumeError,
    withdrawInvoiceError,
  } = useBillingPaymentPendingBannerActions({
    accountId,
    deletableOrderId,
    orderId,
    withdrawableInvoiceRequestId,
  });

  return (
    <Card className="overflow-hidden" data-testid="billing-payment-pending-banner">
      <div className="from-primary via-brand-secondary to-brand-accent h-2 w-full bg-linear-to-r" />
      <div className="flex flex-col md:flex-row">
        <div className="flex-1">
          <CardHeader>
            <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
              {eyebrow}
            </p>
            <CardTitle className="text-primary font-brand mt-2 text-xl">{title}</CardTitle>
            <CardDescription>{body}</CardDescription>
          </CardHeader>
        </div>
        <div className="bg-muted/30 flex w-full flex-col justify-center gap-3 border-t p-6 md:w-64 md:border-t-0 md:border-l">
          {variant === "checkout" ? (
            <>
              {orderId ? (
                <Button
                  type="button"
                  variant="accent"
                  size="sm"
                  disabled={billingActionPending}
                  onClick={() => void onContinuePayment()}
                >
                  {resume.isPending ? "Opening..." : "Continue payment"}
                </Button>
              ) : (
                <Button type="button" variant="accent" size="sm" asChild>
                  <Link href={createHref}>Create subscription</Link>
                </Button>
              )}
              {deletableOrderId ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={billingActionPending}
                  onClick={() => void onDiscardPendingOrder()}
                >
                  {discard.isPending ? "Discarding..." : "Discard checkout"}
                </Button>
              ) : null}
            </>
          ) : null}
          {showWithdrawInvoiceRequest ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={billingActionPending}
              onClick={() => void onWithdrawInvoiceRequest()}
            >
              {cancelInvoiceRequest.isPending
                ? invoiceIssuedAwaitingPayment
                  ? "Cancelling..."
                  : "Withdrawing..."
                : invoiceIssuedAwaitingPayment
                  ? "Cancel invoice request"
                  : "Withdraw invoice request"}
            </Button>
          ) : null}
          <Button type="button" variant="outline" size="sm" asChild>
            <a href={`mailto:${BILLING_SUPPORT_EMAIL}`}>Email support</a>
          </Button>
          {withdrawInvoiceError ? (
            <p className="text-destructive text-xs" role="alert">
              {withdrawInvoiceError}
            </p>
          ) : null}
          {discardError ? (
            <p className="text-destructive text-xs" role="alert">
              {discardError}
            </p>
          ) : null}
          {resumeError ? (
            <p className="text-destructive text-xs" role="alert">
              {resumeError}
            </p>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
