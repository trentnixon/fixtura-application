"use client";

import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { BrandedLoader } from "@/components/ui/branded-loader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api/client/api-error";
import {
  isAccountBillingGatewayRedirect,
  useAccountBilling,
} from "@/lib/api/hooks/account/useAccountBilling";
import {
  isAccountBillingAvailableTiersGatewayRedirect,
  useAccountBillingAvailableTiers,
} from "@/lib/api/hooks/account/useAccountBillingAvailableTiers";
import { usePostAccountBillingCheckout } from "@/lib/api/hooks/account/usePostAccountBillingCheckout";
import { usePostAccountBillingInvoiceRequest } from "@/lib/api/hooks/account/usePostAccountBillingInvoiceRequest";
import { queryKeys } from "@/lib/api/query/query-keys";
import { AUTH_ERROR_MESSAGES } from "@/lib/auth/auth-errors";
import { isValidAccountIdSegment } from "@/lib/config/account-routes";
import {
  SELECT_ORG_GATEWAY_REASON,
  selectOrganisationUrlWithReason,
} from "@/lib/config/gateway-reasons";
import { cn } from "@/lib/utils";

import { BillingDebugPanel } from "../billing-debug-panel";
import { shouldShowInvoiceRequest } from "../billing-invoice-request";
import { shouldShowPlanCheckout } from "../billing-plan-checkout";
import { deriveBillingUiMode } from "../billing-state";

import type {
  AvailableBillingTier,
  PostAccountBillingInvoiceRequestBody,
} from "@/types/api/account";

function formatMoney(amount: number | null, currency: string | null): string {
  if (amount == null) return "—";
  const c = currency?.trim() || "AUD";
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency: c }).format(amount);
  } catch {
    return `${amount} ${c}`;
  }
}

