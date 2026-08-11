"use client";

import { CircleCheck } from "lucide-react";
import Link from "next/link";

import {
  TypographyCardDescription,
  TypographyCardTitle,
  TypographyEyebrow,
} from "@/components/typography";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

type InvoiceRequestSubmittedStateProps = {
  accountId: string;
  selectedTierName: string;
  selectedTierCoverage: string;
  selectedStartDateLabel: string;
};

export function InvoiceRequestSubmittedState({
  accountId,
  selectedTierName,
  selectedTierCoverage,
  selectedStartDateLabel,
}: InvoiceRequestSubmittedStateProps) {
  const billingHref = `/o/${encodeURIComponent(accountId)}/billing`;
  const historyHref = `/o/${encodeURIComponent(accountId)}/billing/history`;

  return (
    <Card className="border-primary/25 overflow-hidden">
      <div className="from-primary via-brand-secondary to-brand-accent h-2 w-full bg-linear-to-r" />
      <CardHeader className="gap-4">
        <div className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-lg">
          <CircleCheck className="size-6" aria-hidden />
        </div>
        <div className="space-y-2">
          <TypographyEyebrow>Invoice request submitted</TypographyEyebrow>
          <TypographyCardTitle className="text-primary font-brand">
            We have your Season Pass request
          </TypographyCardTitle>
          <TypographyCardDescription>
            Our team will prepare the invoice and send it to the billing email you entered. It will
            also appear in billing history once available.
          </TypographyCardDescription>
        </div>
      </CardHeader>
      <CardContent className="grid gap-5">
        <dl className="border-border/70 bg-muted/20 grid gap-3 rounded-lg border p-4 text-sm sm:grid-cols-3">
          <div className="grid gap-0.5">
            <dt className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
              Pass
            </dt>
            <dd className="font-medium">{selectedTierName}</dd>
          </div>
          <div className="grid gap-0.5">
            <dt className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
              Coverage
            </dt>
            <dd className="font-medium">{selectedTierCoverage}</dd>
          </div>
          <div className="grid gap-0.5">
            <dt className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
              Start date
            </dt>
            <dd className="font-medium">{selectedStartDateLabel}</dd>
          </div>
        </dl>

        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href={billingHref}>Back to billing</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={historyHref}>View billing history</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
