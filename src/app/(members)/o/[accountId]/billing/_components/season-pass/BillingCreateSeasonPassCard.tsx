"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import {
  BILLING_CREATE_SEASON_PASS_BUTTON_LABEL,
  BILLING_CREATE_SEASON_PASS_DESCRIPTION,
  BILLING_CREATE_SEASON_PASS_EYEBROW,
  BILLING_CREATE_SEASON_PASS_FOOTNOTE,
  BILLING_CREATE_SEASON_PASS_TITLE,
} from "../../_constants/billingCreateSeasonPassCard";
import { billingCreateSeasonPassCardHref } from "../../_utils/billingCreateSeasonPassCard";

import type { BillingCreateSeasonPassCardProps } from "../../_types/billingCreateSeasonPassCard";

/**
 * CTA for users in post-trial or empty billing states: direct link to the create/checkout flow.
 */
export function BillingCreateSeasonPassCard({ accountId }: BillingCreateSeasonPassCardProps) {
  const createHref = billingCreateSeasonPassCardHref(accountId);

  return (
    <Card className="overflow-hidden">
      <div className="from-primary via-brand-secondary to-brand-accent h-2 w-full bg-linear-to-r" />
      <div className="flex flex-col md:flex-row">
        <div className="flex-1">
          <CardHeader>
            <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
              {BILLING_CREATE_SEASON_PASS_EYEBROW}
            </p>
            <CardTitle className="text-primary font-brand mt-2 text-xl">
              {BILLING_CREATE_SEASON_PASS_TITLE}
            </CardTitle>
            <CardDescription>{BILLING_CREATE_SEASON_PASS_DESCRIPTION}</CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            <p>{BILLING_CREATE_SEASON_PASS_FOOTNOTE}</p>
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
