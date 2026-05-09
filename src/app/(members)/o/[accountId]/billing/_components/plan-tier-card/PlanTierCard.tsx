"use client";

import {
  TypographyCaption,
  TypographyDataValue,
  TypographyMuted,
  TypographyOverline,
  TypographySubsectionTitle,
} from "@/components/typography";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { PLAN_TIER_CARD_LABELS } from "./_constants/planTierCard";
import {
  buildPlanTierCardDisplay,
  selectBillingTierPlanButtonLabel,
} from "./_utils/buildPlanTierCardDisplay";

import type { PlanTierCardProps } from "./_types/planTierCard";

export function PlanTierCard({ tier, selected, onSelect }: PlanTierCardProps) {
  const display = buildPlanTierCardDisplay(tier);

  return (
    <Card
      className={cn(
        "ring-primary/20 bg-primary/5 transition-[box-shadow,ring]",
        selected && "ring-primary ring-2",
      )}
    >
      <CardContent className="p-5 sm:p-6">
        <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_16rem] md:items-start">
          <div className="min-w-0 space-y-3">
            <div className="space-y-2">
              <Badge variant="outline">{tier.category}</Badge>
              <TypographySubsectionTitle as="div" className="text-primary leading-snug">
                {tier.name}
              </TypographySubsectionTitle>
              {display.metaLine ? (
                <TypographyCaption className="leading-snug font-medium">
                  {display.metaLine}
                </TypographyCaption>
              ) : null}
            </div>

            {display.description ? (
              <TypographyMuted className="max-h-30 overflow-y-auto text-sm leading-relaxed">
                {display.description}
              </TypographyMuted>
            ) : null}

            {display.sponsorAssetLine ? (
              <TypographyCaption className="text-[0.65rem] leading-snug">
                {display.sponsorAssetLine}
              </TypographyCaption>
            ) : null}
          </div>

          <div className="border-border/60 flex flex-col gap-4 pt-4 md:border-l md:pt-0 md:pl-6">
            <div className="grid gap-3">
              {display.weekly ? (
                <div>
                  <TypographyOverline>{PLAN_TIER_CARD_LABELS.perWeek}</TypographyOverline>
                  <TypographyDataValue as="p" className="text-primary text-lg">
                    {display.weekly}
                  </TypographyDataValue>
                </div>
              ) : null}
              <div>
                <TypographyOverline>{PLAN_TIER_CARD_LABELS.totalCost}</TypographyOverline>
                <TypographyDataValue as="p" className="text-lg">
                  {display.price}
                </TypographyDataValue>
              </div>
            </div>

            <Button
              type="button"
              variant="accent"
              className="w-full"
              onClick={() => {
                onSelect();
              }}
            >
              {selected
                ? PLAN_TIER_CARD_LABELS.selected
                : selectBillingTierPlanButtonLabel(tier.name)}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
