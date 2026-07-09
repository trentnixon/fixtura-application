"use client";

import Link from "next/link";
import { useMemo } from "react";

import {
  TypographyCardDescription,
  TypographyCardTitle,
  TypographyEyebrow,
  TypographyMuted,
} from "@/components/typography";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  isAccountOrganisationContextGatewayRedirect,
  useAccountOrganisationContext,
} from "@/lib/api/hooks/account/useAccountOrganisationContext";

import {
  BILLING_CREATE_SEASON_PASS_BUTTON_LABEL,
  BILLING_CREATE_SEASON_PASS_EYEBROW,
  BILLING_CREATE_SEASON_PASS_FOOTNOTE,
  BILLING_CREATE_SEASON_PASS_TITLE,
} from "../../_constants/season-pass/billingCreateSeasonPassCard";
import {
  billingCreateSeasonPassCardHref,
  formatBillingCreateSeasonPassDescription,
} from "../../_utils/season-pass/billingCreateSeasonPassCard";
import { resolveBillingTrialAccountName } from "../../_utils/trial/billingTrialStart";

import type { BillingCreateSeasonPassCardProps } from "../../_types/season-pass/billingCreateSeasonPassCard";

/**
 * CTA for users in post-trial or empty billing states: direct link to the create/checkout flow.
 */
export function BillingCreateSeasonPassCard({ accountId }: BillingCreateSeasonPassCardProps) {
  const createHref = billingCreateSeasonPassCardHref(accountId);
  const orgQ = useAccountOrganisationContext(accountId);

  const accountName = useMemo(() => {
    if (!orgQ.isSuccess || !orgQ.data || isAccountOrganisationContextGatewayRedirect(orgQ.data)) {
      return "";
    }
    return resolveBillingTrialAccountName(orgQ.data.data);
  }, [orgQ.isSuccess, orgQ.data]);

  return (
    <Card className="overflow-hidden">
      <div className="from-primary via-brand-secondary to-brand-accent h-2 w-full bg-linear-to-r" />
      <div className="flex flex-col md:flex-row">
        <div className="flex-1">
          <CardHeader>
            <TypographyEyebrow>{BILLING_CREATE_SEASON_PASS_EYEBROW}</TypographyEyebrow>
            <TypographyCardTitle className="text-primary font-brand mt-2">
              {BILLING_CREATE_SEASON_PASS_TITLE}
            </TypographyCardTitle>
            <TypographyCardDescription>
              {formatBillingCreateSeasonPassDescription(accountName)}
            </TypographyCardDescription>
          </CardHeader>
          <CardContent>
            <TypographyMuted>{BILLING_CREATE_SEASON_PASS_FOOTNOTE}</TypographyMuted>
          </CardContent>
        </div>
        <div className="bg-muted/30 flex w-full flex-col justify-center gap-3 border-t p-6 md:w-64 md:border-t-0 md:border-l">
          <Button type="button" variant="accent" asChild>
            <Link href={createHref}>{BILLING_CREATE_SEASON_PASS_BUTTON_LABEL}</Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}
