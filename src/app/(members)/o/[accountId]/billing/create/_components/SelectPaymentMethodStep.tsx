"use client";

import { CreditCard, FileText } from "lucide-react";

import { MetricComparisonCard } from "@/components/cards";
import { TypographyMuted } from "@/components/typography";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { PaymentPath } from "../_types/createSubscriptionWizard";
import type { ReactNode } from "react";

type SelectPaymentMethodStepProps = {
  canCard: boolean;
  canInvoice: boolean;
  paymentPath: PaymentPath | null;
  onPaymentPathChange: (path: PaymentPath) => void;
  onBack: () => void;
  onContinue: () => void;
};

function PaymentPathOptionCell(props: {
  path: PaymentPath;
  selected: boolean;
  eyebrow: string;
  icon: ReactNode;
  title: string;
  description: string;
  onSelect: (path: PaymentPath) => void;
}) {
  const { path, selected, eyebrow, icon, title, description, onSelect } = props;
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={() => onSelect(path)}
      className={cn(
        "group h-full min-h-0 w-full cursor-pointer rounded-lg border text-left",
        "flex flex-col gap-3 p-4 text-base leading-snug font-normal",
        "transition-[background-color,border-color,box-shadow,transform] duration-150 ease-out",
        "hover:border-primary/35 hover:bg-muted/55 hover:shadow-md",
        "active:bg-muted/75 active:scale-[0.99] active:shadow-sm",
        "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
        selected
          ? "border-primary bg-primary/12 ring-primary/35 ring-offset-background shadow-md ring-2 ring-offset-2"
          : "bg-muted/20 border-transparent",
      )}
    >
      <span className="text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">
        {eyebrow}
      </span>
      <div className="text-foreground flex min-h-0 flex-1 items-start gap-3.5">
        <span className="bg-primary/12 text-primary group-hover:bg-primary/18 flex size-12 shrink-0 items-center justify-center rounded-xl transition-colors">
          {icon}
        </span>
        <span className="min-w-0 flex-1 space-y-2">
          <span className="block text-lg leading-tight font-semibold tracking-tight">{title}</span>
          <span className="text-muted-foreground block text-sm leading-relaxed font-normal">
            {description}
          </span>
        </span>
      </div>
    </button>
  );
}

export function SelectPaymentMethodStep({
  canCard,
  canInvoice,
  paymentPath,
  onPaymentPathChange,
  onBack,
  onContinue,
}: SelectPaymentMethodStepProps) {
  const bothPaths = canCard && canInvoice;

  return (
    <div className="bg-muted/35 rounded-lg border border-transparent p-5 sm:p-6">
      <div className="space-y-1">
        <h2 className="font-brand text-lg font-semibold">3. Payment path</h2>
        <p className="text-muted-foreground text-sm">
          Choose how this Season Pass should be paid for.
        </p>
      </div>

      <div className="mt-4 grid gap-4">
        {bothPaths ? (
          <div className="mb-8" role="radiogroup" aria-label="Payment path">
            <MetricComparisonCard
              className="shadow-sm"
              layout="card"
              title="Select payment method"
              icon={<CreditCard className="text-primary size-5" aria-hidden />}
              bodyClassName="pb-7 [&>div]:gap-4 sm:[&>div]:gap-5 [&>div>div]:p-0"
              primary={{
                label: null,
                value: (
                  <PaymentPathOptionCell
                    path="card"
                    selected={paymentPath === "card"}
                    eyebrow="Pay with card"
                    icon={<CreditCard className="size-6" aria-hidden />}
                    title="Card (Stripe Checkout)"
                    description="Pay online; you will be redirected to Stripe."
                    onSelect={onPaymentPathChange}
                  />
                ),
              }}
              secondary={{
                label: null,
                value: (
                  <PaymentPathOptionCell
                    path="invoice"
                    selected={paymentPath === "invoice"}
                    eyebrow="Request invoice"
                    icon={<FileText className="size-6" aria-hidden />}
                    title="Online invoice request"
                    description="We email the invoice; it appears on your billing page."
                    onSelect={onPaymentPathChange}
                  />
                ),
              }}
              footer={
                <TypographyMuted className="text-xs leading-relaxed">
                  Select one option above, then Continue.
                </TypographyMuted>
              }
            />
          </div>
        ) : (
          <div className="mb-8 grid gap-3" role="radiogroup" aria-label="Payment path">
            {canCard ? (
              <button
                type="button"
                role="radio"
                aria-checked={paymentPath === "card"}
                onClick={() => onPaymentPathChange("card")}
                className={cn(
                  "border-border w-full cursor-pointer rounded-lg border bg-white p-5 text-left transition-[background-color,border-color,box-shadow,transform] duration-150 ease-out dark:bg-black/20",
                  "hover:border-primary/35 hover:bg-muted/45 hover:shadow-md",
                  "active:bg-muted/60 active:scale-[0.99] active:shadow-sm",
                  "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
                  paymentPath === "card" &&
                    "border-primary bg-primary/10 ring-primary/35 ring-offset-background shadow-md ring-2 ring-offset-2",
                )}
              >
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-xl">
                    <CreditCard className="size-6" aria-hidden />
                  </div>
                  <div className="min-w-0 space-y-2">
                    <p className="text-foreground text-lg leading-tight font-semibold tracking-tight">
                      Card (Stripe Checkout)
                    </p>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Pay online; you will be redirected to Stripe.
                    </p>
                  </div>
                </div>
              </button>
            ) : null}
            {canInvoice ? (
              <button
                type="button"
                role="radio"
                aria-checked={paymentPath === "invoice"}
                onClick={() => onPaymentPathChange("invoice")}
                className={cn(
                  "border-border w-full cursor-pointer rounded-lg border bg-white p-5 text-left transition-[background-color,border-color,box-shadow,transform] duration-150 ease-out dark:bg-black/20",
                  "hover:border-primary/35 hover:bg-muted/45 hover:shadow-md",
                  "active:bg-muted/60 active:scale-[0.99] active:shadow-sm",
                  "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
                  paymentPath === "invoice" &&
                    "border-primary bg-primary/10 ring-primary/35 ring-offset-background shadow-md ring-2 ring-offset-2",
                )}
              >
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-xl">
                    <FileText className="size-6" aria-hidden />
                  </div>
                  <div className="min-w-0 space-y-2">
                    <p className="text-foreground text-lg leading-tight font-semibold tracking-tight">
                      Online invoice request
                    </p>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      We will email the invoice and it will show on your billing page.
                    </p>
                  </div>
                </div>
              </button>
            ) : null}
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button type="button" disabled={paymentPath == null} onClick={onContinue}>
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
