"use client";

import {
  TypographyCardDescription,
  TypographyCardTitle,
  TypographyErrorText,
} from "@/components/typography";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

import type { BillingAvailableTiersErrorCardProps } from "../../_types/available-tiers/billingAvailableTiersUi";

export function BillingAvailableTiersErrorCard({
  title,
  description,
  errorMessage,
  onRetry,
}: BillingAvailableTiersErrorCardProps) {
  return (
    <Card>
      <CardHeader>
        <TypographyCardTitle className="font-brand">{title}</TypographyCardTitle>
        <TypographyCardDescription>{description}</TypographyCardDescription>
      </CardHeader>
      <CardContent>
        <TypographyErrorText role="alert">{errorMessage}</TypographyErrorText>
        <Button type="button" variant="outline" className="mt-3" onClick={() => void onRetry()}>
          Try again
        </Button>
      </CardContent>
    </Card>
  );
}
