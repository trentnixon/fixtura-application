"use client";

import { CreditCard, FileText, Wallet } from "lucide-react";

import { MetricComparisonCard } from "@/components/cards";
import { TypographyMuted } from "@/components/typography";
import { Button } from "@/components/ui/button";
import {
  BRANDING_CONTAINER_HEADER_CLASS_NAME,
  BrandingContainerHeaderTitle,
} from "@/features/branding/components/branding-container-header-title";
import { cn } from "@/lib/utils";

import {
  CREATE_SUBSCRIPTION_PAYMENT_METHOD_FOOTER_COPY,
  createSubscriptionPaymentOptionBaseClass,
  createSubscriptionPaymentOptionSelectedClass,
} from "../_constants/createSubscriptionPaymentMethod";

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
  icon: ReactNode;
  title: string;
  description: string;
  onSelect: (path: PaymentPath) => void;
}) {
  const { path, selected, icon, title, description, onSelect } = props;

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={() => onSelect(path)}
      className={cn(
        createSubscriptionPaymentOptionBaseClass,
        selected && createSubscriptionPaymentOptionSelectedClass,
      )}
    >
      <span className="bg-primary/10 text-primary flex size-11 shrink-0 items-center justify-center rounded-xl">
        {icon}
      </span>
      <span className="min-w-0 space-y-1.5">
        <span className="text-foreground block text-base leading-snug font-semibold">{title}</span>
        <span className="text-muted-foreground block text-sm leading-relaxed">{description}</span>
      </span>
    </button>
  );
}

function paymentPathOptions(props: {
  canCard: boolean;
  canInvoice: boolean;
  paymentPath: PaymentPath | null;
  onPaymentPathChange: (path: PaymentPath) => void;
}) {
  const { canCard, canInvoice, paymentPath, onPaymentPathChange } = props;

  return (
    <div
      className={cn("grid gap-3", canCard && canInvoice ? "md:grid-cols-2" : "grid-cols-1")}
      role="radiogroup"
      aria-label="Payment path"
    >
      {canCard ? (
        <PaymentPathOptionCell
          path="card"
          selected={paymentPath === "card"}
          icon={<CreditCard className="size-5" aria-hidden />}
          title="Card (Stripe Checkout)"
          description="Pay online; you will be redirected to Stripe."
          onSelect={onPaymentPathChange}
        />
      ) : null}
      {canInvoice ? (
        <PaymentPathOptionCell
          path="invoice"
          selected={paymentPath === "invoice"}
          icon={<FileText className="size-5" aria-hidden />}
          title="Online invoice request"
          description="We email the invoice; it appears on your billing page."
          onSelect={onPaymentPathChange}
        />
      ) : null}
    </div>
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
  return (
    <div className="bg-muted/35 rounded-lg border border-transparent p-5 sm:p-6">
      <div className="space-y-1">
        <h2 className="font-brand text-lg font-semibold">3. Payment path</h2>
        <p className="text-muted-foreground text-sm">
          Choose how this Season Pass should be paid for.
        </p>
      </div>

      <MetricComparisonCard
        className="ring-border mt-4 w-full min-w-0 rounded-2xl border-none shadow-xl ring-1"
        layout="card"
        headerClassName={BRANDING_CONTAINER_HEADER_CLASS_NAME}
        titleRowClassName="items-start"
        title={
          <BrandingContainerHeaderTitle
            icon={<Wallet className="size-5" aria-hidden />}
            title="Select payment method"
            description="Pick card checkout or request an invoice for this Season Pass."
          />
        }
        body={paymentPathOptions({
          canCard,
          canInvoice,
          paymentPath,
          onPaymentPathChange,
        })}
        footer={
          <TypographyMuted className="text-center text-xs leading-relaxed">
            {CREATE_SUBSCRIPTION_PAYMENT_METHOD_FOOTER_COPY}
          </TypographyMuted>
        }
        footerClassName="items-center text-center"
      />

      <div className="mt-6 flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="button" disabled={paymentPath == null} onClick={onContinue}>
          Continue
        </Button>
      </div>
    </div>
  );
}
