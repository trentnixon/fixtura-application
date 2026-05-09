"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import type { BillingAvailableTiersErrorCardProps } from "../../_types/billingAvailableTiersUi";

export function BillingAvailableTiersErrorCard({
  title,
  description,
  errorMessage,
  onRetry,
}: BillingAvailableTiersErrorCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-brand text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-destructive text-sm" role="alert">
          {errorMessage}
        </p>
        <Button type="button" variant="outline" className="mt-3" onClick={() => void onRetry()}>
          Try again
        </Button>
      </CardContent>
    </Card>
  );
}
