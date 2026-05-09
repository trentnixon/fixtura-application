"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { BillingTrialStartConfirmDialog } from "./BillingTrialStartConfirmDialog";
import {
  BILLING_TRIAL_START_COPY,
  BILLING_TRIAL_START_DURATION_DAYS,
} from "../../_constants/billingTrialStart";
import { useBillingTrialStart } from "../../_hooks/useBillingTrialStart";
import { shouldShowBillingTrialStartPlanHint } from "../../_utils/billingTrialStart";

import type { BillingTrialStartCardProps } from "../../_types/billingTrialStart";

export function BillingTrialStartCard({
  accountId,
  enabled,
  availableActions,
}: BillingTrialStartCardProps) {
  const {
    visible,
    mutation,
    feedback,
    errorMessage,
    confirmOpen,
    trialSchedule,
    handleConfirmDialogOpenChange,
    openConfirmDialog,
    confirmStartTrial,
  } = useBillingTrialStart(accountId, enabled, availableActions);

  if (!visible) {
    return null;
  }

  const showCardTrialPlanHint = !confirmOpen && shouldShowBillingTrialStartPlanHint(errorMessage);

  return (
    <>
      <Card className="overflow-hidden">
        <div className="from-primary via-brand-secondary to-brand-accent h-2 w-full bg-linear-to-r" />
        <div className="flex flex-col md:flex-row">
          <div className="flex-1">
            <CardHeader>
              <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                {BILLING_TRIAL_START_COPY.cardEyebrow}
              </p>
              <CardTitle className="text-primary font-brand mt-2 text-xl">
                {BILLING_TRIAL_START_COPY.cardTitlePrefix} {BILLING_TRIAL_START_DURATION_DAYS}{" "}
                {BILLING_TRIAL_START_COPY.cardTitleSuffix}
              </CardTitle>
              <CardDescription>{BILLING_TRIAL_START_COPY.cardDescription}</CardDescription>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-2 text-sm">
              {feedback ? (
                <p
                  className="border-border text-foreground rounded-md border px-3 py-2 text-sm"
                  role="status"
                >
                  {feedback}
                </p>
              ) : null}
              {errorMessage && !confirmOpen ? (
                <p className="text-destructive text-sm" role="alert">
                  {errorMessage}
                  {showCardTrialPlanHint ? (
                    <span className="text-muted-foreground mt-1 block text-xs">
                      {BILLING_TRIAL_START_COPY.cardTrialPlanHint}
                    </span>
                  ) : null}
                </p>
              ) : null}
            </CardContent>
          </div>
          <div className="bg-muted/30 flex w-full flex-col justify-center gap-3 border-t p-6 md:w-64 md:border-t-0 md:border-l">
            <p className="text-muted-foreground text-xs">
              {BILLING_TRIAL_START_COPY.noPaymentRequired}
            </p>
            <Button type="button" variant="accent" onClick={openConfirmDialog}>
              {BILLING_TRIAL_START_COPY.startButtonLabel}
            </Button>
          </div>
        </div>
      </Card>

      <BillingTrialStartConfirmDialog
        open={confirmOpen}
        onOpenChange={handleConfirmDialogOpenChange}
        trialSchedule={trialSchedule}
        errorMessage={errorMessage}
        isPending={mutation.isPending}
        onCancel={() => handleConfirmDialogOpenChange(false)}
        onConfirm={confirmStartTrial}
      />
    </>
  );
}
