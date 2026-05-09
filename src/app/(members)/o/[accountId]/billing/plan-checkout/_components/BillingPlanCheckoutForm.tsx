"use client";

import {
  TypographyCaption,
  TypographyCardDescription,
  TypographyCardTitle,
  TypographyErrorText,
  TypographyLabel,
} from "@/components/typography";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { BillingPlanCheckoutFormTierRadios } from "./BillingPlanCheckoutFormTierRadios";
import {
  billingPlanCheckoutDateInputClass,
  billingPlanCheckoutFormCopy,
  billingPlanCheckoutFormIds,
} from "../_constants/billingPlanCheckout";

import type { BillingPlanCheckoutFormProps } from "../_types/billingPlanCheckout";

export function BillingPlanCheckoutForm({
  tiers,
  minDate,
  selectedTierId,
  onSelectTierId,
  startDate,
  onStartDateChange,
  checkoutError,
  missingCheckoutUrl,
  canSubmit,
  isCheckoutPending,
  onContinueToPayment,
}: BillingPlanCheckoutFormProps) {
  const copy = billingPlanCheckoutFormCopy;
  const ids = billingPlanCheckoutFormIds;

  return (
    <Card>
      <CardHeader>
        <TypographyCardTitle className="font-brand">{copy.choosePlanTitle}</TypographyCardTitle>
        <TypographyCardDescription>{copy.choosePlanDescription}</TypographyCardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <BillingPlanCheckoutFormTierRadios
          tiers={tiers}
          selectedTierId={selectedTierId}
          onSelectTierId={onSelectTierId}
        />

        <div className="grid max-w-xs gap-2">
          <TypographyLabel htmlFor={ids.startDate}>{copy.startDate.label}</TypographyLabel>
          <input
            id={ids.startDate}
            type="date"
            min={minDate}
            value={startDate}
            onChange={(ev) => onStartDateChange(ev.target.value)}
            className={billingPlanCheckoutDateInputClass}
          />
          <TypographyCaption>{copy.startDate.hint}</TypographyCaption>
        </div>

        {checkoutError ? (
          <TypographyErrorText role="alert">{checkoutError}</TypographyErrorText>
        ) : null}
        {missingCheckoutUrl ? (
          <TypographyErrorText role="alert">{copy.missingCheckoutUrl}</TypographyErrorText>
        ) : null}

        <div>
          <Button
            type="button"
            disabled={!canSubmit || tiers.length === 0}
            onClick={() => void onContinueToPayment()}
          >
            {isCheckoutPending ? copy.startingCheckout : copy.continueToPayment}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
