"use client";

import { useQueryClient } from "@tanstack/react-query";
import { addYears, format, startOfDay } from "date-fns";
import { ChevronRight, CreditCard, FileText } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  TypographyH2,
  TypographyH3,
  TypographyH4,
  TypographyLarge,
  TypographyMuted,
} from "@/components/typography";
import { BrandedLoader } from "@/components/ui/branded-loader";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ApiError } from "@/lib/api/client/api-error";
import {
  isAccountBillingGatewayRedirect,
  useAccountBilling,
} from "@/lib/api/hooks/account/useAccountBilling";
import {
  isAccountBillingAvailableTiersGatewayRedirect,
  useAccountBillingAvailableTiers,
} from "@/lib/api/hooks/account/useAccountBillingAvailableTiers";
import { useAccountMe } from "@/lib/api/hooks/account/useAccountMe";
import { usePostAccountBillingCheckout } from "@/lib/api/hooks/account/usePostAccountBillingCheckout";
import { usePostAccountBillingInvoiceRequest } from "@/lib/api/hooks/account/usePostAccountBillingInvoiceRequest";
import { queryKeys } from "@/lib/api/query/query-keys";
import { accountApi } from "@/lib/api/services/account.api";
import { AUTH_ERROR_MESSAGES } from "@/lib/auth/auth-errors";
import { isValidAccountIdSegment } from "@/lib/config/account-routes";
import {
  SELECT_ORG_GATEWAY_REASON,
  selectOrganisationUrlWithReason,
} from "@/lib/config/gateway-reasons";
import { cn } from "@/lib/utils";

import { CreateSubscriptionWizardStatePanel } from "./create-subscription-wizard-state-panel";
import { PlanTierCard } from "../_components/plan-tier-card/PlanTierCard";
import { useBillingInvoiceContactPrefill } from "../_hooks/useBillingInvoiceContactPrefill";
import { formatMoney } from "../_utils/formatBillingDisplay";
import { extractHostedInvoiceFromOrderPayload } from "../_utils/hostedInvoiceFromOrderPayload";
import {
  computePassEndDateYyyyMmDd,
  parseBillingIsoToCalendarDate,
} from "../_utils/passEndDateFromWizardStart";
import { orderedDistinctSubscriptionCategories } from "../_utils/planTierCard";
import { shouldShowStripeImmediateInvoiceCreate } from "../_utils/shouldShowStripeImmediateInvoice";
import { deriveBillingUiMode } from "../core/billing-state";
import { BillingDebugPanel } from "../debug/billing-debug-panel";
import { shouldShowInvoiceRequest } from "../invoice-request/billing-invoice-request";
import { shouldShowPlanCheckout } from "../plan-checkout/billing-plan-checkout";
import { createStrapiStripeInvoice } from "./actions/create-stripe-invoice";

import type {
  PostAccountBillingInvoiceRequestBody,
  SubscriptionTierCategory,
} from "@/types/api/account";

