"use client";

import {
  TypographyCaption,
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

import {
  BILLING_TRIAL_START_COPY,
  BILLING_TRIAL_START_DURATION_DAYS,
} from "../../_constants/trial/billingTrialStart";
import { shouldShowBillingTrialStartPlanHint } from "../../_utils/trial/billingTrialStart";

import type { BillingTrialStartConfirmDialogProps } from "../../_types/trial/billingTrialStart";

export function BillingTrialStartConfirmDialog({
  open,
  onOpenChange,
  trialSchedule,
  errorMessage,
  isPending,
  onCancel,
  onConfirm,
}: BillingTrialStartConfirmDialogProps) {
  const showTrialPlanHint = shouldShowBillingTrialStartPlanHint(errorMessage);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" aria-describedby="billing-trial-confirm-description">
        <DialogHeader>
          <DialogTitle>{BILLING_TRIAL_START_COPY.confirmTitle}</DialogTitle>
          <DialogDescription id="billing-trial-confirm-description" asChild>
            <div className="[&_strong]:text-foreground space-y-2">
              <TypographyDialogDescription as="p" className="text-inherit">
                {BILLING_TRIAL_START_COPY.confirmDescriptionPrefix}{" "}
                <strong>{BILLING_TRIAL_START_DURATION_DAYS} days</strong>{" "}
                {BILLING_TRIAL_START_COPY.confirmDescriptionSuffix}
              </TypographyDialogDescription>
              {trialSchedule ? (
                <TypographyDialogDescription as="p" className="text-inherit">
                  {BILLING_TRIAL_START_COPY.confirmStartsLabel}{" "}
                  <strong>{trialSchedule.startLabel}</strong>.{" "}
                  {BILLING_TRIAL_START_COPY.confirmEndsLabel}{" "}
                  <strong>{trialSchedule.endLabel}</strong>.
                </TypographyDialogDescription>
              ) : null}
            </div>
          </DialogDescription>
        </DialogHeader>
        {errorMessage ? (
          <div className="text-destructive space-y-1 px-1 text-sm" role="alert">
            <TypographyErrorText className="text-inherit">{errorMessage}</TypographyErrorText>
            {showTrialPlanHint ? (
              <TypographyCaption>{BILLING_TRIAL_START_COPY.dialogTrialPlanHint}</TypographyCaption>
            ) : null}
          </div>
        ) : null}
        <DialogFooter>
          <Button type="button" variant="outline" disabled={isPending} onClick={onCancel}>
            {BILLING_TRIAL_START_COPY.cancelButtonLabel}
          </Button>
          <Button
            type="button"
            variant="accent"
            disabled={isPending}
            onClick={() => void onConfirm()}
          >
            {isPending
              ? BILLING_TRIAL_START_COPY.pendingConfirmButtonLabel
              : BILLING_TRIAL_START_COPY.confirmButtonLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
