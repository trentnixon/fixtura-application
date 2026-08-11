"use client";

import { ChevronRight, CreditCard } from "lucide-react";

import {
  TypographyH2,
  TypographyH3,
  TypographyH4,
  TypographyLarge,
  TypographyMuted,
} from "@/components/typography";
import { Button } from "@/components/ui/button";

import { formatMoney } from "../../_utils/overview/formatBillingDisplay";

import type { AvailableBillingTier } from "@/types/api/account";

type ReviewCardPaymentStepProps = {
  selectedTier: AvailableBillingTier | undefined;
  selectedTierName: string;
  selectedTierCoverage: string;
  selectedStartDateLabel: string;
  paymentMethodLabel: string;
  paymentMethodDescription: string;
  checkoutError: string | null;
  missingCheckoutUrl: boolean;
  canSubmit: boolean;
  isPending: boolean;
  onSubmit: () => void;
  onBack: () => void;
};

export function ReviewCardPaymentStep({
  selectedTier,
  selectedTierName,
  selectedTierCoverage,
  selectedStartDateLabel,
  paymentMethodLabel,
  paymentMethodDescription,
  checkoutError,
  missingCheckoutUrl,
  canSubmit,
  isPending,
  onSubmit,
  onBack,
}: ReviewCardPaymentStepProps) {
  return (
    <div className="grid gap-6">
      <div className="mx-auto w-full max-w-4xl space-y-2 text-center md:text-left">
        <TypographyH3 className="font-brand text-lg tracking-tight">4. Review and pay</TypographyH3>
        <TypographyMuted className="text-sm">
          Confirm your plan and start date, then continue to Stripe Checkout to pay by card.
        </TypographyMuted>
      </div>

      <div className="border-border bg-card mx-auto grid max-w-4xl grid-cols-1 gap-0 overflow-hidden rounded-4xl border shadow-2xl md:grid-cols-5">
        <div className="bg-muted/40 border-border shrink-0 border-r p-10 md:col-span-2">
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-lg">
                <CreditCard className="size-4" aria-hidden />
              </div>
              <TypographyLarge className="text-sm font-bold tracking-widest uppercase">
                Subscription overview
              </TypographyLarge>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <TypographyH4 className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
                  Selected plan
                </TypographyH4>
                <TypographyH3 className="text-primary text-xl font-bold italic">
                  {selectedTierName}
                </TypographyH3>
              </div>

              {selectedTier ? (
                <dl className="border-border/60 text-foreground/90 space-y-3 border-t pt-4 text-sm">
                  {selectedTier.packageName?.trim() ? (
                    <div className="space-y-0.5">
                      <dt className="text-muted-foreground text-[0.65rem] font-bold tracking-widest uppercase">
                        Package
                      </dt>
                      <dd>{selectedTier.packageName.trim()}</dd>
                    </div>
                  ) : null}
                </dl>
              ) : (
                <TypographyMuted className="text-xs leading-relaxed">
                  Plan details will appear here once a tier is selected.
                </TypographyMuted>
              )}
            </div>

            <div className="pt-12 md:pt-20">
              <div className="border-border flex flex-col gap-1 border-t pt-6">
                <TypographyMuted className="text-xs font-bold tracking-widest uppercase">
                  Total
                </TypographyMuted>
                <TypographyH2 className="text-primary text-3xl font-black tracking-tighter tabular-nums md:text-4xl">
                  {selectedTier ? formatMoney(selectedTier.price, selectedTier.currency) : "-"}
                </TypographyH2>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-10 md:col-span-3 dark:bg-black/20">
          <div className="grid gap-6">
            {selectedTier ? (
              <dl className="border-border/60 space-y-3 border-b pb-6 text-sm">
                <div className="space-y-0.5">
                  <dt className="text-muted-foreground text-[0.65rem] font-bold tracking-widest uppercase">
                    Coverage
                  </dt>
                  <dd className="font-medium">{selectedTierCoverage}</dd>
                </div>
                {selectedTier.priceByWeekInPass != null ? (
                  <div className="space-y-0.5">
                    <dt className="text-muted-foreground text-[0.65rem] font-bold tracking-widest uppercase">
                      Per week
                    </dt>
                    <dd className="text-primary font-semibold tabular-nums">
                      {formatMoney(selectedTier.priceByWeekInPass, selectedTier.currency)}/week
                    </dd>
                  </div>
                ) : null}
                <div className="space-y-0.5">
                  <dt className="text-muted-foreground text-[0.65rem] font-bold tracking-widest uppercase">
                    Start date
                  </dt>
                  <dd className="font-medium">{selectedStartDateLabel}</dd>
                </div>
                <div className="space-y-0.5">
                  <dt className="text-muted-foreground text-[0.65rem] font-bold tracking-widest uppercase">
                    Payment method
                  </dt>
                  <dd className="font-medium">{paymentMethodLabel}</dd>
                  <dd className="text-muted-foreground text-xs">{paymentMethodDescription}</dd>
                </div>
              </dl>
            ) : null}

            {checkoutError ? (
              <p className="text-destructive text-sm" role="alert">
                {checkoutError}
              </p>
            ) : null}
            {missingCheckoutUrl ? (
              <p className="text-destructive text-sm" role="alert">
                Checkout URL missing from the server response. Please try again or contact support.
              </p>
            ) : null}

            <div className="flex flex-col gap-4">
              <Button
                type="button"
                variant="brand"
                size="lg"
                disabled={!canSubmit}
                onClick={onSubmit}
                className="shadow-primary/20 h-14 w-full text-lg font-black tracking-[0.2em] uppercase shadow-2xl"
              >
                {isPending ? "Starting checkout..." : "Continue to payment"}
                {!isPending ? <ChevronRight className="ml-2 h-5 w-5" aria-hidden /> : null}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="text-muted-foreground w-full text-xs font-bold tracking-widest uppercase"
                onClick={onBack}
              >
                Back
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
