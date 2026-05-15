"use client";

import { useQueryClient } from "@tanstack/react-query";
import { addYears, format, startOfDay } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { BrandedLoader } from "@/components/ui/branded-loader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
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

import { InvoiceRequestSubmittedState } from "./_components/InvoiceRequestSubmittedState";
import { ReviewCardPaymentStep } from "./_components/ReviewCardPaymentStep";
import { ReviewInvoiceRequestStep } from "./_components/ReviewInvoiceRequestStep";
import { SelectPaymentMethodStep } from "./_components/SelectPaymentMethodStep";
import { SelectStartDateStep } from "./_components/SelectStartDateStep";
import { SelectTimeframeStep } from "./_components/SelectTimeframeStep";
import { CreateSubscriptionWizardStatePanel } from "./create-subscription-wizard-state-panel";
import { deriveBillingUiMode } from "../_core/billing-state";
import { useBillingInvoiceContactPrefill } from "../_hooks/useBillingInvoiceContactPrefill";
import { useCreateSubscriptionReviewDisplay } from "./_hooks/useCreateSubscriptionReviewDisplay";
import { createStrapiStripeInvoice } from "./actions/create-stripe-invoice";
import { shouldShowPlanCheckout } from "../_utils/create-subscription/checkoutActionGate";
import {
  computePassEndDateYyyyMmDd,
  parseBillingIsoToCalendarDate,
} from "../_utils/create-subscription/passEndDateFromWizardStart";
import { orderedDistinctSubscriptionCategories } from "../_utils/create-subscription/planTierCard";
import { shouldShowStripeImmediateInvoiceCreate } from "../_utils/create-subscription/shouldShowStripeImmediateInvoice";
import { extractHostedInvoiceFromOrderPayload } from "../_utils/orders/hostedInvoiceFromOrderPayload";
import { BillingDebugPanel } from "../debug/billing-debug-panel";
import { shouldShowInvoiceRequest } from "../invoice-request/billing-invoice-request";

