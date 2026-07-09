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

import { BillingInvoiceRequestWithdrawDialog } from "../../_components/invoice-request/BillingInvoiceRequestWithdrawDialog";
import { getBillingInvoiceRequestWithdrawCopy } from "../../_constants/invoice-request/billingInvoiceRequestWithdraw";
import { BILLING_SUPPORT_EMAIL } from "../../_constants/support/billingSupport";
import { useBillingInvoiceRequestWithdraw } from "../../_hooks/useBillingInvoiceRequestWithdraw";
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
  const withdrawCopyVariant = invoiceIssuedAwaitingPayment ? "cancel" : "withdraw";
  const withdrawButtonCopy = getBillingInvoiceRequestWithdrawCopy(withdrawCopyVariant);
  const showWithdrawInvoiceRequest = variant === "invoice" && Boolean(withdrawableInvoiceRequestId);
  const withdraw = useBillingInvoiceRequestWithdraw(accountId);
  const {
    billingActionPending,
    discard,
    discardError,
    onContinuePayment,
    onDiscardPendingOrder,
    resume,
    resumeError,
  } = useBillingPaymentPendingBannerActions({
    accountId,
    deletableOrderId,
    orderId,
    withdrawPending: withdraw.isPending,
  });

  return (
    <>
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
            {showWithdrawInvoiceRequest && withdrawableInvoiceRequestId ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={billingActionPending}
                onClick={() =>
                  withdraw.openWithdraw(
                    { invoiceRequestId: withdrawableInvoiceRequestId },
                    withdrawCopyVariant,
                  )
                }
              >
                {withdraw.isPending
                  ? withdrawButtonCopy.pendingConfirmButtonLabel
                  : withdrawButtonCopy.triggerButtonLabel}
              </Button>
            ) : null}
            <Button type="button" variant="outline" size="sm" asChild>
              <a href={`mailto:${BILLING_SUPPORT_EMAIL}`}>Contact billing support</a>
            </Button>
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
    </>
  );
}
