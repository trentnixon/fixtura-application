"use client";

import { ChevronRight, FileText } from "lucide-react";

import {
  TypographyH2,
  TypographyH3,
  TypographyH4,
  TypographyLarge,
  TypographyMuted,
} from "@/components/typography";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import { StaffImmediateInvoicePanel } from "./StaffImmediateInvoicePanel";
import { formatMoney } from "../../_utils/overview/formatBillingDisplay";

import type { AvailableBillingTier } from "@/types/api/account";

type ReviewInvoiceRequestStepProps = {
  accountId: string;
  selectedTier: AvailableBillingTier | undefined;
  selectedTierName: string;
  selectedTierCoverage: string;
  selectedStartDateLabel: string;
  paymentMethodLabel: string;
  paymentMethodDescription: string;
  billingContactName: string;
  billingEmail: string;
  billingOrganisationName: string;
  notes: string;
  onBillingContactNameChange: (value: string) => void;
  onBillingEmailChange: (value: string) => void;
  onBillingOrganisationNameChange: (value: string) => void;
  onNotesChange: (value: string) => void;
  invoiceError: string | null;
  showStripeImmediateInvoice: boolean;
  stripeImmediateError: string | null;
  stripeHostedUrl: string | null;
  stripeInvoicePaidDetected: boolean;
  stripeImmediatePending: boolean;
  canSubmitStripeImmediate: boolean;
  onSubmitStripeImmediateInvoice: () => void;
  canSubmitInvoice: boolean;
  invoicePending: boolean;
  onSubmitInvoice: () => void;
  onBack: () => void;
};

const inputClass =
  "border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-full border px-4 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50";

const textareaClass =
  "border-input bg-background ring-offset-background focus-visible:ring-ring min-h-[88px] w-full rounded-lg border px-4 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50";

export function ReviewInvoiceRequestStep({
  accountId,
  selectedTier,
  selectedTierName,
  selectedTierCoverage,
  selectedStartDateLabel,
  paymentMethodLabel,
  paymentMethodDescription,
  billingContactName,
  billingEmail,
  billingOrganisationName,
  notes,
  onBillingContactNameChange,
  onBillingEmailChange,
  onBillingOrganisationNameChange,
  onNotesChange,
  invoiceError,
  showStripeImmediateInvoice,
  stripeImmediateError,
  stripeHostedUrl,
  stripeInvoicePaidDetected,
  stripeImmediatePending,
  canSubmitStripeImmediate,
  onSubmitStripeImmediateInvoice,
  canSubmitInvoice,
  invoicePending,
  onSubmitInvoice,
  onBack,
}: ReviewInvoiceRequestStepProps) {
  return (
    <div className="grid gap-6">
      <div className="mx-auto w-full max-w-4xl space-y-2 text-center md:text-left">
        <TypographyH3 className="font-brand text-lg tracking-tight">
          4. Review and submit invoice request
        </TypographyH3>
        <TypographyMuted className="text-sm">
          Confirm your plan and start date, then add invoice contact details. Your request comes to
          us; we raise the invoice (e.g. in Hnry) and send it to you. It will also appear with your
          outstanding billing items.
        </TypographyMuted>
      </div>

      <div className="border-border bg-card mx-auto grid max-w-4xl grid-cols-1 gap-0 overflow-hidden rounded-4xl border shadow-2xl md:grid-cols-5">
        <div className="bg-muted/40 border-border shrink-0 border-r p-10 md:col-span-2">
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-lg">
                <FileText className="size-4" aria-hidden />
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
                  <div className="space-y-0.5">
                    <dt className="text-muted-foreground text-[0.65rem] font-bold tracking-widest uppercase">
                      Coverage
                    </dt>
                    <dd>{selectedTierCoverage}</dd>
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
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="grid gap-2">
                <Label
                  htmlFor="wizard-contact-name"
                  className="text-xs font-bold tracking-wider uppercase opacity-60"
                >
                  Billing contact name
                </Label>
                <input
                  id="wizard-contact-name"
                  type="text"
                  autoComplete="name"
                  value={billingContactName}
                  onChange={(ev) => onBillingContactNameChange(ev.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="grid gap-2">
                <Label
                  htmlFor="wizard-billing-email"
                  className="text-xs font-bold tracking-wider uppercase opacity-60"
                >
                  Billing email
                </Label>
                <input
                  id="wizard-billing-email"
                  type="email"
                  autoComplete="email"
                  value={billingEmail}
                  onChange={(ev) => onBillingEmailChange(ev.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label
                htmlFor="wizard-org-name"
                className="text-xs font-bold tracking-wider uppercase opacity-60"
              >
                Organisation name
              </Label>
              <input
                id="wizard-org-name"
                type="text"
                autoComplete="organization"
                value={billingOrganisationName}
                onChange={(ev) => onBillingOrganisationNameChange(ev.target.value)}
                className={inputClass}
              />
            </div>

            <div className="grid gap-2">
              <Label
                htmlFor="wizard-notes"
                className="text-xs font-bold tracking-wider uppercase opacity-60"
              >
                Notes (optional)
              </Label>
              <textarea
                id="wizard-notes"
                value={notes}
                onChange={(ev) => onNotesChange(ev.target.value)}
                className={textareaClass}
              />
            </div>

            {invoiceError ? (
              <p className="text-destructive text-sm" role="alert">
                {invoiceError}
              </p>
            ) : null}

            {showStripeImmediateInvoice ? (
              <StaffImmediateInvoicePanel
                accountId={accountId}
                stripeImmediateError={stripeImmediateError}
                stripeHostedUrl={stripeHostedUrl}
                stripeInvoicePaidDetected={stripeInvoicePaidDetected}
                stripeImmediatePending={stripeImmediatePending}
                canSubmitStripeImmediate={canSubmitStripeImmediate}
                onSubmitStripeImmediateInvoice={onSubmitStripeImmediateInvoice}
              />
            ) : null}

            <div className="flex flex-col gap-4">
              <Button
                type="button"
                variant="brand"
                size="lg"
                disabled={!canSubmitInvoice}
                onClick={onSubmitInvoice}
                className="shadow-primary/20 h-14 w-full text-lg font-black tracking-[0.2em] uppercase shadow-2xl"
              >
                {invoicePending ? "Submitting..." : "Submit invoice request"}
                {!invoicePending ? <ChevronRight className="ml-2 h-5 w-5" aria-hidden /> : null}
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
