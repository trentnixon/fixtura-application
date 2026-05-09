import {
  TypographyCaption,
  TypographyCardDescription,
  TypographyCardTitle,
  TypographyDataLabel,
  TypographyDataValue,
  TypographyMuted,
} from "@/components/typography";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { BILLING_TRIAL_DETAILS_COPY } from "../../_constants/trial/billingTrialDetails";
import { buildActiveTrialStatusCardViewModel } from "../../_utils/overview/billingOverviewStatusCards";
import { formatBillingDateLong } from "../../_utils/overview/formatBillingDisplay";
import {
  billingTrialDetailsBadgeLabel,
  billingTrialDetailsBadgeVariant,
  formatTrialDaysRemainingLine,
} from "../../_utils/trial/billingTrialDetails";

import type { BillingActiveTrialStatusCardProps } from "../../_types/overview/billingSections";

export function BillingActiveTrialStatusCard({ trial }: BillingActiveTrialStatusCardProps) {
  const uiMode = "active_trial" as const;
  const { daysRemaining, remainingPercent, tierLabel } = buildActiveTrialStatusCardViewModel(trial);

  return (
    <Card className="overflow-hidden md:col-span-2">
      <div className="from-primary via-brand-secondary to-brand-accent h-2 w-full bg-linear-to-r" />
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <TypographyCardTitle className="font-brand">Billing status</TypographyCardTitle>
          <Badge variant={billingTrialDetailsBadgeVariant(uiMode)}>
            {billingTrialDetailsBadgeLabel(uiMode)}
          </Badge>
        </div>
        <TypographyCardDescription>
          Your organisation is on an active trial.
        </TypographyCardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 text-sm">
        <div className="flex flex-wrap items-center gap-2">
          <TypographyDataLabel as="span" className="font-medium">
            {BILLING_TRIAL_DETAILS_COPY.assetProcessEnabledLabel}
          </TypographyDataLabel>
          <Badge
            variant="secondary"
            className="bg-success-600 hover:bg-success-600/90 border-transparent text-white"
          >
            {BILLING_TRIAL_DETAILS_COPY.assetProcessEnabledBadgeLabel}
          </Badge>
        </div>

        {trial ? (
          <div className="border-border border-t pt-3">
            {tierLabel ? (
              <TypographyDataValue as="p" className="mb-3">
                {tierLabel}
              </TypographyDataValue>
            ) : null}
            <dl className="text-muted-foreground grid gap-3 sm:grid-cols-2">
              <div>
                <TypographyDataLabel as="dt" className="text-foreground font-medium">
                  {BILLING_TRIAL_DETAILS_COPY.trialStartsLabel}
                </TypographyDataLabel>
                <TypographyDataValue as="dd" className="mt-1">
                  {formatBillingDateLong(trial.startDate)}
                </TypographyDataValue>
              </div>
              <div>
                <TypographyDataLabel as="dt" className="text-foreground font-medium">
                  {BILLING_TRIAL_DETAILS_COPY.trialEndsLabel}
                </TypographyDataLabel>
                <TypographyDataValue as="dd" className="mt-1">
                  {formatBillingDateLong(trial.endDate)}
                </TypographyDataValue>
              </div>
            </dl>
            {remainingPercent != null ? (
              <div className="mt-4 grid gap-2">
                <div
                  aria-label={`Trial time remaining: ${Math.round(remainingPercent)} percent`}
                  aria-valuemax={100}
                  aria-valuemin={0}
                  aria-valuenow={Math.round(remainingPercent)}
                  className="bg-muted h-2 w-full overflow-hidden rounded-full"
                  role="progressbar"
                >
                  <div
                    className="bg-success-600 h-full rounded-full transition-[width] duration-300 ease-out"
                    style={{ width: `${remainingPercent}%` }}
                  />
                </div>
              </div>
            ) : null}
            {daysRemaining != null ? (
              <TypographyMuted className="mt-3">
                {formatTrialDaysRemainingLine(daysRemaining)}
              </TypographyMuted>
            ) : null}
          </div>
        ) : (
          <TypographyCaption role="status">
            Trial dates were not returned in this summary; access may still be on trial based on
            billing codes.
          </TypographyCaption>
        )}
      </CardContent>
    </Card>
  );
}
