"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { BrandedLoader } from "@/components/ui/branded-loader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api/client/api-error";
import {
  isAccountBillingAvailableTiersGatewayRedirect,
  useAccountBillingAvailableTiers,
} from "@/lib/api/hooks/account/useAccountBillingAvailableTiers";
import { usePostAccountBillingCheckout } from "@/lib/api/hooks/account/usePostAccountBillingCheckout";
import { queryKeys } from "@/lib/api/query/query-keys";
import { AUTH_ERROR_MESSAGES } from "@/lib/auth/auth-errors";
import { selectOrganisationUrlWithReason } from "@/lib/config/gateway-reasons";
import { cn } from "@/lib/utils";

import type { AvailableBillingTier } from "@/types/api/account";

function formatMoney(amount: number | null, currency: string | null): string {
  if (amount == null) return "—";
  const c = currency?.trim() || "AUD";
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency: c }).format(amount);
  } catch {
    return `${amount} ${c}`;
  }
}

/** YYYY-MM-DD for `<input type="date" min="…" />` in local calendar. */
function localDateInputToday(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Trim long tier descriptions in the picker. */
function truncateDescription(text: string, max: number): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

/**
 * Show plan checkout when API explicitly allows it, or when `availableActions` is absent / empty
 * (flags not yet returned by CMS).
 */
export function shouldShowPlanCheckout(
  actions: Partial<Record<string, boolean>> | undefined,
): boolean {
  if (actions == null) {
    return true;
  }
  if (actions["canCheckout"] === true || actions["canSubscribe"] === true) {
    return true;
  }
  return Object.keys(actions).length === 0;
}

function tierKey(tier: AvailableBillingTier): string {
  return String(tier.id);
}

export type BillingPlanCheckoutProps = {
  accountId: string;
  /** Mirrors billing summary segment gate. */
  enabled: boolean;
  availableActions?: Partial<Record<string, boolean>>;
};

export function BillingPlanCheckout({
  accountId,
  enabled,
  availableActions,
}: BillingPlanCheckoutProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const redirectingRef = useRef(false);
  const [selectedTierId, setSelectedTierId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState("");
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [missingCheckoutUrl, setMissingCheckoutUrl] = useState(false);

  const minDate = useMemo(() => localDateInputToday(), []);

  const tiersQ = useAccountBillingAvailableTiers(accountId, { enabled });

  const checkoutMutation = usePostAccountBillingCheckout(accountId);

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

  if (!shouldShowPlanCheckout(availableActions)) {
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
          <CardTitle className="font-brand text-lg">Choose a plan</CardTitle>
          <CardDescription>Pay by card via Stripe Checkout.</CardDescription>
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

  const dateOk = startDate.length > 0 && startDate >= minDate;
  const canSubmit = Boolean(selectedTierId && dateOk && !checkoutMutation.isPending);

  async function handleContinueToPayment() {
    setCheckoutError(null);
    setMissingCheckoutUrl(false);
    if (!selectedTierId || !dateOk) {
      return;
    }
    try {
      const res = await checkoutMutation.mutateAsync({
        subscriptionTierId: selectedTierId,
        startDate,
      });
      if (res.checkoutUrl && res.checkoutUrl.length > 0) {
        // Configure Stripe success_url / cancel_url per .comms/billing-checkout-return-urls.md so returns trigger a billing refetch.
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-brand text-lg">Choose a plan</CardTitle>
        <CardDescription>
          Select a subscription tier and start date, then continue to Stripe to pay by card.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
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

        <div className="grid max-w-xs gap-2">
          <Label htmlFor="billing-start-date">Subscription start date</Label>
          <input
            id="billing-start-date"
            type="date"
            min={minDate}
            value={startDate}
            onChange={(ev) => setStartDate(ev.target.value)}
            className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-full border px-4 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          />
          <p className="text-muted-foreground text-xs">Must be today or a future date.</p>
        </div>

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

        <div>
          <Button
            type="button"
            disabled={!canSubmit || tiers.length === 0}
            onClick={() => void handleContinueToPayment()}
          >
            {checkoutMutation.isPending ? "Starting checkout…" : "Continue to payment"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