import type { PaymentPath } from "./_types/createSubscriptionWizard";
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
  const [invoiceSubmitted, setInvoiceSubmitted] = useState(false);
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
    if (invoiceSubmitted) return;
    if (redirectingRef.current) return;
    if (wizardBlocked) {
      redirectingRef.current = true;
      router.replace(`/o/${encodeURIComponent(accountId)}/billing`);
    }
  }, [accountId, invoiceSubmitted, mode, router, segmentOk, summary, wizardBlocked]);

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
  const today = startOfDay(new Date());
  const endMonth = addYears(today, 5);
  const selectedDate = parseBillingIsoToCalendarDate(startDate);
  const dateOk = startDate.length > 0 && startDate >= minDate;
  const selectedTier = tiersList.find((t) => t.id === selectedTierId);
  const { selectedTierName, selectedTierCoverage, paymentMethodLabel, paymentMethodDescription } =
    useCreateSubscriptionReviewDisplay({
      selectedTier,
      selectedTierId,
      paymentPath,
    });

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
        <p>Redirecting...</p>
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
        <p>Redirecting...</p>
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

  if (invoiceSubmitted) {
    return (
      <div className="grid gap-6">
        <InvoiceRequestSubmittedState
          accountId={accountId}
          selectedTierName={selectedTierName}
          selectedTierCoverage={selectedTierCoverage}
          selectedStartDateLabel={
            selectedDate != null ? format(selectedDate, "PPP") : startDate || "-"
          }
        />
        <BillingDebugPanel
          accountId={accountId}
          contextLabel="Create subscription"
          summary={summary}
          isSummaryLoading={false}
          extra={{ invoiceSubmitted: true }}
        />
      </div>
    );
  }

  if (wizardBlocked || mode == null) {
    return (
      <div className="text-muted-foreground grid gap-2 text-center text-sm" role="status">
        <p>Redirecting...</p>
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
        <p>Redirecting...</p>
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
              This account cannot start an online Season Pass purchase right now. Return to billing
              for the current account status, or contact support if you expected card checkout or an
              invoice request to be available.
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
      await queryClient.invalidateQueries({ queryKey: queryKeys.account.billing(accountId) });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.account.billingInvoiceRequests(accountId),
      });
      setInvoiceSubmitted(true);
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
      {invoiceSubmitted ? (
        <InvoiceRequestSubmittedState
          accountId={accountId}
          selectedTierName={selectedTierName}
          selectedTierCoverage={selectedTierCoverage}
          selectedStartDateLabel={
            selectedDate != null ? format(selectedDate, "PPP") : startDate || "-"
          }
        />
      ) : null}

      {!invoiceSubmitted && step === 1 ? (
        <SelectTimeframeStep
          tiersListLength={tiersList.length}
          displayTiers={displayTiers}
          selectedTierId={selectedTierId}
          showPlanCategoryToggle={showPlanCategoryToggle}
          effectivePlanCategory={effectivePlanCategory}
          onPlanCategoryChange={setPlanCategoryFilter}
          onSelectTierId={setSelectedTierId}
          onContinue={() => setStep(2)}
        />
      ) : null}

      {!invoiceSubmitted && step === 2 ? (
        <SelectStartDateStep
          selectedDate={selectedDate}
          daysInPass={selectedTier?.daysInPass}
          today={today}
          endMonth={endMonth}
          startDate={startDate}
          dateOk={dateOk}
          onStartDateChange={setStartDate}
          onBack={() => setStep(1)}
          onContinue={advancePastStep2}
        />
      ) : null}

      {!invoiceSubmitted && step === 3 ? (
        <SelectPaymentMethodStep
          canCard={canCard}
          canInvoice={canInvoice}
          paymentPath={paymentPath}
          onPaymentPathChange={setPaymentPath}
          onBack={() => setStep(2)}
          onContinue={() => setStep(4)}
        />
      ) : null}

      {!invoiceSubmitted && step === 4 && paymentPath === "card" ? (
        <ReviewCardPaymentStep
          selectedTier={selectedTier}
          selectedTierName={selectedTierName}
          selectedTierCoverage={selectedTierCoverage}
          selectedStartDateLabel={
            selectedDate != null ? format(selectedDate, "PPP") : startDate || "-"
          }
          paymentMethodLabel={paymentMethodLabel}
          paymentMethodDescription={paymentMethodDescription}
          checkoutError={checkoutError}
          missingCheckoutUrl={missingCheckoutUrl}
          canSubmit={Boolean(selectedTierId && dateOk && !checkoutMutation.isPending)}
          isPending={checkoutMutation.isPending}
          onSubmit={() => void submitCardCheckout()}
          onBack={() => setStep(canCard && canInvoice ? 3 : 2)}
        />
      ) : null}

      {!invoiceSubmitted && step === 4 && paymentPath === "invoice" ? (
        <ReviewInvoiceRequestStep
          accountId={accountId}
          selectedTier={selectedTier}
          selectedTierName={selectedTierName}
          selectedTierCoverage={selectedTierCoverage}
          selectedStartDateLabel={
            selectedDate != null ? format(selectedDate, "PPP") : startDate || "-"
          }
          paymentMethodLabel={paymentMethodLabel}
          paymentMethodDescription={paymentMethodDescription}
          billingContactName={billingContactName}
          billingEmail={billingEmail}
          billingOrganisationName={billingOrganisationName}
          notes={notes}
          onBillingContactNameChange={setBillingContactName}
          onBillingEmailChange={setBillingEmail}
          onBillingOrganisationNameChange={setBillingOrganisationName}
          onNotesChange={setNotes}
          invoiceError={invoiceError}
          showStripeImmediateInvoice={showStripeImmediateInvoice}
          stripeImmediateError={stripeImmediateError}
          stripeHostedUrl={stripeHostedUrl}
          stripeInvoicePaidDetected={stripeInvoicePaidDetected}
          stripeImmediatePending={stripeImmediatePending}
          canSubmitStripeImmediate={canSubmitStripeImmediate}
          onSubmitStripeImmediateInvoice={() => void submitStripeImmediateInvoice()}
          canSubmitInvoice={canSubmitInvoice}
          invoicePending={invoiceMutation.isPending}
          onSubmitInvoice={() => void submitInvoiceRequest()}
          onBack={() => setStep(canCard && canInvoice ? 3 : 2)}
        />
      ) : null}

      {!invoiceSubmitted ? (
        <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-xs">
          <span>Step {step} of 4</span>
          <span aria-hidden>.</span>
          <Button type="button" variant="link" className="h-auto p-0 text-xs" asChild>
            <Link href={`/o/${encodeURIComponent(accountId)}/billing`}>
              Cancel and return to billing
            </Link>
          </Button>
        </div>
      ) : null}
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
        invoiceSubmitted={invoiceSubmitted}
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
