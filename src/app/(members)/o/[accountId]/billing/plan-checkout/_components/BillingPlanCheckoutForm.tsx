"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

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
        <CardTitle className="font-brand text-lg">{copy.choosePlanTitle}</CardTitle>
        <CardDescription>{copy.choosePlanDescription}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <BillingPlanCheckoutFormTierRadios
          tiers={tiers}
          selectedTierId={selectedTierId}
          onSelectTierId={onSelectTierId}
        />

        <div className="grid max-w-xs gap-2">
          <Label htmlFor={ids.startDate}>{copy.startDate.label}</Label>
          <input
            id={ids.startDate}
            type="date"
            min={minDate}
            value={startDate}
            onChange={(ev) => onStartDateChange(ev.target.value)}
            className={billingPlanCheckoutDateInputClass}
          />
          <p className="text-muted-foreground text-xs">{copy.startDate.hint}</p>
        </div>

        {checkoutError ? (
          <p className="text-destructive text-sm" role="alert">
            {checkoutError}
          </p>
        ) : null}
        {missingCheckoutUrl ? (
          <p className="text-destructive text-sm" role="alert">
            {copy.missingCheckoutUrl}
          </p>
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
