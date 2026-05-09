"use client";

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
} from "../../_constants/billingTrialStart";
import { shouldShowBillingTrialStartPlanHint } from "../../_utils/billingTrialStart";

import type { BillingTrialStartConfirmDialogProps } from "../../_types/billingTrialStart";

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
              <p>
                {BILLING_TRIAL_START_COPY.confirmDescriptionPrefix}{" "}
                <strong>{BILLING_TRIAL_START_DURATION_DAYS} days</strong>{" "}
                {BILLING_TRIAL_START_COPY.confirmDescriptionSuffix}
              </p>
              {trialSchedule ? (
                <p>
                  {BILLING_TRIAL_START_COPY.confirmStartsLabel}{" "}
                  <strong>{trialSchedule.startLabel}</strong>.{" "}
                  {BILLING_TRIAL_START_COPY.confirmEndsLabel}{" "}
                  <strong>{trialSchedule.endLabel}</strong>.
                </p>
              ) : null}
            </div>
          </DialogDescription>
        </DialogHeader>
        {errorMessage ? (
          <div className="text-destructive space-y-1 px-1 text-sm" role="alert">
            <p>{errorMessage}</p>
            {showTrialPlanHint ? (
              <p className="text-muted-foreground text-xs">
                {BILLING_TRIAL_START_COPY.dialogTrialPlanHint}
              </p>
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
