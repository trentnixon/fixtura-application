"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { BrandedLoader } from "@/components/ui/branded-loader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api/client/api-error";
import {
  isAccountBillingAvailableTiersGatewayRedirect,
  useAccountBillingAvailableTiers,
} from "@/lib/api/hooks/account/useAccountBillingAvailableTiers";
import { usePostAccountBillingInvoiceRequest } from "@/lib/api/hooks/account/usePostAccountBillingInvoiceRequest";
import { queryKeys } from "@/lib/api/query/query-keys";
import { AUTH_ERROR_MESSAGES } from "@/lib/auth/auth-errors";
import { selectOrganisationUrlWithReason } from "@/lib/config/gateway-reasons";
import { cn } from "@/lib/utils";

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

/** Local `datetime-local` minimum: `YYYY-MM-DDTHH:mm` in the user's timezone. */
function localDatetimeInputNow(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${day}T${h}:${min}`;
}

function truncateDescription(text: string, max: number): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

function tierKey(tier: AvailableBillingTier): string {
  return String(tier.id);
}

/**
 * Show invoice request when API allows it, or when `availableActions` is absent / empty
 * (flags not yet returned by CMS).
 */
export function shouldShowInvoiceRequest(
  actions: Partial<Record<string, boolean>> | undefined,
): boolean {
  if (actions == null) {
    return true;
  }
  if (actions["canRequestInvoice"] === true) {
    return true;
  }
  return Object.keys(actions).length === 0;
}

const inputClass =
  "border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-full border px-4 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50";

const textareaClass =
  "border-input bg-background ring-offset-background focus-visible:ring-ring min-h-[88px] w-full rounded-lg border px-4 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50";

export type BillingInvoiceRequestProps = {
  accountId: string;
  enabled: boolean;
  availableActions?: Partial<Record<string, boolean>>;
};

export function BillingInvoiceRequest({
  accountId,
  enabled,
  availableActions,
}: BillingInvoiceRequestProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const redirectingRef = useRef(false);

  const [selectedTierId, setSelectedTierId] = useState<string | null>(null);
  const [requestedStartLocal, setRequestedStartLocal] = useState("");
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

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccessMessage, setSubmitSuccessMessage] = useState<string | null>(null);

  const tiersQ = useAccountBillingAvailableTiers(accountId, { enabled });
  const invoiceMutation = usePostAccountBillingInvoiceRequest(accountId);

  useEffect(() => {
    redirectingRef.current = false;
  }, [accountId]);

  useEffect(() => {
    if (!enabled) return;
    if (!tiersQ.isSuccess || !tiersQ.data || redirectingRef.current) return;
    if (!isAccountBillingAvailableTiersGatewayRedirect(tiersQ.data)) return;
    redirectingRef.current = true;
    void queryClient.removeQueries({
      queryKey: queryKeys.account.billingAvailableTiers(accountId),
    });
    router.replace(selectOrganisationUrlWithReason(tiersQ.data.reason));
  }, [tiersQ.isSuccess, tiersQ.data, accountId, queryClient, router, enabled]);

  if (!shouldShowInvoiceRequest(availableActions)) {
    return null;
  }

  if (!enabled) {
    return null;
  }

  if (tiersQ.isPending) {
    return <BrandedLoader label="Loading plans" />;
  }

  if (
    tiersQ.isSuccess &&
    tiersQ.data &&
    isAccountBillingAvailableTiersGatewayRedirect(tiersQ.data)
  ) {
    return (
      <div className="text-muted-foreground grid gap-2 text-center text-sm" role="status">
        <p>Redirecting…</p>
      </div>
    );
  }

  if (tiersQ.isError) {
    const err = tiersQ.error;
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-brand text-lg">Request invoice billing</CardTitle>
          <CardDescription>Pay by invoice instead of card.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-destructive text-sm" role="alert">
            {err instanceof Error ? err.message : AUTH_ERROR_MESSAGES.network}
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-3"
            onClick={() => void tiersQ.refetch()}
          >
            Try again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (
    !tiersQ.isSuccess ||
    !tiersQ.data ||
    isAccountBillingAvailableTiersGatewayRedirect(tiersQ.data)
  ) {
    return null;
  }

  const { tiers } = tiersQ.data;

  const startParsed = requestedStartLocal.length > 0 ? new Date(requestedStartLocal) : null;
  const startOk =
    startParsed != null &&
    !Number.isNaN(startParsed.getTime()) &&
    startParsed.getTime() >= Date.now() - 60_000;

  const requiredFilled =
    billingContactName.trim().length > 0 &&
    billingEmail.trim().length > 0 &&
    billingOrganisationName.trim().length > 0 &&
    line1.trim().length > 0 &&
    city.trim().length > 0 &&
    stateField.trim().length > 0 &&
    postcode.trim().length > 0 &&
    country.trim().length > 0;

  const canSubmit = Boolean(
    selectedTierId && startOk && requiredFilled && !invoiceMutation.isPending && tiers.length > 0,
  );

  function buildBody(): PostAccountBillingInvoiceRequestBody {
    if (!selectedTierId || !startParsed || Number.isNaN(startParsed.getTime())) {
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
      requestedStartDate: startParsed.toISOString(),
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

  async function handleSubmit() {
    setSubmitError(null);
    setSubmitSuccessMessage(null);
    if (!canSubmit) return;
    try {
      const res = await invoiceMutation.mutateAsync(buildBody());
      setSubmitSuccessMessage(res.message?.trim() || "Your invoice request was submitted.");
    } catch (e) {
      if (e instanceof ApiError) {
        setSubmitError(e.message);
      } else if (e instanceof Error) {
        setSubmitError(e.message);
      } else {
        setSubmitError(AUTH_ERROR_MESSAGES.network);
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-brand text-lg">Request invoice billing</CardTitle>
        <CardDescription>
          Choose a tier and billing details. We will follow up with an invoice for payment.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        {submitSuccessMessage ? (
          <p className="text-muted-foreground text-sm" role="status">
            {submitSuccessMessage}
          </p>
        ) : null}

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

        <div className="grid max-w-md gap-2">
          <Label htmlFor="invoice-requested-start">
            Requested subscription start{" "}
            <span className="text-muted-foreground font-normal">
              (local time, stored as UTC ISO)
            </span>
          </Label>
          <input
            id="invoice-requested-start"
            type="datetime-local"
            min={localDatetimeInputNow()}
            value={requestedStartLocal}
            onChange={(ev) => setRequestedStartLocal(ev.target.value)}
            className={inputClass}
          />
          <p className="text-muted-foreground text-xs">Must be now or a future time.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="invoice-contact-name">Billing contact name</Label>
            <input
              id="invoice-contact-name"
              type="text"
              autoComplete="name"
              value={billingContactName}
              onChange={(ev) => setBillingContactName(ev.target.value)}
              className={inputClass}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="invoice-billing-email">Billing email</Label>
            <input
              id="invoice-billing-email"
              type="email"
              autoComplete="email"
              value={billingEmail}
              onChange={(ev) => setBillingEmail(ev.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="invoice-org-name">Organisation name</Label>
          <input
            id="invoice-org-name"
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
            <Label htmlFor="invoice-addr-line1">Address line 1</Label>
            <input
              id="invoice-addr-line1"
              type="text"
              autoComplete="address-line1"
              value={line1}
              onChange={(ev) => setLine1(ev.target.value)}
              className={inputClass}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="invoice-addr-line2">Address line 2 (optional)</Label>
            <input
              id="invoice-addr-line2"
              type="text"
              autoComplete="address-line2"
              value={line2}
              onChange={(ev) => setLine2(ev.target.value)}
              className={inputClass}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="invoice-addr-city">City / suburb</Label>
              <input
                id="invoice-addr-city"
                type="text"
                autoComplete="address-level2"
                value={city}
                onChange={(ev) => setCity(ev.target.value)}
                className={inputClass}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="invoice-addr-state">State / region</Label>
              <input
                id="invoice-addr-state"
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
              <Label htmlFor="invoice-addr-postcode">Postcode</Label>
              <input
                id="invoice-addr-postcode"
                type="text"
                autoComplete="postal-code"
                value={postcode}
                onChange={(ev) => setPostcode(ev.target.value)}
                className={inputClass}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="invoice-addr-country">Country</Label>
              <input
                id="invoice-addr-country"
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
          <Label htmlFor="invoice-po">Purchase order (optional)</Label>
          <input
            id="invoice-po"
            type="text"
            value={purchaseOrderNumber}
            onChange={(ev) => setPurchaseOrderNumber(ev.target.value)}
            className={inputClass}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="invoice-notes">Notes (optional)</Label>
          <textarea
            id="invoice-notes"
            value={notes}
            onChange={(ev) => setNotes(ev.target.value)}
            className={textareaClass}
          />
        </div>

        {submitError ? (
          <p className="text-destructive text-sm" role="alert">
            {submitError}
          </p>
        ) : null}

        <div>
          <Button type="button" disabled={!canSubmit} onClick={() => void handleSubmit()}>
            {invoiceMutation.isPending ? "Submitting…" : "Submit invoice request"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
