"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

import { PlanTierCard } from "../../_components/plan-tier-card/PlanTierCard";
import { planTierGridColumnClass } from "../../_utils/create-subscription/planTierCard";

import type { AvailableBillingTier, SubscriptionTierCategory } from "@/types/api/account";

type SelectTimeframeStepProps = {
  tiersListLength: number;
  displayTiers: AvailableBillingTier[];
  selectedTierId: string | null;
  showPlanCategoryToggle: boolean;
  effectivePlanCategory: SubscriptionTierCategory | null;
  onPlanCategoryChange: (category: SubscriptionTierCategory) => void;
  onSelectTierId: (tierId: string) => void;
  onContinue: () => void;
};

export function SelectTimeframeStep({
  tiersListLength,
  displayTiers,
  selectedTierId,
  showPlanCategoryToggle,
  effectivePlanCategory,
  onPlanCategoryChange,
  onSelectTierId,
  onContinue,
}: SelectTimeframeStepProps) {
  return (
    <div className="bg-muted/35 rounded-lg border border-transparent p-5 sm:p-6">
      <div className="space-y-1">
        <h2 className="font-brand text-lg font-semibold">1. Choose Season Pass</h2>
        <p className="text-muted-foreground text-sm">
          Choose the pass timeframe and coverage that fits this organisation. The selected pass
          controls the coverage window shown again before payment.
        </p>
      </div>
      <div className="mt-4 grid gap-4">
        {tiersListLength === 0 ? (
          <p className="text-muted-foreground text-sm" role="status">
            No Season Pass plans are available for this account right now. Return to billing or
            contact support if you expected purchase options here.
          </p>
        ) : (
          <div className="space-y-4">
            {showPlanCategoryToggle && effectivePlanCategory ? (
              <div className="space-y-2">
                <Label className="text-xs font-medium">Organisation type</Label>
                <ToggleGroup
                  type="single"
                  variant="outline"
                  spacing={0}
                  value={effectivePlanCategory}
                  onValueChange={(value) => {
                    if (value === "Club" || value === "Association") {
                      onPlanCategoryChange(value);
                    }
                  }}
                >
                  <ToggleGroupItem value="Club" className="px-4">
                    Club
                  </ToggleGroupItem>
                  <ToggleGroupItem value="Association" className="px-4">
                    Association
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
            ) : null}
            <div
              className={cn("grid gap-3", planTierGridColumnClass(displayTiers.length))}
              role="radiogroup"
              aria-label="Subscription tier"
            >
              {displayTiers.map((tier) => (
                <PlanTierCard
                  key={tier.id}
                  tier={tier}
                  selected={selectedTierId === tier.id}
                  onSelect={() => onSelectTierId(tier.id)}
                />
              ))}
            </div>
          </div>
        )}
        <div className="flex justify-center">
          <Button
            type="button"
            disabled={!selectedTierId || tiersListLength === 0 || displayTiers.length === 0}
            onClick={onContinue}
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
