"use client";

import { Badge } from "@/components/ui/badge";

import {
  billingTrialDetailsBadgeLabel,
  billingTrialDetailsBadgeVariant,
  billingTrialDetailsDaysRemainingForDisplay,
  billingTrialEligibleCaption,
  billingTrialTierDisplayLabel,
  formatTrialDaysRemainingLine,
} from "../../_utils/billingTrialDetails";
import { formatBillingDateRangeLine } from "../../_utils/formatBillingDisplay";

import type { TrialDetailsBodyTrialInfoProps } from "../../_types/billingTrialDetails";

export function TrialDetailsBodyTrialInfo({ trial, uiMode }: TrialDetailsBodyTrialInfoProps) {
  const daysRemaining = billingTrialDetailsDaysRemainingForDisplay(uiMode, trial);
  const tierLabel = billingTrialTierDisplayLabel(trial);
  const eligibleCaption = billingTrialEligibleCaption(trial.eligible);

  return (
    <>
      {tierLabel ? <p className="text-foreground mb-2 font-medium">{tierLabel}</p> : null}
      <p>{formatBillingDateRangeLine(trial.startDate, trial.endDate)}</p>
      {daysRemaining != null ? (
        <p className="mt-2 text-xs">{formatTrialDaysRemainingLine(daysRemaining)}</p>
      ) : null}
      {eligibleCaption ? <p className="mt-1 text-xs">{eligibleCaption}</p> : null}
      <Badge className="mt-2" variant={billingTrialDetailsBadgeVariant(uiMode)}>
        {billingTrialDetailsBadgeLabel(uiMode)}
      </Badge>
    </>
  );
}
