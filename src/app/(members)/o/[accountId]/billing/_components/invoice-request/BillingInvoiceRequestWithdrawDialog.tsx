"use client";

import {
  TypographyDataLabel,
  TypographyDataValue,
  TypographyDialogDescription,
  TypographyErrorText,
} from "@/components/typography";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { getBillingInvoiceRequestWithdrawCopy } from "../../_constants/invoice-request/billingInvoiceRequestWithdraw";
import { formatBillingDateTable } from "../../_utils/overview/formatBillingDisplay";

import type { BillingInvoiceRequestWithdrawDialogProps } from "../../_types/invoice-request/billingInvoiceRequestWithdraw";

export function BillingInvoiceRequestWithdrawDialog({
  open,
  onOpenChange,
  target,
  copyVariant,
  errorMessage,
  isPending,
  onCancel,
  onConfirm,
}: BillingInvoiceRequestWithdrawDialogProps) {
  const copy = getBillingInvoiceRequestWithdrawCopy(copyVariant);
  const showContext = target && (target.submittedAt || target.requestedStartDate || target.status);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        aria-describedby="billing-invoice-request-withdraw-description"
        showCloseButton={!isPending}
        onPointerDownOutside={(event) => {
          if (isPending) event.preventDefault();
        }}
        onEscapeKeyDown={(event) => {
          if (isPending) event.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>{copy.title}</DialogTitle>
          <DialogDescription id="billing-invoice-request-withdraw-description" asChild>
            <TypographyDialogDescription as="p" className="text-inherit">
              {copy.description}
            </TypographyDialogDescription>
          </DialogDescription>
        </DialogHeader>
        {showContext ? (
          <dl className="grid gap-2 rounded-lg border p-3">
            {target.submittedAt ? (
              <div className="flex flex-wrap justify-between gap-2">
                <TypographyDataLabel as="dt">Submitted</TypographyDataLabel>
                <TypographyDataValue as="dd">
                  {formatBillingDateTable(target.submittedAt)}
                </TypographyDataValue>
              </div>
            ) : null}
            {target.requestedStartDate ? (
              <div className="flex flex-wrap justify-between gap-2">
                <TypographyDataLabel as="dt">Requested</TypographyDataLabel>
                <TypographyDataValue as="dd">
                  {formatBillingDateTable(target.requestedStartDate)}
                </TypographyDataValue>
              </div>
            ) : null}
            {target.status ? (
              <div className="flex flex-wrap justify-between gap-2">
                <TypographyDataLabel as="dt">Status</TypographyDataLabel>
                <TypographyDataValue as="dd">{target.status}</TypographyDataValue>
              </div>
            ) : null}
          </dl>
        ) : null}
        {errorMessage ? (
          <TypographyErrorText className="px-1" role="alert">
            {errorMessage}
          </TypographyErrorText>
        ) : null}
        <DialogFooter>
          <Button type="button" variant="outline" disabled={isPending} onClick={onCancel}>
            {copy.cancelButtonLabel}
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={isPending}
            onClick={() => void onConfirm()}
          >
            {isPending ? copy.pendingConfirmButtonLabel : copy.confirmButtonLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
