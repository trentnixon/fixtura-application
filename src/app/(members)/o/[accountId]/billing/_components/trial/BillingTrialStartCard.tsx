"use client";

import {
  TypographyBodySmall,
  TypographyCaption,
  TypographyCardDescription,
  TypographyCardTitle,
  TypographyErrorText,
  TypographyEyebrow,
} from "@/components/typography";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { BillingTrialStartConfirmDialog } from "./BillingTrialStartConfirmDialog";
import {
  BILLING_TRIAL_START_COPY,
  BILLING_TRIAL_START_DURATION_DAYS,
} from "../../_constants/trial/billingTrialStart";
import { useBillingTrialStart } from "../../_hooks/useBillingTrialStart";
import {
  formatBillingTrialStartCardDescription,
  shouldShowBillingTrialStartPlanHint,
} from "../../_utils/trial/billingTrialStart";

import type { BillingTrialStartCardProps } from "../../_types/trial/billingTrialStart";

export function BillingTrialStartCard({
  accountId,
  enabled,
  availableActions,
  organisationTrialPresentation = "start_available",
  readOnly = false,
}: BillingTrialStartCardProps) {
  const {
    visible,
    mutation,
    feedback,
    errorMessage,
    confirmOpen,
    handleConfirmDialogOpenChange,
    openConfirmDialog,
    confirmStartTrial,
    accountName,
  } = useBillingTrialStart(accountId, enabled, availableActions, organisationTrialPresentation);

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
              <TypographyEyebrow>{BILLING_TRIAL_START_COPY.cardEyebrow}</TypographyEyebrow>
              <TypographyCardTitle className="text-primary font-brand mt-2">
                {BILLING_TRIAL_START_COPY.cardTitlePrefix} {BILLING_TRIAL_START_DURATION_DAYS}{" "}
                {BILLING_TRIAL_START_COPY.cardTitleSuffix}
              </TypographyCardTitle>
              <TypographyCardDescription>
                {formatBillingTrialStartCardDescription(accountName)}
              </TypographyCardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {feedback ? (
                <TypographyBodySmall
                  className="border-border text-foreground rounded-md border px-3 py-2 text-sm"
                  role="status"
                >
                  {feedback}
                </TypographyBodySmall>
              ) : null}
              {errorMessage && !confirmOpen ? (
                <TypographyErrorText role="alert">
                  {errorMessage}
                  {showCardTrialPlanHint ? (
                    <TypographyCaption as="span" className="mt-1 block">
                      {BILLING_TRIAL_START_COPY.cardTrialPlanHint}
                    </TypographyCaption>
                  ) : null}
                </TypographyErrorText>
              ) : null}
            </CardContent>
          </div>
          <div className="bg-muted/30 flex w-full flex-col justify-center gap-3 border-t p-6 md:w-64 md:border-t-0 md:border-l">
            <TypographyCaption>{BILLING_TRIAL_START_COPY.noPaymentRequired}</TypographyCaption>
            <Button type="button" variant="accent" disabled={readOnly} onClick={openConfirmDialog}>
              {BILLING_TRIAL_START_COPY.startButtonLabel}
            </Button>
          </div>
        </div>
      </Card>

      <BillingTrialStartConfirmDialog
        open={confirmOpen}
        onOpenChange={handleConfirmDialogOpenChange}
        accountName={accountName}
        errorMessage={errorMessage}
        isPending={mutation.isPending}
        onCancel={() => handleConfirmDialogOpenChange(false)}
        onConfirm={confirmStartTrial}
      />
    </>
  );
}
