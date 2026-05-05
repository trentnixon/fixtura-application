"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export type BillingCreateSeasonPassCardProps = {
  accountId: string;
};

/**
 * CTA for users in post-trial or empty billing states: direct link to the create/checkout flow.
 */
export function BillingCreateSeasonPassCard({ accountId }: BillingCreateSeasonPassCardProps) {
  const createHref = `/o/${encodeURIComponent(accountId)}/billing/create`;

  return (
    <Card className="overflow-hidden">
      <div className="from-primary via-brand-secondary to-brand-accent h-2 w-full bg-linear-to-r" />
      <div className="flex flex-col md:flex-row">
        <div className="flex-1">
          <CardHeader>
            <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
              Subscription required
            </p>
            <CardTitle className="text-primary font-brand mt-2 text-xl">
              Create your Season Pass
            </CardTitle>
            <CardDescription>
              Continue full access by setting up your Season Pass. You&apos;ll choose how to pay on
              the next screen.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            <p>Complete checkout or invoice options from your organisation&apos;s billing setup.</p>
          </CardContent>
        </div>
        <div className="bg-muted/30 flex w-full flex-col justify-center gap-3 border-t p-6 md:w-64 md:border-t-0 md:border-l">
          <Button type="button" variant="accent" asChild>
            <Link href={createHref}>Create Season Pass</Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}
