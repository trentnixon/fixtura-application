"use client";

import { TypographyCaption, TypographyDataValue, TypographyMuted } from "@/components/typography";
import { Badge } from "@/components/ui/badge";

import { formatBillingDateRangeLine } from "../../_utils/overview/formatBillingDisplay";
import {
  billingTrialDetailsBadgeLabel,
  billingTrialDetailsBadgeVariant,
  billingTrialDetailsDaysRemainingForDisplay,
  billingTrialEligibleCaption,
  billingTrialTierDisplayLabel,
  formatTrialDaysRemainingLine,
} from "../../_utils/trial/billingTrialDetails";

import type { TrialDetailsBodyTrialInfoProps } from "../../_types/trial/billingTrialDetails";

export function TrialDetailsBodyTrialInfo({ trial, uiMode }: TrialDetailsBodyTrialInfoProps) {
  const daysRemaining = billingTrialDetailsDaysRemainingForDisplay(uiMode, trial);
  const tierLabel = billingTrialTierDisplayLabel(trial);
  const eligibleCaption = billingTrialEligibleCaption(trial.eligible);

  return (
    <>
      {tierLabel ? (
        <TypographyDataValue as="p" className="mb-2">
          {tierLabel}
        </TypographyDataValue>
      ) : null}
      <TypographyMuted>
        {formatBillingDateRangeLine(trial.startDate, trial.endDate)}
      </TypographyMuted>
      {daysRemaining != null ? (
        <TypographyCaption className="mt-2">
          {formatTrialDaysRemainingLine(daysRemaining)}
        </TypographyCaption>
      ) : null}
      {eligibleCaption ? (
        <TypographyCaption className="mt-1">{eligibleCaption}</TypographyCaption>
      ) : null}
      <Badge className="mt-2" variant={billingTrialDetailsBadgeVariant(uiMode)}>
        {billingTrialDetailsBadgeLabel(uiMode)}
      </Badge>
    </>
  );
}