function localDateInputToday(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function truncateDescription(text: string, max: number): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

function tierKey(tier: AvailableBillingTier): string {
  return String(tier.id);
}

const inputClass =
  "border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-full border px-4 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50";

const textareaClass =
  "border-input bg-background ring-offset-background focus-visible:ring-ring min-h-[88px] w-full rounded-lg border px-4 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50";

type PaymentPath = "card" | "invoice";

export function CreateSubscriptionWizard({ accountId }: { accountId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const segmentOk = isValidAccountIdSegment(accountId);
  const billingQ = useAccountBilling(accountId, { enabled: segmentOk });
  const redirectingRef = useRef(false);

  const [step, setStep] = useState(1);
  const [selectedTierId, setSelectedTierId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState("");
  const [paymentPath, setPaymentPath] = useState<PaymentPath | null>(null);

  const [billingContactName, setBillingContactName] = useState("");
  const [billingEmail, setBillingEmail] = useState("");
  const [billingOrganisationName, setBillingOrganisationName] = useState("");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [stateField, setStateField] = useState("");
  const [postcode, setPostcode] = useState("");
  const [country, setCountry] = useState("");
  const [purchaseOrderNumber, setPurchaseOrderNumber] = useState("");
  const [notes, setNotes] = useState("");

  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [invoiceError, setInvoiceError] = useState<string | null>(null);
  const [missingCheckoutUrl, setMissingCheckoutUrl] = useState(false);

  const summary =
    billingQ.isSuccess && billingQ.data && !isAccountBillingGatewayRedirect(billingQ.data)
      ? billingQ.data.data
      : null;
  const mode = summary ? deriveBillingUiMode(summary) : null;
  const availableActions = summary?.availableActions;

  const canCard = shouldShowPlanCheckout(availableActions);
  const canInvoice = shouldShowInvoiceRequest(availableActions);

  const wizardBlocked =
    mode === "paid_active" || mode === "free_trial_available" || mode === "payment_pending";

  useEffect(() => {
    if (!segmentOk || !summary || mode == null) return;
    if (redirectingRef.current) return;
    if (wizardBlocked) {
      redirectingRef.current = true;
      router.replace(`/o/${encodeURIComponent(accountId)}/billing`);
    }
  }, [accountId, mode, router, segmentOk, summary, wizardBlocked]);

  const tiersQ = useAccountBillingAvailableTiers(accountId, {
    enabled: segmentOk && summary != null && mode != null && !wizardBlocked,
  });
  const checkoutMutation = usePostAccountBillingCheckout(accountId);
  const invoiceMutation = usePostAccountBillingInvoiceRequest(accountId);

  const minDate = useMemo(() => localDateInputToday(), []);

  useEffect(() => {
    redirectingRef.current = false;
  }, [accountId]);

  useEffect(() => {
    if (segmentOk || redirectingRef.current) return;
    redirectingRef.current = true;
    router.replace(selectOrganisationUrlWithReason(SELECT_ORG_GATEWAY_REASON.invalidOrg));
  }, [segmentOk, router]);

  useEffect(() => {
    if (!segmentOk) return;
    if (!billingQ.isSuccess || !billingQ.data || redirectingRef.current) return;
    if (!isAccountBillingGatewayRedirect(billingQ.data)) return;
    redirectingRef.current = true;
    void queryClient.removeQueries({ queryKey: queryKeys.account.billing(accountId) });
    router.replace(selectOrganisationUrlWithReason(billingQ.data.reason));
  }, [billingQ.isSuccess, billingQ.data, accountId, queryClient, router, segmentOk]);

  useEffect(() => {
    if (!segmentOk) return;
    if (!tiersQ.isSuccess || !tiersQ.data || redirectingRef.current) return;
    if (!isAccountBillingAvailableTiersGatewayRedirect(tiersQ.data)) return;
    redirectingRef.current = true;
    void queryClient.removeQueries({
      queryKey: queryKeys.account.billingAvailableTiers(accountId),
    });
    router.replace(selectOrganisationUrlWithReason(tiersQ.data.reason));
  }, [tiersQ.isSuccess, tiersQ.data, accountId, queryClient, router, segmentOk]);

  if (!segmentOk) {
    return (
      <div className="text-muted-foreground grid gap-2 text-center text-sm" role="status">
        <p>Redirecting…</p>
        <BillingDebugPanel
          accountId={accountId}
          contextLabel="Create subscription"
          summary={null}
          isSummaryLoading={false}
          extra={{ validAccountSegment: false }}
        />
      </div>
    );
  }

  if (billingQ.isPending) {
    return (
      <>
        <BrandedLoader label="Loading billing" />
        <BillingDebugPanel
          accountId={accountId}
          contextLabel="Create subscription"
          summary={null}
          isSummaryLoading
        />
      </>
    );
  }

  if (billingQ.isSuccess && billingQ.data && isAccountBillingGatewayRedirect(billingQ.data)) {
    return (
      <div className="text-muted-foreground grid gap-2 text-center text-sm" role="status">
        <p>Redirecting…</p>
        <BillingDebugPanel
          accountId={accountId}
          contextLabel="Create subscription"
          summary={null}
          isSummaryLoading={false}
          extra={{ gateway: billingQ.data.reason }}
        />
      </div>
    );
  }

  if (billingQ.isError) {
    const err = billingQ.error;
    return (
      <>
        <ErrorState
          title="Could not load billing"
          description={err instanceof Error ? err.message : AUTH_ERROR_MESSAGES.network}
          onRetry={() => void billingQ.refetch()}
        />
        <BillingDebugPanel
          accountId={accountId}
          contextLabel="Create subscription"
          summary={null}
          isSummaryLoading={false}
          summaryError={err instanceof Error ? err.message : AUTH_ERROR_MESSAGES.network}
        />
      </>
    );
  }

  if (!billingQ.isSuccess || !billingQ.data || isAccountBillingGatewayRedirect(billingQ.data)) {
    return (
      <BillingDebugPanel
        accountId={accountId}
        contextLabel="Create subscription"
        summary={null}
        isSummaryLoading={false}
        extra={{ state: "billing_unexpected_empty" }}
      />
    );
  }

  if (wizardBlocked || mode == null) {
    return (
      <div className="text-muted-foreground grid gap-2 text-center text-sm" role="status">
        <p>Redirecting…</p>
        <BillingDebugPanel
          accountId={accountId}
          contextLabel="Create subscription"
          summary={summary}
          isSummaryLoading={false}
          extra={{ wizardBlocked, uiMode: mode ?? "null", step }}
        />
      </div>
    );
  }

  if (tiersQ.isPending) {
    return (
      <>
        <BrandedLoader label="Loading plans" />
        <BillingDebugPanel
          accountId={accountId}
          contextLabel="Create subscription"
          summary={summary}
          isSummaryLoading={false}
          extra={{ availableTiers: "loading" }}
        />
      </>
    );
  }

  if (
    tiersQ.isSuccess &&
    tiersQ.data &&
    isAccountBillingAvailableTiersGatewayRedirect(tiersQ.data)
  ) {
    return (
      <div className="text-muted-foreground grid gap-2 text-center text-sm" role="status">
        <p>Redirecting…</p>
        <BillingDebugPanel
          accountId={accountId}
          contextLabel="Create subscription"
          summary={summary}
          isSummaryLoading={false}
          extra={{ availableTiersGateway: tiersQ.data.reason }}
        />
      </div>
    );
  }

  if (tiersQ.isError) {
    const err = tiersQ.error;
    return (
      <>
        <ErrorState
          title="Could not load plans"
          description={err instanceof Error ? err.message : AUTH_ERROR_MESSAGES.network}
          onRetry={() => void tiersQ.refetch()}
        />
        <BillingDebugPanel
          accountId={accountId}
          contextLabel="Create subscription"
          summary={summary}
          isSummaryLoading={false}
          summaryError={err instanceof Error ? err.message : AUTH_ERROR_MESSAGES.network}
          extra={{ availableTiers: "error" }}
        />
      </>
    );
  }

  if (
    !tiersQ.isSuccess ||
    !tiersQ.data ||
    isAccountBillingAvailableTiersGatewayRedirect(tiersQ.data)
  ) {
    return (
      <BillingDebugPanel
        accountId={accountId}
        contextLabel="Create subscription"
        summary={summary}
        isSummaryLoading={false}
        extra={{ state: "available_tiers_unexpected_empty" }}
      />
    );
  }

  const { tiers } = tiersQ.data;

  if (!canCard && !canInvoice) {
    return (
      <>
        <Card>
          <CardHeader>
            <CardTitle className="font-brand text-lg">No subscription actions available</CardTitle>
            <CardDescription>
              This account cannot start card checkout or an invoice request from the API right now.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button type="button" variant="outline" asChild>
              <Link href={`/o/${encodeURIComponent(accountId)}/billing`}>Back to billing</Link>
            </Button>
          </CardContent>
        </Card>
        <BillingDebugPanel
          accountId={accountId}
          contextLabel="Create subscription"
          summary={summary}
          isSummaryLoading={false}
          extra={{ noCheckoutPath: true }}
        />
      </>
    );
  }

  const dateOk = startDate.length > 0 && startDate >= minDate;

  function advancePastStep2() {
    if (canCard && !canInvoice) {
      setPaymentPath("card");
      setStep(4);
      return;
    }
    if (!canCard && canInvoice) {
      setPaymentPath("invoice");
      setStep(4);
      return;
    }
    setStep(3);
  }

  async function submitCardCheckout() {
    setCheckoutError(null);
    setMissingCheckoutUrl(false);
    if (!selectedTierId || !dateOk) return;
    try {
      const res = await checkoutMutation.mutateAsync({
        subscriptionTierId: selectedTierId,
        startDate,
      });
      if (res.checkoutUrl && res.checkoutUrl.length > 0) {
        window.location.assign(res.checkoutUrl);
        return;
      }
      setMissingCheckoutUrl(true);
    } catch (e) {
      if (e instanceof ApiError) {
        setCheckoutError(e.message);
      } else if (e instanceof Error) {
        setCheckoutError(e.message);
      } else {
        setCheckoutError(AUTH_ERROR_MESSAGES.network);
      }
    }
  }

  const startParsedForInvoice = startDate.length > 0 ? new Date(`${startDate}T12:00:00`) : null;
  const startOkInvoice =
    startParsedForInvoice != null &&
    !Number.isNaN(startParsedForInvoice.getTime()) &&
    startParsedForInvoice.getTime() >= Date.now() - 86400000;

  const requiredInvoiceFilled =
    billingContactName.trim().length > 0 &&
    billingEmail.trim().length > 0 &&
    billingOrganisationName.trim().length > 0 &&
    line1.trim().length > 0 &&
    city.trim().length > 0 &&
    stateField.trim().length > 0 &&
    postcode.trim().length > 0 &&
    country.trim().length > 0;

  const canSubmitInvoice = Boolean(
    selectedTierId &&
    startOkInvoice &&
    requiredInvoiceFilled &&
    !invoiceMutation.isPending &&
    tiers.length > 0,
  );

  function buildInvoiceBody(): PostAccountBillingInvoiceRequestBody {
    if (
      !selectedTierId ||
      !startParsedForInvoice ||
      Number.isNaN(startParsedForInvoice.getTime())
    ) {
      throw new Error("Invalid form state");
    }
    const billingAddress: PostAccountBillingInvoiceRequestBody["billingAddress"] = {
      line1: line1.trim(),
      city: city.trim(),
      state: stateField.trim(),
      postcode: postcode.trim(),
      country: country.trim(),
    };
    const l2 = line2.trim();
    if (l2.length > 0) {
      billingAddress.line2 = l2;
    }
    const body: PostAccountBillingInvoiceRequestBody = {
      subscriptionTierId: selectedTierId,
      requestedStartDate: startParsedForInvoice.toISOString(),
      billingContactName: billingContactName.trim(),
      billingEmail: billingEmail.trim(),
      billingOrganisationName: billingOrganisationName.trim(),
      billingAddress,
    };
    const po = purchaseOrderNumber.trim();
    if (po.length > 0) {
      body.purchaseOrderNumber = po;
    }
    const n = notes.trim();
    if (n.length > 0) {
      body.notes = n;
    }
    return body;
  }

  async function submitInvoiceRequest() {
    setInvoiceError(null);
    if (!canSubmitInvoice) return;
    try {
      await invoiceMutation.mutateAsync(buildInvoiceBody());
      void queryClient.invalidateQueries({ queryKey: queryKeys.account.billing(accountId) });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.account.billingInvoiceRequests(accountId),
      });
      router.replace(`/o/${encodeURIComponent(accountId)}/billing`);
    } catch (e) {
      if (e instanceof ApiError) {
        setInvoiceError(e.message);
      } else if (e instanceof Error) {
        setInvoiceError(e.message);
      } else {
        setInvoiceError(AUTH_ERROR_MESSAGES.network);
      }
    }
  }

  const selectedTier = tiers.find((t) => tierKey(t) === selectedTierId);

  return (
    <div className="grid gap-6">
      <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-xs">
        <span>Step {step} of 4</span>
        <span aria-hidden>·</span>
        <Button type="button" variant="link" className="h-auto p-0 text-xs" asChild>
          <Link href={`/o/${encodeURIComponent(accountId)}/billing`}>
            Cancel and return to billing
          </Link>
        </Button>
      </div>

      {step === 1 ? (
        <Card>
          <CardHeader>
            <CardTitle className="font-brand text-lg">1. Select subscription tier</CardTitle>
            <CardDescription>Choose the plan that fits this organisation.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {tiers.length === 0 ? (
              <p className="text-muted-foreground text-sm" role="status">
                No plans are available for this account right now.
              </p>
            ) : (
              <div className="grid gap-2" role="radiogroup" aria-label="Subscription tier">
                {tiers.map((tier) => {
                  const id = tierKey(tier);
                  const selected = selectedTierId === id;
                  const primaryLabel = tier.Name ?? id;
                  return (
                    <button
                      key={id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setSelectedTierId(id)}
                      className={cn(
                        "border-border hover:bg-muted/40 rounded-lg border p-4 text-left transition-colors",
                        selected && "border-primary ring-ring ring-2",
                      )}
                    >
                      <p className="text-foreground font-medium">{primaryLabel}</p>
                      {tier.Title ? (
                        <p className="text-muted-foreground mt-0.5 text-sm">{tier.Title}</p>
                      ) : null}
                      {tier.description ? (
                        <p className="text-muted-foreground mt-2 text-xs leading-relaxed">
                          {truncateDescription(tier.description, 220)}
                        </p>
                      ) : null}
                      <p className="mt-2 text-sm font-medium tabular-nums">
                        {formatMoney(tier.price ?? null, tier.currency ?? null)}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
            <div>
              <Button
                type="button"
                disabled={!selectedTierId || tiers.length === 0}
                onClick={() => setStep(2)}
              >
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {step === 2 ? (
        <Card>
          <CardHeader>
            <CardTitle className="font-brand text-lg">2. Subscription start date</CardTitle>
            <CardDescription>When should the subscription begin?</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid max-w-xs gap-2">
              <Label htmlFor="wizard-start-date">Start date</Label>
              <input
                id="wizard-start-date"
                type="date"
                min={minDate}
                value={startDate}
                onChange={(ev) => setStartDate(ev.target.value)}
                className={inputClass}
              />
              <p className="text-muted-foreground text-xs">Must be today or a future date.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button type="button" disabled={!dateOk} onClick={advancePastStep2}>
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {step === 3 ? (
        <Card>
          <CardHeader>
            <CardTitle className="font-brand text-lg">3. Payment path</CardTitle>
            <CardDescription>Pay by card with Stripe, or request an invoice.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2" role="radiogroup" aria-label="Payment path">
              {canCard ? (
                <button
                  type="button"
                  role="radio"
                  aria-checked={paymentPath === "card"}
                  onClick={() => setPaymentPath("card")}
                  className={cn(
                    "border-border hover:bg-muted/40 rounded-lg border p-4 text-left transition-colors",
                    paymentPath === "card" && "border-primary ring-ring ring-2",
                  )}
                >
                  <p className="text-foreground font-medium">Card (Stripe Checkout)</p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Pay online; you will be redirected to Stripe.
                  </p>
                </button>
              ) : null}
              {canInvoice ? (
                <button
                  type="button"
                  role="radio"
                  aria-checked={paymentPath === "invoice"}
                  onClick={() => setPaymentPath("invoice")}
                  className={cn(
                    "border-border hover:bg-muted/40 rounded-lg border p-4 text-left transition-colors",
                    paymentPath === "invoice" && "border-primary ring-ring ring-2",
                  )}
                >
                  <p className="text-foreground font-medium">Invoice request</p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Submit billing details for a pay-by-invoice quote.
                  </p>
                </button>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button type="button" disabled={paymentPath == null} onClick={() => setStep(4)}>
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {step === 4 && paymentPath === "card" ? (
        <Card>
          <CardHeader>
            <CardTitle className="font-brand text-lg">4. Review and pay</CardTitle>
            <CardDescription>Confirm your selection, then continue to Stripe.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 text-sm">
            <dl className="grid gap-2">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Plan</dt>
                <dd className="text-right font-medium">
                  {selectedTier?.Name ?? selectedTierId ?? "—"}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Start date</dt>
                <dd className="text-right">{startDate || "—"}</dd>
              </div>
            </dl>
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
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(canCard && canInvoice ? 3 : 2)}
              >
                Back
              </Button>
              <Button
                type="button"
                disabled={!selectedTierId || !dateOk || checkoutMutation.isPending}
                onClick={() => void submitCardCheckout()}
              >
                {checkoutMutation.isPending ? "Starting checkout…" : "Continue to payment"}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {step === 4 && paymentPath === "invoice" ? (
        <Card>
          <CardHeader>
            <CardTitle className="font-brand text-lg">
              4. Review and submit invoice request
            </CardTitle>
            <CardDescription>
              Requested start uses your chosen date (stored as ISO). Contact and address are
              required.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <dl className="text-muted-foreground grid gap-1 text-sm">
              <div className="flex justify-between gap-4">
                <dt>Plan</dt>
                <dd className="text-foreground text-right font-medium">
                  {selectedTier?.Name ?? selectedTierId ?? "—"}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Start date</dt>
                <dd className="text-foreground text-right">{startDate || "—"}</dd>
              </div>
            </dl>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="wizard-contact-name">Billing contact name</Label>
                <input
                  id="wizard-contact-name"
                  type="text"
                  autoComplete="name"
                  value={billingContactName}
                  onChange={(ev) => setBillingContactName(ev.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="wizard-billing-email">Billing email</Label>
                <input
                  id="wizard-billing-email"
                  type="email"
                  autoComplete="email"
                  value={billingEmail}
                  onChange={(ev) => setBillingEmail(ev.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="wizard-org-name">Organisation name</Label>
              <input
                id="wizard-org-name"
                type="text"
                autoComplete="organization"
                value={billingOrganisationName}
                onChange={(ev) => setBillingOrganisationName(ev.target.value)}
                className={inputClass}
              />
            </div>

            <fieldset className="grid gap-3">
              <legend className="mb-1 text-sm font-medium">Billing address</legend>
              <div className="grid gap-2">
                <Label htmlFor="wizard-addr-line1">Address line 1</Label>
                <input
                  id="wizard-addr-line1"
                  type="text"
                  autoComplete="address-line1"
                  value={line1}
                  onChange={(ev) => setLine1(ev.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="wizard-addr-line2">Address line 2 (optional)</Label>
                <input
                  id="wizard-addr-line2"
                  type="text"
                  autoComplete="address-line2"
                  value={line2}
                  onChange={(ev) => setLine2(ev.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="wizard-addr-city">City / suburb</Label>
                  <input
                    id="wizard-addr-city"
                    type="text"
                    autoComplete="address-level2"
                    value={city}
                    onChange={(ev) => setCity(ev.target.value)}
                    className={inputClass}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="wizard-addr-state">State / region</Label>
                  <input
                    id="wizard-addr-state"
                    type="text"
                    autoComplete="address-level1"
                    value={stateField}
                    onChange={(ev) => setStateField(ev.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="wizard-addr-postcode">Postcode</Label>
                  <input
                    id="wizard-addr-postcode"
                    type="text"
                    autoComplete="postal-code"
                    value={postcode}
                    onChange={(ev) => setPostcode(ev.target.value)}
                    className={inputClass}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="wizard-addr-country">Country</Label>
                  <input
                    id="wizard-addr-country"
                    type="text"
                    autoComplete="country-name"
                    value={country}
                    onChange={(ev) => setCountry(ev.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
            </fieldset>

            <div className="grid gap-2">
              <Label htmlFor="wizard-po">Purchase order (optional)</Label>
              <input
                id="wizard-po"
                type="text"
                value={purchaseOrderNumber}
                onChange={(ev) => setPurchaseOrderNumber(ev.target.value)}
                className={inputClass}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="wizard-notes">Notes (optional)</Label>
              <textarea
                id="wizard-notes"
                value={notes}
                onChange={(ev) => setNotes(ev.target.value)}
                className={textareaClass}
              />
            </div>

            {invoiceError ? (
              <p className="text-destructive text-sm" role="alert">
                {invoiceError}
              </p>
            ) : null}

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(canCard && canInvoice ? 3 : 2)}
              >
                Back
              </Button>
              <Button
                type="button"
                disabled={!canSubmitInvoice}
                onClick={() => void submitInvoiceRequest()}
              >
                {invoiceMutation.isPending ? "Submitting…" : "Submit invoice request"}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}
      <BillingDebugPanel
        accountId={accountId}
        contextLabel="Create subscription"
        summary={summary}
        isSummaryLoading={false}
        extra={{
          step,
          canCard,
          canInvoice,
          tiersCount: tiers.length,
        }}
      />
    </div>
  );
}