function localDateInputToday(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
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
  const [planCategoryFilter, setPlanCategoryFilter] = useState<SubscriptionTierCategory | null>(
    null,
  );

  const [billingContactName, setBillingContactName] = useState("");
  const [billingEmail, setBillingEmail] = useState("");
  const [billingOrganisationName, setBillingOrganisationName] = useState("");
  const [notes, setNotes] = useState("");

  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [invoiceError, setInvoiceError] = useState<string | null>(null);
  const [missingCheckoutUrl, setMissingCheckoutUrl] = useState(false);

  const [stripeImmediateError, setStripeImmediateError] = useState<string | null>(null);
  const [stripeImmediatePending, setStripeImmediatePending] = useState(false);
  const [stripeHostedUrl, setStripeHostedUrl] = useState<string | null>(null);
  const [stripeCreatedOrderId, setStripeCreatedOrderId] = useState<number | null>(null);
  const [stripeInvoicePaidDetected, setStripeInvoicePaidDetected] = useState(false);

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

  const tiersList = useMemo(() => {
    if (
      tiersQ.isSuccess &&
      tiersQ.data &&
      !isAccountBillingAvailableTiersGatewayRedirect(tiersQ.data)
    ) {
      return tiersQ.data.tiers;
    }
    return [];
  }, [tiersQ.isSuccess, tiersQ.data]);

  const orderedCategories = useMemo(
    () => orderedDistinctSubscriptionCategories(tiersList),
    [tiersList],
  );
  const showPlanCategoryToggle = orderedCategories.length > 1;
  const effectivePlanCategory: SubscriptionTierCategory | null = showPlanCategoryToggle
    ? (planCategoryFilter ?? orderedCategories[0] ?? null)
    : null;

  const displayTiers = useMemo(() => {
    if (effectivePlanCategory == null) return tiersList;
    return tiersList.filter((t) => t.category === effectivePlanCategory);
  }, [tiersList, effectivePlanCategory]);

  useEffect(() => {
    if (!selectedTierId) return;
    if (tiersList.length === 0) return;
    const stillVisible = displayTiers.some((t) => t.id === selectedTierId);
    if (!stillVisible) setSelectedTierId(null);
  }, [tiersList.length, displayTiers, selectedTierId]);

  const checkoutMutation = usePostAccountBillingCheckout(accountId);
  const invoiceMutation = usePostAccountBillingInvoiceRequest(accountId);

  const meEnabled = Boolean(segmentOk && summary != null && mode != null && !wizardBlocked);
  const meQ = useAccountMe({ enabled: meEnabled });

  const showStripeImmediateInvoice = useMemo(
    () =>
      shouldShowStripeImmediateInvoiceCreate({
        availableActions: availableActions ?? null,
        me: meQ.data?.data ?? null,
      }),
    [availableActions, meQ.data?.data],
  );

  useBillingInvoiceContactPrefill(
    accountId,
    Boolean(segmentOk && summary != null && mode != null && !wizardBlocked),
    setBillingContactName,
    setBillingEmail,
    setBillingOrganisationName,
  );

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

  useEffect(() => {
    if (stripeCreatedOrderId == null || stripeInvoicePaidDetected) {
      return;
    }

    let cancelled = false;
    const maxMs = 120_000;
    const started = Date.now();

    const id = window.setInterval(() => {
      void (async () => {
        if (cancelled || Date.now() - started > maxMs) {
          window.clearInterval(id);
          return;
        }
        try {
          const b = await accountApi.getAccountBilling(accountId);
          const active = b.data.activeOrder;
          if (active?.id === stripeCreatedOrderId && active.OrderPaid === true) {
            setStripeInvoicePaidDetected(true);
            void queryClient.invalidateQueries({ queryKey: queryKeys.account.billing(accountId) });
            void queryClient.invalidateQueries({
              queryKey: queryKeys.account.billingOrders(accountId),
            });
            window.clearInterval(id);
          }
        } catch {
          /* ignore transient errors while polling */
        }
      })();
    }, 2800);

    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [accountId, queryClient, stripeCreatedOrderId, stripeInvoicePaidDetected]);

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

  const today = startOfDay(new Date());
  const endMonth = addYears(today, 5);
  const selectedDate = parseBillingIsoToCalendarDate(startDate);

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
    billingOrganisationName.trim().length > 0;

  const canSubmitInvoice = Boolean(
    selectedTierId &&
    startOkInvoice &&
    requiredInvoiceFilled &&
    !invoiceMutation.isPending &&
    tiersList.length > 0,
  );

  function buildInvoiceBody(): PostAccountBillingInvoiceRequestBody {
    if (
      !selectedTierId ||
      !startParsedForInvoice ||
      Number.isNaN(startParsedForInvoice.getTime())
    ) {
      throw new Error("Invalid form state");
    }
    const body: PostAccountBillingInvoiceRequestBody = {
      subscriptionTierId: selectedTierId,
      requestedStartDate: startParsedForInvoice.toISOString(),
      billingContactName: billingContactName.trim(),
      billingEmail: billingEmail.trim(),
      billingOrganisationName: billingOrganisationName.trim(),
    };
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

  const selectedTier = tiersList.find((t) => t.id === selectedTierId);

  const canSubmitStripeImmediate = Boolean(
    showStripeImmediateInvoice &&
    selectedTierId &&
    dateOk &&
    selectedTier &&
    !stripeImmediatePending &&
    tiersList.length > 0,
  );

  async function pollHostedInvoiceUrl(orderId: number): Promise<string | null> {
    const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
    for (let attempt = 0; attempt < 14; attempt++) {
      if (attempt > 0) await delay(550);
      try {
        const billingRes = await accountApi.getAccountBilling(accountId);
        const active = billingRes.data.activeOrder;
        const hosted = active?.hosted_invoice_url?.trim();
        if (active?.id === orderId && hosted) {
          return hosted;
        }

        const ordersRes = await accountApi.getAccountBillingOrders(accountId);
        const row = ordersRes.orders.find((o) => o.id === orderId);
        if (row) {
          const { hostedInvoiceUrl } = extractHostedInvoiceFromOrderPayload(
            row as unknown as Record<string, unknown>,
          );
          if (hostedInvoiceUrl) {
            return hostedInvoiceUrl;
          }
        }
      } catch {
        /* retry */
      }
    }
    return null;
  }

  async function submitStripeImmediateInvoice() {
    setStripeImmediateError(null);
    setStripeHostedUrl(null);
    setStripeCreatedOrderId(null);
    setStripeInvoicePaidDetected(false);
    if (!canSubmitStripeImmediate || !selectedTier || !selectedTierId) {
      return;
    }
    let endDate: string;
    try {
      endDate = computePassEndDateYyyyMmDd(startDate, selectedTier.daysInPass);
    } catch (err) {
      setStripeImmediateError(err instanceof Error ? err.message : "Invalid dates.");
      return;
    }

    setStripeImmediatePending(true);
    try {
      const res = await createStrapiStripeInvoice({
        AccountID: accountId,
        product_id: selectedTierId,
        startDate,
        endDate,
      });
      if (!res.ok) {
        setStripeImmediateError(res.message);
        return;
      }
      setStripeCreatedOrderId(res.orderId);
      await queryClient.invalidateQueries({ queryKey: queryKeys.account.billing(accountId) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.account.billingOrders(accountId) });

      const url = await pollHostedInvoiceUrl(res.orderId);
      setStripeHostedUrl(url);
      if (!url) {
        setStripeImmediateError(
          "Invoice was created but the Stripe payment link is not ready yet. Open Billing history or retry in a moment.",
        );
      }
    } catch (e) {
      if (e instanceof ApiError) {
        setStripeImmediateError(e.message);
      } else if (e instanceof Error) {
        setStripeImmediateError(e.message);
      } else {
        setStripeImmediateError(AUTH_ERROR_MESSAGES.network);
      }
    } finally {
      setStripeImmediatePending(false);
    }
  }
  const displayTierIds = displayTiers.map((t) => t.id);
  const selectedTierPreview = selectedTier
    ? { id: selectedTier.id, name: selectedTier.name, category: selectedTier.category }
    : null;

  return (
    <div className="grid gap-6">
      {step === 1 ? (
        <div className="bg-muted/35 rounded-lg border border-transparent p-5 sm:p-6">
          <div className="space-y-1">
            <h2 className="font-brand text-lg font-semibold">1. Select subscription tier</h2>
            <p className="text-muted-foreground text-sm">
              Choose the plan that fits this organisation.
            </p>
          </div>
          <div className="mt-4 grid gap-4">
            {tiersList.length === 0 ? (
              <p className="text-muted-foreground text-sm" role="status">
                No plans are available for this account right now.
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
                      onValueChange={(v) => {
                        if (v === "Club" || v === "Association") setPlanCategoryFilter(v);
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
                <div className="grid gap-3" role="radiogroup" aria-label="Subscription tier">
                  {displayTiers.map((tier) => (
                    <PlanTierCard
                      key={tier.id}
                      tier={tier}
                      selected={selectedTierId === tier.id}
                      onSelect={() => setSelectedTierId(tier.id)}
                    />
                  ))}
                </div>
              </div>
            )}
            <div className="flex justify-center">
              <Button
                type="button"
                disabled={!selectedTierId || tiersList.length === 0 || displayTiers.length === 0}
                onClick={() => setStep(2)}
              >
                Continue
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="bg-muted/35 rounded-lg border border-transparent p-5 sm:p-6">
          <div className="space-y-1">
            <h2 className="font-brand text-lg font-semibold">2. Subscription start date</h2>
            <p className="text-muted-foreground text-sm">When should the subscription begin?</p>
          </div>

          <div className="mt-4 grid gap-6 md:grid-cols-[auto_minmax(0,1fr)] md:items-start">
            <div className="flex justify-center md:justify-start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(d) => setStartDate(d ? format(d, "yyyy-MM-dd") : "")}
                captionLayout="dropdown"
                startMonth={today}
                endMonth={endMonth}
                disabled={{ before: today }}
                className="rounded-md border shadow"
              />
            </div>

            <div className="space-y-3">
              <div className="min-h-5 text-center text-sm font-medium md:text-left">
                {selectedDate ? (
                  <p>
                    Selected date:{" "}
                    <span className="text-primary">{format(selectedDate, "PPP")}</span>
                  </p>
                ) : (
                  <p className="text-muted-foreground">No date selected</p>
                )}
              </div>
              <p className="text-muted-foreground text-xs">Must be today or a future date.</p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t pt-6">
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button type="button" disabled={!dateOk} onClick={advancePastStep2}>
                Continue
              </Button>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => setStartDate("")}
              disabled={!startDate}
            >
              Reset
            </Button>
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="bg-muted/35 rounded-lg border border-transparent p-5 sm:p-6">
          <div className="space-y-1">
            <h2 className="font-brand text-lg font-semibold">3. Payment path</h2>
            <p className="text-muted-foreground text-sm">
              Pay by card with Stripe, or request an online invoice (no postal address needed).
            </p>
          </div>

          <div className="mt-4 grid gap-4">
            <div className="grid gap-2" role="radiogroup" aria-label="Payment path">
              {canCard ? (
                <button
                  type="button"
                  role="radio"
                  aria-checked={paymentPath === "card"}
                  onClick={() => setPaymentPath("card")}
                  className={cn(
                    "border-border hover:bg-muted/40 rounded-lg border bg-white p-4 text-left transition-colors dark:bg-black/20",
                    paymentPath === "card" && "border-primary ring-ring ring-2",
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-xl">
                      <CreditCard className="size-6" aria-hidden />
                    </div>
                    <div className="min-w-0">
                      <p className="text-foreground font-medium">Card (Stripe Checkout)</p>
                      <p className="text-muted-foreground mt-1 text-sm">
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
                  onClick={() => setPaymentPath("invoice")}
                  className={cn(
                    "border-border hover:bg-muted/40 rounded-lg border bg-white p-4 text-left transition-colors dark:bg-black/20",
                    paymentPath === "invoice" && "border-primary ring-ring ring-2",
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-xl">
                      <FileText className="size-6" aria-hidden />
                    </div>
                    <div className="min-w-0">
                      <p className="text-foreground font-medium">Online invoice request</p>
                      <p className="text-muted-foreground mt-1 text-sm">
                        We will email the invoice and it will show on your billing page.
                      </p>
                    </div>
                  </div>
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
          </div>
        </div>
      ) : null}

      {step === 4 && paymentPath === "card" ? (
        <div className="grid gap-6">
          <div className="mx-auto w-full max-w-4xl space-y-2 text-center md:text-left">
            <TypographyH3 className="font-brand text-lg tracking-tight">
              4. Review and pay
            </TypographyH3>
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
                      {selectedTier?.name ?? selectedTierId ?? "—"}
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
                      {selectedTier ? formatMoney(selectedTier.price, selectedTier.currency) : "—"}
                    </TypographyH2>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-10 md:col-span-3 dark:bg-black/20">
              <div className="grid gap-6">
                {selectedTier ? (
                  <dl className="border-border/60 space-y-3 border-b pb-6 text-sm">
                    {selectedTier.daysInPass > 0 ? (
                      <div className="space-y-0.5">
                        <dt className="text-muted-foreground text-[0.65rem] font-bold tracking-widest uppercase">
                          Coverage
                        </dt>
                        <dd className="font-medium">{selectedTier.daysInPass} days in pass</dd>
                      </div>
                    ) : null}
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
                      <dd className="font-medium">
                        {selectedDate != null ? format(selectedDate, "PPP") : startDate || "—"}
                      </dd>
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
                    Checkout URL missing from the server response. Please try again or contact
                    support.
                  </p>
                ) : null}

                <div className="flex flex-col gap-4">
                  <Button
                    type="button"
                    variant="brand"
                    size="lg"
                    disabled={!selectedTierId || !dateOk || checkoutMutation.isPending}
                    onClick={() => void submitCardCheckout()}
                    className="shadow-primary/20 h-14 w-full text-lg font-black tracking-[0.2em] uppercase shadow-2xl"
                  >
                    {checkoutMutation.isPending ? "Starting checkout…" : "Continue to payment"}
                    {!checkoutMutation.isPending ? (
                      <ChevronRight className="ml-2 h-5 w-5" aria-hidden />
                    ) : null}
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    className="text-muted-foreground w-full text-xs font-bold tracking-widest uppercase"
                    onClick={() => setStep(canCard && canInvoice ? 3 : 2)}
                  >
                    Back
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {step === 4 && paymentPath === "invoice" ? (
        <div className="grid gap-6">
          <div className="mx-auto w-full max-w-4xl space-y-2 text-center md:text-left">
            <TypographyH3 className="font-brand text-lg tracking-tight">
              4. Review and submit invoice request
            </TypographyH3>
            <TypographyMuted className="text-sm">
              Confirm your plan and start date, then add invoice contact details. Your request comes
              to us; we raise the invoice (e.g. in Hnry) and send it to you. It will also appear
              with your outstanding billing items.
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
                      {selectedTier?.name ?? selectedTierId ?? "—"}
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
                      {selectedTier.daysInPass > 0 ? (
                        <div className="space-y-0.5">
                          <dt className="text-muted-foreground text-[0.65rem] font-bold tracking-widest uppercase">
                            Coverage
                          </dt>
                          <dd>{selectedTier.daysInPass} days in pass</dd>
                        </div>
                      ) : null}
                      {selectedTier.priceByWeekInPass != null ? (
                        <div className="space-y-0.5">
                          <dt className="text-muted-foreground text-[0.65rem] font-bold tracking-widest uppercase">
                            Per week
                          </dt>
                          <dd className="text-primary font-semibold tabular-nums">
                            {formatMoney(selectedTier.priceByWeekInPass, selectedTier.currency)}
                            /week
                          </dd>
                        </div>
                      ) : null}
                      <div className="space-y-0.5">
                        <dt className="text-muted-foreground text-[0.65rem] font-bold tracking-widest uppercase">
                          Start date
                        </dt>
                        <dd className="font-medium">
                          {selectedDate != null ? format(selectedDate, "PPP") : startDate || "—"}
                        </dd>
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
                      {selectedTier ? formatMoney(selectedTier.price, selectedTier.currency) : "—"}
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
                      onChange={(ev) => setBillingContactName(ev.target.value)}
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
                      onChange={(ev) => setBillingEmail(ev.target.value)}
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
                    onChange={(ev) => setBillingOrganisationName(ev.target.value)}
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
                    onChange={(ev) => setNotes(ev.target.value)}
                    className={textareaClass}
                  />
                </div>

                {invoiceError ? (
                  <p className="text-destructive text-sm" role="alert">
                    {invoiceError}
                  </p>
                ) : null}

                {showStripeImmediateInvoice ? (
                  <div
                    className="border-border bg-muted/30 rounded-lg border p-4"
                    role="region"
                    aria-label="Staff Stripe invoice generation"
                  >
                    <p className="text-foreground text-sm font-medium">
                      Staff: immediate Stripe invoice
                    </p>
                    <p className="text-muted-foreground mt-1 text-xs">
                      Creates the CMS order + Stripe invoice via Strapi (`POST
                      /api/orders/stripe/create-invoice`). Open the hosted invoice to pay; this app
                      will poll until the order is marked paid.
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
                              Payment recorded — you can return to billing.
                            </p>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="w-full sm:w-auto"
                              asChild
                            >
                              <Link href={`/o/${encodeURIComponent(accountId)}/billing`}>
                                Back to billing
                              </Link>
                            </Button>
                          </div>
                        ) : (
                          <p className="text-muted-foreground text-xs">
                            Waiting for webhook confirmation after you pay… (up to ~2 minutes)
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
                        onClick={() => void submitStripeImmediateInvoice()}
                        className="w-full sm:w-auto"
                      >
                        {stripeImmediatePending ? "Generating invoice…" : "Generate Stripe invoice"}
                      </Button>
                    </div>
                  </div>
                ) : null}

                <div className="flex flex-col gap-4">
                  <Button
                    type="button"
                    variant="brand"
                    size="lg"
                    disabled={!canSubmitInvoice}
                    onClick={() => void submitInvoiceRequest()}
                    className="shadow-primary/20 h-14 w-full text-lg font-black tracking-[0.2em] uppercase shadow-2xl"
                  >
                    {invoiceMutation.isPending ? "Submitting…" : "Submit invoice request"}
                    {!invoiceMutation.isPending ? (
                      <ChevronRight className="ml-2 h-5 w-5" aria-hidden />
                    ) : null}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-muted-foreground w-full text-xs font-bold tracking-widest uppercase"
                    onClick={() => setStep(canCard && canInvoice ? 3 : 2)}
                  >
                    Back
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-xs">
        <span>Step {step} of 4</span>
        <span aria-hidden>·</span>
        <Button type="button" variant="link" className="h-auto p-0 text-xs" asChild>
          <Link href={`/o/${encodeURIComponent(accountId)}/billing`}>
            Cancel and return to billing
          </Link>
        </Button>
      </div>
      <CreateSubscriptionWizardStatePanel
        step={step}
        selectedTierId={selectedTierId}
        startDate={startDate}
        paymentPath={paymentPath}
        planCategoryFilter={planCategoryFilter}
        effectivePlanCategory={effectivePlanCategory}
        showPlanCategoryToggle={showPlanCategoryToggle}
        orderedCategories={orderedCategories}
        tiersListLength={tiersList.length}
        displayTiersLength={displayTiers.length}
        displayTierIds={displayTierIds}
        selectedTierPreview={selectedTierPreview}
        canCard={canCard}
        canInvoice={canInvoice}
        wizardBlocked={wizardBlocked}
        billingUiMode={mode}
        minDate={minDate}
        dateOk={dateOk}
        startOkInvoice={startOkInvoice}
        requiredInvoiceFilled={requiredInvoiceFilled}
        canSubmitInvoice={canSubmitInvoice}
        tiersQueryStatus={tiersQ.status}
        tiersQueryFetchStatus={tiersQ.fetchStatus}
        checkoutPending={checkoutMutation.isPending}
        invoicePending={invoiceMutation.isPending}
        checkoutError={checkoutError}
        invoiceError={invoiceError}
        missingCheckoutUrl={missingCheckoutUrl}
        showStripeImmediateInvoice={showStripeImmediateInvoice}
        stripeImmediatePending={stripeImmediatePending}
        stripeImmediateError={stripeImmediateError}
        stripeHostedUrl={stripeHostedUrl}
        stripeCreatedOrderId={stripeCreatedOrderId}
        stripeInvoicePaidDetected={stripeInvoicePaidDetected}
      />
      <BillingDebugPanel
        accountId={accountId}
        contextLabel="Create subscription"
        summary={summary}
        isSummaryLoading={false}
      />
    </div>
  );
}
