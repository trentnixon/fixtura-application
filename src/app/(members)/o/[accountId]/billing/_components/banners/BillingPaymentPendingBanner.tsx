"use client";

import Link from "next/link";

import {
  TypographyCardDescription,
  TypographyCardTitle,
  TypographyErrorText,
  TypographyEyebrow,
} from "@/components/typography";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";

import { BILLING_SUPPORT_EMAIL } from "../../_constants/support/billingSupport";
import { useBillingPaymentPendingBannerActions } from "../../_hooks/useBillingPaymentPendingBannerActions";
import { resolveWithdrawableInvoiceRequestId } from "../../_utils/invoice-request/resolveWithdrawableInvoiceRequestId";
import {
  isInvoiceIssuedCheckout,
  paymentPendingBannerCopy,
} from "../../_utils/payment-pending/billingPaymentPending";
import { resolveDeletablePendingOrderId } from "../../_utils/payment-pending/resolveDeletablePendingOrderId";

import type { BillingPaymentPendingBannerProps } from "../../_types/overview/billingPaymentPendingBanner";

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
            <TypographyEyebrow>{eyebrow}</TypographyEyebrow>
            <TypographyCardTitle className="text-primary font-brand mt-2">
              {title}
            </TypographyCardTitle>
            <TypographyCardDescription>{body}</TypographyCardDescription>
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
            <a href={`mailto:${BILLING_SUPPORT_EMAIL}`}>Contact billing support</a>
          </Button>
          {withdrawInvoiceError ? (
            <TypographyErrorText className="text-xs" role="alert">
              {withdrawInvoiceError}
            </TypographyErrorText>
          ) : null}
          {discardError ? (
            <TypographyErrorText className="text-xs" role="alert">
              {discardError}
            </TypographyErrorText>
          ) : null}
          {resumeError ? (
            <TypographyErrorText className="text-xs" role="alert">
              {resumeError}
            </TypographyErrorText>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
