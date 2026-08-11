"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";

type StaffImmediateInvoicePanelProps = {
  accountId: string;
  stripeImmediateError: string | null;
  stripeHostedUrl: string | null;
  stripeInvoicePaidDetected: boolean;
  stripeImmediatePending: boolean;
  canSubmitStripeImmediate: boolean;
  onSubmitStripeImmediateInvoice: () => void;
};

export function StaffImmediateInvoicePanel({
  accountId,
  stripeImmediateError,
  stripeHostedUrl,
  stripeInvoicePaidDetected,
  stripeImmediatePending,
  canSubmitStripeImmediate,
  onSubmitStripeImmediateInvoice,
}: StaffImmediateInvoicePanelProps) {
  return (
    <div
      className="border-border bg-muted/30 rounded-lg border p-4"
      role="region"
      aria-label="Staff Stripe invoice generation"
    >
      <p className="text-foreground text-sm font-medium">Staff: immediate Stripe invoice</p>
      <p className="text-muted-foreground mt-1 text-xs">
        Creates the CMS order + Stripe invoice via Strapi (`POST
        /api/orders/stripe/create-invoice`). Open the hosted invoice to pay; this app will poll
        until the order is marked paid.
      </p>
      {stripeImmediateError ? (
        <p className="text-destructive mt-2 text-sm" role="alert">
          {stripeImmediateError}
        </p>
      ) : null}
      {stripeHostedUrl ? (
        <div className="mt-3 grid gap-2">
          <Button variant="brand" size="sm" className="w-full sm:w-auto" asChild>
            <a href={stripeHostedUrl} target="_blank" rel="noopener noreferrer">
              Pay online (hosted invoice)
            </a>
          </Button>
          {stripeInvoicePaidDetected ? (
            <div className="grid gap-2">
              <p className="text-primary text-sm font-medium" role="status">
                Payment recorded - you can return to billing.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
                asChild
              >
                <Link href={`/o/${encodeURIComponent(accountId)}/billing`}>Back to billing</Link>
              </Button>
            </div>
          ) : (
            <p className="text-muted-foreground text-xs">
              Waiting for webhook confirmation after you pay... (up to ~2 minutes)
            </p>
          )}
        </div>
      ) : null}
      <div className="mt-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!canSubmitStripeImmediate}
          onClick={onSubmitStripeImmediateInvoice}
          className="w-full sm:w-auto"
        >
          {stripeImmediatePending ? "Generating invoice..." : "Generate Stripe invoice"}
        </Button>
      </div>
    </div>
  );
}
