"use client";

import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import {
  PLAN_TIER_CARD_LABELS,
  planTierCardNameId,
  planTierCardShellBaseClass,
  planTierCardShellSelectedClass,
} from "./_constants/planTierCard";
import {
  buildPlanTierCardDisplay,
  selectBillingTierPlanButtonLabel,
} from "./_utils/buildPlanTierCardDisplay";

import type { PlanTierCardProps } from "./_types/planTierCard";
import type { KeyboardEvent } from "react";

export function PlanTierCard({ tier, selected, onSelect }: PlanTierCardProps) {
  const display = buildPlanTierCardDisplay(tier);
  const nameId = planTierCardNameId(tier.id);

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect();
    }
  }

  return (
    <Card
      role="radio"
      aria-checked={selected}
      aria-labelledby={nameId}
      tabIndex={selected ? 0 : -1}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
      className={cn(planTierCardShellBaseClass, selected && planTierCardShellSelectedClass)}
    >
      <CardHeader className="gap-1.5 pb-3">
        <CardTitle id={nameId} className="text-primary text-lg leading-snug font-semibold">
          {tier.name}
        </CardTitle>
        {display.metaLine ? (
          <p className="text-muted-foreground truncate text-xs leading-snug font-medium">
            {display.metaLine}
          </p>
        ) : null}
      </CardHeader>

      <CardFooter className="mt-auto flex-col items-stretch gap-3 border-t pt-4 pb-6">
        <div className="space-y-2">
          {display.weekly ? (
            <p className="text-muted-foreground text-sm font-normal tabular-nums">
              {display.weekly}
            </p>
          ) : null}
          <p className="text-primary text-2xl leading-none font-bold tracking-tight tabular-nums">
            {display.price}
          </p>
        </div>
        <Button
          type="button"
          variant="accent"
          className="w-full"
          tabIndex={-1}
          aria-hidden
          onClick={(event) => {
            event.stopPropagation();
            onSelect();
          }}
        >
          {selected ? PLAN_TIER_CARD_LABELS.selected : selectBillingTierPlanButtonLabel(tier.name)}
        </Button>
      </CardFooter>
    </Card>
  );
}
