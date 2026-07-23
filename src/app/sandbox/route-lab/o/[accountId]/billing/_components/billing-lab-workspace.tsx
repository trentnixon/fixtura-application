"use client";

import { addYears, format, startOfDay } from "date-fns";
import { AlertTriangle, CreditCard, FileText, Receipt, RefreshCw } from "lucide-react";
import Link from "next/link";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { TypographyH3, TypographyMuted } from "@/components/typography";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeader, Surface } from "@/components/ui/container";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { billingStatusLabel } from "@/features/route-lab/billing/billing-lab-fixtures";
import {
  createLabCheckout,
  createLabInvoiceRequest,
  canShowLabStartTrial,
  getLabBillingSummary,
  getLabAvailableBillingTiers,
  getLabOrgTrialPresentation,
  isLabTrialHeroScenario,
  resolveBillingLabPathHighlight,
  startLabTrial,
} from "@/features/route-lab/billing/billing-lab-mock-client";
import {
  BILLING_LAB_PATH_TRACKER_STEPS,
  BILLING_LAB_TRIAL_DAYS,
  type BillingLabMode,
  type LabBillingSummary,
  type LabBillingTier,
  type MockCheckoutResponse,
  type MockInvoiceRequestResponse,
} from "@/features/route-lab/billing/lab-billing-types";
import { ROUTES } from "@/lib/config/routes";
import { cn } from "@/lib/utils";

export type BillingLabWorkspaceProps = {
  accountId: string;
  /** Resolved fixture key (after mode + default-state mapping). */
  scenarioKey: string;
  labMode: BillingLabMode;
  /** Raw `state` query for developer labels. */
  devStateParam: string;
};

const WIZARD_STEPS = [
  {
    id: 1,
    title: "Choose your plan",
    description:
      "Pick club or association — each org type has three passes (1 month, 3 months, full season) with different weekly and total pricing.",
  },
  {
    id: 2,
    title: "Pass start date",
    description: "When should access begin (lab estimate for end date).",
  },
  {
    id: 3,
    title: "Checkout or invoice",
    description: "Simulate card checkout or an invoice request — no real charges.",
  },
] as const;

/** Fixed locale so SSR and browser produce identical currency/date strings (avoids hydration mismatch). */
function localeForCurrency(currency: string): string {
  const c = currency.trim().toUpperCase();
  if (c === "AUD") return "en-AU";
  if (c === "USD") return "en-US";
  if (c === "GBP") return "en-GB";
  if (c === "EUR") return "de-DE";
  return "en-AU";
}

function formatMoney(amount: number, currency: string): string {
  const c = currency?.trim() || "AUD";
  try {
    return new Intl.NumberFormat(localeForCurrency(c), { style: "currency", currency: c }).format(
      amount,
    );
  } catch {
    return `${amount} ${c}`;
  }
}

function formatDateLabel(value: string | null): string {
  if (!value) return "—";
  const d = new Date(`${value}T12:00:00`);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString("en-AU");
}

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function addDaysIso(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T12:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Aligns with interaction-lab calendar (local day, midnight-normalised). */
function parseBillingLabIsoToCalendarDate(iso: string): Date | undefined {
  if (!iso) return undefined;
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return undefined;
  return startOfDay(d);
}

/** E.g. "1 Month Pass" → `Select 1 Month plan` for CTA copy. */
function selectPlanButtonLabel(tierName: string): string {
  const planPhrase = tierName.replace(/\s+pass$/i, " plan");
  return `Select ${planPhrase}`;
}

export function BillingLabWorkspace({
  accountId,
  scenarioKey,
  labMode,
  devStateParam,
}: BillingLabWorkspaceProps) {
  const isWizard = labMode === "wizard";
  const [wizardStep, setWizardStep] = useState(1);
  const [showActiveLabTools, setShowActiveLabTools] = useState(false);

  const [summaryOverride, setSummaryOverride] = useState<LabBillingSummary | null>(null);
  const [planOrgCategory, setPlanOrgCategory] = useState<LabBillingTier["category"]>("Club");
  const [selectedTierId, setSelectedTierId] = useState<string | null>(null);
  const [requestedStartDate, setRequestedStartDate] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"none" | "card" | "invoice">("none");
  const [checkoutStarted, setCheckoutStarted] = useState(false);
  const [checkoutResponse, setCheckoutResponse] = useState<MockCheckoutResponse | null>(null);
  const [stripeReturnSimulated, setStripeReturnSimulated] = useState(false);
  const [invoiceSubmitted, setInvoiceSubmitted] = useState(false);
  const [invoiceResponse, setInvoiceResponse] = useState<MockInvoiceRequestResponse | null>(null);
  const [pathRefreshed, setPathRefreshed] = useState(false);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [invoiceOrgName, setInvoiceOrgName] = useState("");
  const [invoiceEmail, setInvoiceEmail] = useState("");
  const [invoiceNotes, setInvoiceNotes] = useState("");

  const fixtureSummary = useMemo(
    () => getLabBillingSummary(accountId, scenarioKey),
    [accountId, scenarioKey],
  );
  const effectiveSummary = summaryOverride ?? fixtureSummary;
  const orgTrialPresentation = useMemo(
    () => getLabOrgTrialPresentation(effectiveSummary),
    [effectiveSummary],
  );
  const showTrialHero = isWizard && isLabTrialHeroScenario(effectiveSummary);
  const showLabStartTrial = canShowLabStartTrial(effectiveSummary);
  const tiers = useMemo(
    () => getLabAvailableBillingTiers(accountId, planOrgCategory),
    [accountId, planOrgCategory],
  );

  const selectedTier = useMemo(() => {
    if (!selectedTierId) return null;
    return tiers.find((t) => t.id === selectedTierId) ?? null;
  }, [selectedTierId, tiers]);

  const estimatedEndDate =
    selectedTier && requestedStartDate
      ? addDaysIso(requestedStartDate, selectedTier.daysInPass)
      : null;

  const seasonCalendarToday = startOfDay(new Date());
  const seasonCalendarEndMonth = addYears(seasonCalendarToday, 5);
  const selectedSeasonDate = parseBillingLabIsoToCalendarDate(requestedStartDate);

  useEffect(() => {
    const fresh = getLabBillingSummary(accountId, scenarioKey);
    setSummaryOverride(null);
    setWizardStep(1);
    setShowActiveLabTools(false);
    setPlanOrgCategory(fresh.currentPlan?.category ?? "Club");
    setSelectedTierId(fresh.currentPlan?.id ?? null);
    setRequestedStartDate(fresh.currentPlan ? todayIsoDate() : "");
    setPaymentMethod("none");
    setCheckoutStarted(false);
    setCheckoutResponse(null);
    setStripeReturnSimulated(false);
    setInvoiceSubmitted(false);
    setInvoiceResponse(null);
    setPathRefreshed(false);
    setShowInvoiceForm(false);
    setInvoiceOrgName(fresh.accountName);
    setInvoiceEmail("billing-lab@example.test");
    setInvoiceNotes("");
  }, [accountId, scenarioKey, labMode]);

  useEffect(() => {
    setSelectedTierId((prev) => {
      if (!prev) return prev;
      const allowed = getLabAvailableBillingTiers(accountId, planOrgCategory);
      return allowed.some((t) => t.id === prev) ? prev : null;
    });
  }, [planOrgCategory, accountId]);

  const pathHighlight = resolveBillingLabPathHighlight({
    selectedTierId,
    requestedStartDate: requestedStartDate || null,
    paymentMethod,
    checkoutStarted,
    stripeReturnSimulated,
    invoiceSubmitted,
    refreshed: pathRefreshed,
  });

  const canTryCheckout =
    Boolean(selectedTier && requestedStartDate) &&
    effectiveSummary.availableActions.canStartCheckout;
  const canTryInvoice =
    Boolean(selectedTier && requestedStartDate) &&
    effectiveSummary.availableActions.canRequestInvoice;

  function handleStartCardCheckout() {
    if (!selectedTier) {
      toast.message("Select a plan first");
      return;
    }
    if (!requestedStartDate) {
      toast.message("Choose a start date");
      return;
    }
    const res = createLabCheckout(accountId, {
      tierId: selectedTier.id,
      tierName: selectedTier.name,
      requestedStartDate,
    });
    setPaymentMethod("card");
    setCheckoutStarted(true);
    setCheckoutResponse(res);
    toast.success("Route lab: checkout simulated", {
      description: "No Stripe session created. checkoutUrl is null.",
    });
  }

  function handleInvoiceSubmit(e: FormEvent) {
    e.preventDefault();
    if (!selectedTier) return;
    const res = createLabInvoiceRequest(accountId, {
      tierId: selectedTier.id,
      tierName: selectedTier.name,
      requestedStartDate,
      organisationLegalName: invoiceOrgName || "Unnamed org",
      billingEmail: invoiceEmail || "unknown@example.test",
      notes: invoiceNotes,
    });
    setPaymentMethod("invoice");
    setInvoiceSubmitted(true);
    setInvoiceResponse(res);
    setShowInvoiceForm(false);
    toast.success("Route lab: invoice request mocked", {
      description: res.message,
    });
  }

  function handleStartLabTrial() {
    if (!canShowLabStartTrial(effectiveSummary)) {
      toast.message("Trial cannot be started in this fixture.");
      return;
    }
    setSummaryOverride(startLabTrial(getLabBillingSummary(accountId, scenarioKey)));
    toast.success("Trial started (lab mock)", {
      description: `${BILLING_LAB_TRIAL_DAYS}-day trial from today. No backend calls.`,
    });
  }

  function mergeSummaryPatch(patch: Partial<LabBillingSummary>) {
    setSummaryOverride((prev) => {
      const base = prev ?? getLabBillingSummary(accountId, scenarioKey);
      return { ...base, ...patch };
    });
  }

  function simulateStripeSuccess() {
    setStripeReturnSimulated(true);
    mergeSummaryPatch({
      billingStatus: "active",
      accessStatus: "active",
      activeOrder: {
        id: checkoutResponse?.orderId ?? `ord_lab_ok_${Date.now()}`,
        status: "paid",
        paymentStatus: "paid",
        startDate: requestedStartDate,
        endDate: estimatedEndDate,
        daysRemaining: selectedTier?.daysInPass ?? null,
        hostedInvoiceUrl: null,
        invoicePdf: null,
        labOnly: true,
      },
    });
    toast.message("Lab: treated return as successful payment");
  }

  function simulateStripeProcessing() {
    setStripeReturnSimulated(true);
    setSummaryOverride((prev) => {
      const base = prev ?? getLabBillingSummary(accountId, scenarioKey);
      return {
        ...base,
        billingStatus: "payment_pending",
        accessStatus: "pending",
        activeOrder: base.activeOrder ?? {
          id: `ord_lab_proc_${Date.now()}`,
          status: "processing",
          paymentStatus: "processing",
          startDate: requestedStartDate || null,
          endDate: estimatedEndDate,
          daysRemaining: null,
          hostedInvoiceUrl: null,
          invoicePdf: null,
          labOnly: true,
        },
      };
    });
    toast.message("Lab: return simulated as processing");
  }

  function simulateStripeFailed() {
    setStripeReturnSimulated(true);
    setSummaryOverride((prev) => {
      const base = prev ?? getLabBillingSummary(accountId, scenarioKey);
      return {
        ...base,
        billingStatus: "payment_failed",
        accessStatus: "restricted",
        activeOrder: base.activeOrder
          ? {
              ...base.activeOrder,
              status: "failed",
              paymentStatus: "failed",
            }
          : null,
      };
    });
    toast.message("Lab: return simulated as failed");
  }

  function simulateStripeCancelled() {
    setStripeReturnSimulated(true);
    mergeSummaryPatch({
      billingStatus: "cancelled",
      accessStatus: "restricted",
    });
    toast.message("Lab: return simulated as cancelled");
  }

  const successHref =
    checkoutResponse != null
      ? `${ROUTES.routeLab}/o/${accountId}/billing/success?session_id=${encodeURIComponent(checkoutResponse.checkoutSessionId)}`
      : `${ROUTES.routeLab}/o/${accountId}/billing/success`;

  const cancelHref =
    checkoutResponse != null
      ? `${ROUTES.routeLab}/o/${accountId}/billing/cancelled?session_id=${encodeURIComponent(checkoutResponse.checkoutSessionId)}`
      : `${ROUTES.routeLab}/o/${accountId}/billing/cancelled`;

  const plan = effectiveSummary.currentPlan;
  const order = effectiveSummary.activeOrder;

  const paymentPanel = (
    <>
      <div className="flex flex-wrap gap-2">
        <Button type="button" disabled={!canTryCheckout} onClick={handleStartCardCheckout}>
          Pay with card (lab)
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={!canTryInvoice}
          onClick={() => {
            setShowInvoiceForm(true);
            setPaymentMethod("invoice");
          }}
        >
          Request invoice (lab)
        </Button>
        {!isWizard ? (
          <Button
            type="button"
            variant="outline"
            disabled={!checkoutStarted}
            onClick={() => setPathRefreshed((v) => !v)}
          >
            Toggle “billing refreshed” path step
          </Button>
        ) : null}
      </div>
      {!canTryCheckout && !canTryInvoice ? (
        <TypographyMuted className="mt-3 text-xs">
          This scenario&apos;s <code>availableActions</code> disable checkout and invoice. Change
          the <code>state</code> query to try those flows.
        </TypographyMuted>
      ) : null}

      {checkoutResponse ? (
        <div className="bg-muted mt-4 space-y-3 rounded-lg p-4">
          <p className="text-sm font-medium">Fake checkout response</p>
          <pre className="overflow-auto text-xs">{JSON.stringify(checkoutResponse, null, 2)}</pre>
          <div className="flex flex-wrap gap-2">
            <span className="text-muted-foreground w-full text-xs">Simulate Stripe return:</span>
            <Button size="sm" variant="secondary" type="button" onClick={simulateStripeSuccess}>
              Success
            </Button>
            <Button size="sm" variant="secondary" type="button" onClick={simulateStripeProcessing}>
              Processing
            </Button>
            <Button size="sm" variant="secondary" type="button" onClick={simulateStripeFailed}>
              Failed
            </Button>
            <Button size="sm" variant="secondary" type="button" onClick={simulateStripeCancelled}>
              Cancelled
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            <Button size="sm" variant="outline" asChild>
              <Link href={successHref}>Open success route (lab)</Link>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <Link href={cancelHref}>Open cancelled route (lab)</Link>
            </Button>
          </div>
        </div>
      ) : null}

      {invoiceResponse ? (
        <div className="bg-muted mt-4 rounded-lg p-4">
          <p className="text-sm font-medium">Fake invoice request response</p>
          <pre className="mt-2 overflow-auto text-xs">
            {JSON.stringify(invoiceResponse, null, 2)}
          </pre>
        </div>
      ) : null}
    </>
  );

  const orgPlanToggle = (
    <div className="space-y-2">
      <Label className="text-xs font-medium">Organisation type</Label>
      <ToggleGroup
        type="single"
        variant="outline"
        spacing={0}
        value={planOrgCategory}
        onValueChange={(v) => {
          if (v === "Club" || v === "Association") setPlanOrgCategory(v);
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
  );

  const tierGrid = (
    <div className="space-y-4">
      {orgPlanToggle}
      <div className="grid gap-3 md:grid-cols-3">
        {tiers.map((tier: LabBillingTier) => {
          const active = selectedTierId === tier.id;
          const weekly =
            tier.priceByWeekInPass != null
              ? `${formatMoney(tier.priceByWeekInPass, tier.currency)}/week`
              : null;
          const metaLine = [tier.tagline, tier.coverageLabel, tier.promoLine]
            .filter(Boolean)
            .join(" · ");
          return (
            <Card
              key={tier.id}
              className={cn(
                "ring-primary/20 bg-primary/5 gap-0 pt-6 pb-0 transition-[box-shadow,ring]",
                active && "ring-primary ring-2",
              )}
            >
              <CardHeader className="gap-2 pb-3">
                <CardAction>
                  <Badge variant="outline">{tier.category}</Badge>
                </CardAction>
                <CardTitle className="text-primary pr-12 text-lg leading-snug font-semibold">
                  {tier.name}
                </CardTitle>
                {metaLine ? (
                  <p className="text-muted-foreground text-xs leading-snug font-medium">
                    {metaLine}
                  </p>
                ) : null}
              </CardHeader>
              <CardContent className="border-border/60 space-y-3 border-t pt-4 pb-4">
                <TypographyMuted className="max-h-30 overflow-y-auto text-sm leading-relaxed">
                  {tier.description}
                </TypographyMuted>
                <p className="text-muted-foreground text-[0.65rem] leading-snug">
                  {tier.includeSponsors ? "Sponsors included · " : ""}
                  {tier.includedAssetTypes.join(" · ")}
                </p>
              </CardContent>
              <CardFooter className="flex-col items-stretch gap-3 border-t pt-4 pb-6">
                <div
                  className={cn(
                    "flex flex-wrap items-end gap-x-8 gap-y-2",
                    weekly ? "justify-between" : "justify-end",
                  )}
                >
                  {weekly ? (
                    <div className="text-left">
                      <p className="text-muted-foreground text-xs font-medium uppercase">
                        Per week
                      </p>
                      <p className="text-primary text-lg font-semibold tabular-nums">{weekly}</p>
                    </div>
                  ) : null}
                  <div className="text-right">
                    <p className="text-muted-foreground text-xs font-medium uppercase">
                      Total cost
                    </p>
                    <p className="text-lg font-semibold tabular-nums">
                      {formatMoney(tier.price, tier.currency)}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="accent"
                  className="w-full"
                  onClick={() => setSelectedTierId(tier.id)}
                >
                  {active ? "Selected" : selectPlanButtonLabel(tier.name)}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );

  const dateBlock = (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      <Card className="w-full shrink-0 lg:max-w-md">
        <CardHeader>
          <CardTitle>Payment Season Start</CardTitle>
          <CardDescription>
            Select when access should begin (maps to{" "}
            <code className="text-xs">requestedStartDate</code>). Same pattern as{" "}
            <Link
              className="text-primary underline-offset-4 hover:underline"
              href={`${ROUTES.interactionLab}/calendar`}
            >
              Payment season start
            </Link>{" "}
            in the interaction lab. Dates before today are disabled.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          <Calendar
            mode="single"
            selected={selectedSeasonDate}
            onSelect={(d) => setRequestedStartDate(d ? format(d, "yyyy-MM-dd") : "")}
            captionLayout="dropdown"
            startMonth={seasonCalendarToday}
            endMonth={seasonCalendarEndMonth}
            disabled={{ before: seasonCalendarToday }}
            className="rounded-md border shadow"
          />
          <div className="min-h-5 w-full text-center text-sm font-medium">
            {selectedSeasonDate ? (
              <p>
                Selected date:{" "}
                <span className="text-primary">{format(selectedSeasonDate, "PPP")}</span>
              </p>
            ) : (
              <p className="text-muted-foreground">No date selected</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-end border-t pt-6 pb-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => setRequestedStartDate("")}
            disabled={!requestedStartDate}
          >
            Reset
          </Button>
        </CardFooter>
      </Card>
      <div className="min-w-0 flex-1 space-y-3">
        <p className="text-muted-foreground text-xs font-semibold uppercase">
          Pass end (lab estimate)
        </p>
        {selectedTier && estimatedEndDate ? (
          <div className="rounded-lg border border-dashed p-3 text-sm">
            <p className="text-muted-foreground text-xs font-medium uppercase">Lab estimate only</p>
            <p className="mt-1">
              estimatedEndDate = start + {selectedTier.daysInPass} days →{" "}
              <strong>{estimatedEndDate}</strong>
            </p>
          </div>
        ) : (
          <TypographyMuted className="text-xs">Select a plan to see estimated end.</TypographyMuted>
        )}
      </div>
    </div>
  );

  const statusGrid = (
    <div className="grid gap-4 md:grid-cols-2">
      <Surface className="p-5">
        <h3 className="text-sm font-semibold">Billing status (mock)</h3>
        <Separator className="my-3" />
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Billing</dt>
            <dd>
              <Badge variant="secondary">
                {billingStatusLabel(effectiveSummary.billingStatus)}
              </Badge>
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Access</dt>
            <dd className="capitalize">{effectiveSummary.accessStatus}</dd>
          </div>
        </dl>
        <Separator className="my-3" />
        <p className="text-muted-foreground text-xs font-medium uppercase">Available actions</p>
        <ul className="mt-2 grid gap-1 text-xs">
          {(
            Object.entries(effectiveSummary.availableActions) as [
              keyof LabBillingSummary["availableActions"],
              boolean,
            ][]
          ).map(([k, v]) => (
            <li key={k} className="flex justify-between gap-2">
              <span className="text-muted-foreground">{k.replace(/([A-Z])/g, " $1").trim()}</span>
              <span>{v ? "Yes" : "No"}</span>
            </li>
          ))}
        </ul>
        <Separator className="my-3" />
        <p className="text-muted-foreground text-xs font-medium uppercase">
          Organisation trial (mock)
        </p>
        <dl className="mt-2 space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">consumptionStatus</dt>
            <dd>{effectiveSummary.organisationTrial.consumptionStatus ?? "—"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">allocationStatus</dt>
            <dd>{effectiveSummary.organisationTrial.allocationStatus ?? "—"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">canStartTrial</dt>
            <dd>{effectiveSummary.organisationTrial.canStartTrial ? "Yes" : "No"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Presentation</dt>
            <dd className="font-medium">{orgTrialPresentation.presentation}</dd>
          </div>
          {orgTrialPresentation.failClosed && orgTrialPresentation.reason ? (
            <div>
              <dt className="text-muted-foreground text-xs uppercase">Fail-closed reason</dt>
              <dd className="mt-1 text-xs">{orgTrialPresentation.reason}</dd>
            </div>
          ) : null}
        </dl>
        {isWizard && !showTrialHero ? (
          <>
            <Separator className="my-3" />
            <ol className="grid gap-4 sm:grid-cols-3">
              {WIZARD_STEPS.map((s) => {
                const done = wizardStep > s.id;
                const current = wizardStep === s.id;
                return (
                  <li
                    key={s.id}
                    className={cn(
                      "rounded-lg border p-4",
                      current && "border-primary bg-primary/5 ring-primary/20 ring-2",
                      done && "border-muted opacity-80",
                    )}
                  >
                    <p className="text-muted-foreground text-xs font-semibold uppercase">
                      Step {s.id}
                    </p>
                    <p className="mt-1 font-semibold">{s.title}</p>
                    <TypographyMuted className="mt-1 text-xs">{s.description}</TypographyMuted>
                  </li>
                );
              })}
            </ol>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={wizardStep <= 1}
                onClick={() => setWizardStep((s) => Math.max(1, s - 1))}
              >
                Back
              </Button>
              <Button
                type="button"
                disabled={
                  (wizardStep === 1 && !selectedTierId) ||
                  (wizardStep === 2 && !requestedStartDate) ||
                  wizardStep >= 3
                }
                onClick={() => setWizardStep((s) => Math.min(3, s + 1))}
              >
                Next
              </Button>
            </div>
          </>
        ) : null}
      </Surface>

      <Surface className="p-5">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <RefreshCw className="size-4" /> Trial (mock)
        </h3>
        <Separator className="my-3" />
        {effectiveSummary.trial.isActive || effectiveSummary.trial.isEligible ? (
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Eligible</dt>
              <dd>{effectiveSummary.trial.isEligible ? "Yes" : "No"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Active</dt>
              <dd>{effectiveSummary.trial.isActive ? "Yes" : "No"}</dd>
            </div>
            {effectiveSummary.trial.daysRemaining != null ? (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Days left</dt>
                <dd>{effectiveSummary.trial.daysRemaining}</dd>
              </div>
            ) : null}
          </dl>
        ) : (
          <TypographyMuted className="text-sm">No trial in this fixture.</TypographyMuted>
        )}
      </Surface>

      {effectiveSummary.activeOrder ? (
        <Surface className="p-5 md:col-span-2">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <Receipt className="size-4" /> Active order (mock)
          </h3>
          <Separator className="my-3" />
          <pre className="bg-muted max-h-48 overflow-auto rounded-lg p-3 text-xs">
            {JSON.stringify(effectiveSummary.activeOrder, null, 2)}
          </pre>
        </Surface>
      ) : null}

      {effectiveSummary.latestInvoiceRequest ? (
        <Surface className="p-5 md:col-span-2">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <FileText className="size-4" /> Latest invoice request (mock)
          </h3>
          <Separator className="my-3" />
          <pre className="bg-muted max-h-48 overflow-auto rounded-lg p-3 text-xs">
            {JSON.stringify(effectiveSummary.latestInvoiceRequest, null, 2)}
          </pre>
        </Surface>
      ) : null}
    </div>
  );

  return (
    <div className="space-y-8">
      <div
        className="flex items-start gap-3 rounded-xl border border-amber-500/40 bg-amber-950/15 p-4"
        role="status"
      >
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400" />
        <div>
          <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
            LABS-only billing prototype
          </p>
          <TypographyMuted className="mt-1 text-amber-900/85 dark:text-amber-100/85">
            Mock data and simulations only — no CMS, Stripe, or account access changes.
          </TypographyMuted>
        </div>
      </div>

      <PageHeader
        title={
          isWizard
            ? showTrialHero
              ? effectiveSummary.trial.isActive
                ? "Trial in progress"
                : "Trial available"
              : "Create a subscription"
            : "Your subscription"
        }
        description={
          isWizard
            ? showTrialHero
              ? `${effectiveSummary.accountName} — ${effectiveSummary.trial.isActive ? `${BILLING_LAB_TRIAL_DAYS}-day trial (mock).` : `Start a ${BILLING_LAB_TRIAL_DAYS}-day trial without the subscribe wizard.`} Fixture: state=${devStateParam} → ${scenarioKey}.`
              : `${effectiveSummary.accountName} — step-by-step subscribe flow. Developer fixture: state=${devStateParam} → ${scenarioKey}.`
            : `${effectiveSummary.accountName} — subscribed account snapshot. Developer fixture: state=${devStateParam} → ${scenarioKey}.`
        }
      />

      {isWizard && showTrialHero ? (
        <>
          <Surface className="p-6">
            {effectiveSummary.trial.isActive ? (
              <>
                <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                  Trial active (mock)
                </p>
                <TypographyH3 className="mt-2 text-xl font-bold">You are on a trial</TypographyH3>
                <TypographyMuted className="mt-2 max-w-prose">
                  This account is in a lab-only <strong>{BILLING_LAB_TRIAL_DAYS}-day trial</strong>.
                  Use <code className="text-xs">state=</code> and subscribe wizard scenarios when
                  you are ready to test paid plans.
                </TypographyMuted>
                <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-muted-foreground text-xs uppercase">Trial start</dt>
                    <dd className="font-medium">
                      {formatDateLabel(effectiveSummary.trial.startDate)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground text-xs uppercase">Trial end</dt>
                    <dd className="font-medium">
                      {formatDateLabel(effectiveSummary.trial.endDate)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground text-xs uppercase">
                      Days remaining (mock)
                    </dt>
                    <dd className="font-medium">{effectiveSummary.trial.daysRemaining ?? "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground text-xs uppercase">Billing status</dt>
                    <dd className="font-medium">
                      {billingStatusLabel(effectiveSummary.billingStatus)}
                    </dd>
                  </div>
                </dl>
              </>
            ) : (
              <>
                <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                  Free trial
                </p>
                <TypographyH3 className="mt-2 text-xl font-bold">Try Fixtura free</TypographyH3>
                <TypographyMuted className="mt-2 max-w-prose">
                  Start a <strong>{BILLING_LAB_TRIAL_DAYS}-day trial</strong> with no payment. The
                  multi-step subscribe wizard is hidden for this scenario — use other{" "}
                  <code className="text-xs">state</code> values (for example{" "}
                  <code className="text-xs">not_started</code>) when you need to test plan selection
                  and checkout.
                </TypographyMuted>
                <div className="mt-6">
                  <Button
                    type="button"
                    variant="accent"
                    disabled={!showLabStartTrial}
                    onClick={handleStartLabTrial}
                  >
                    Start {BILLING_LAB_TRIAL_DAYS}-day trial
                  </Button>
                </div>
              </>
            )}
          </Surface>
          {statusGrid}
        </>
      ) : isWizard ? (
        <>
          <section className="space-y-3">
            <h2 className="text-sm font-semibold tracking-wide uppercase">Journey (mock)</h2>
            <Surface className="p-4">
              <ol className="flex flex-wrap gap-2">
                {BILLING_LAB_PATH_TRACKER_STEPS.map((label, i) => (
                  <li key={label}>
                    <Badge
                      variant={i === pathHighlight ? "default" : "outline"}
                      className={cn(
                        "font-normal",
                        i < pathHighlight && "opacity-70",
                        i === pathHighlight && "ring-primary/30 ring-2",
                      )}
                    >
                      {i + 1}. {label}
                    </Badge>
                  </li>
                ))}
              </ol>
            </Surface>
          </section>

          {wizardStep === 1 ? (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold tracking-wide uppercase">Plans</h2>
              {tierGrid}
            </section>
          ) : null}

          {wizardStep === 2 ? <Surface className="p-5">{dateBlock}</Surface> : null}

          {wizardStep === 3 ? (
            <Surface className="p-5">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <CreditCard className="size-4" /> Payment
              </h3>
              <Separator className="my-3" />
              {paymentPanel}
            </Surface>
          ) : null}

          {statusGrid}
        </>
      ) : (
        <>
          {plan ? (
            <Card className="max-w-3xl overflow-hidden">
              <div className="from-primary via-brand-secondary to-brand-accent h-2 w-full bg-linear-to-r" />
              <div className="flex flex-col md:flex-row">
                <div className="flex-1 p-8">
                  <p className="text-muted-foreground mb-2 text-xs font-semibold tracking-wide uppercase">
                    Current plan (mock)
                  </p>
                  <TypographyH3 className="mb-2 text-2xl font-bold">{plan.name}</TypographyH3>
                  <TypographyMuted className="mb-6 max-w-prose leading-relaxed">
                    {plan.description}
                  </TypographyMuted>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{plan.category}</Badge>
                    {plan.includeSponsors ? (
                      <Badge variant="outline">Sponsors included</Badge>
                    ) : null}
                  </div>
                </div>
                <div className="bg-muted/30 flex w-full flex-col justify-between border-t p-8 md:w-72 md:border-t-0 md:border-l">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "size-2 shrink-0 rounded-full",
                          effectiveSummary.accessStatus === "active" && "bg-success",
                          effectiveSummary.accessStatus === "pending" && "bg-warning",
                          effectiveSummary.accessStatus === "restricted" && "bg-destructive",
                          effectiveSummary.accessStatus === "cancelled" && "bg-muted-foreground",
                        )}
                      />
                      <span className="text-xs font-semibold capitalize">
                        {effectiveSummary.accessStatus}
                      </span>
                    </div>
                    <TypographyMuted className="text-xs">
                      Billing: {billingStatusLabel(effectiveSummary.billingStatus)}
                    </TypographyMuted>
                    <div className="space-y-1 text-right">
                      {plan.priceByWeekInPass != null ? (
                        <p className="text-primary text-xl font-semibold tabular-nums">
                          {formatMoney(plan.priceByWeekInPass, plan.currency)}/week
                        </p>
                      ) : null}
                      {plan.tagline ? (
                        <p className="text-muted-foreground text-sm font-medium">{plan.tagline}</p>
                      ) : null}
                      {plan.promoLine ? (
                        <p className="text-muted-foreground text-xs">{plan.promoLine}</p>
                      ) : null}
                      {plan.coverageLabel ? (
                        <p className="text-sm font-medium">{plan.coverageLabel}</p>
                      ) : null}
                      <p className="text-muted-foreground pt-2 text-xs font-medium uppercase">
                        Total cost
                      </p>
                      <p className="text-2xl font-semibold tabular-nums">
                        {formatMoney(plan.price, plan.currency)}
                      </p>
                      <p className="text-muted-foreground text-sm">{plan.daysInPass}-day pass</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="default"
                    className="mt-8"
                    onClick={() => setShowActiveLabTools(true)}
                  >
                    Lab simulations
                  </Button>
                </div>
              </div>
              {order ? (
                <CardFooter className="border-border bg-muted/10 grid grid-cols-1 gap-3 border-t px-6 pt-6 pb-6 sm:grid-cols-3">
                  <div>
                    <p className="text-muted-foreground text-xs uppercase">Pass start</p>
                    <p className="font-medium">{formatDateLabel(order.startDate)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs uppercase">Pass end</p>
                    <p className="font-medium">{formatDateLabel(order.endDate)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs uppercase">Days remaining (mock)</p>
                    <p className="font-medium">{order.daysRemaining ?? "—"}</p>
                  </div>
                  <div className="sm:col-span-3">
                    <p className="text-muted-foreground text-xs uppercase">Payment status</p>
                    <p className="font-medium">{order.paymentStatus}</p>
                  </div>
                </CardFooter>
              ) : (
                <CardFooter className="border-t">
                  <TypographyMuted className="text-sm">
                    No active order on this fixture.
                  </TypographyMuted>
                </CardFooter>
              )}
            </Card>
          ) : (
            <Surface className="p-5">
              <TypographyMuted className="text-sm">
                No <code>currentPlan</code> on this fixture — pick another <code>state</code> or
                switch to <code>mode=wizard</code>.
              </TypographyMuted>
            </Surface>
          )}

          {statusGrid}

          <Surface className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold">Lab simulations</h3>
                <TypographyMuted className="text-xs">
                  Optional checkout/invoice mocks for renewal or edge-case testing.
                </TypographyMuted>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowActiveLabTools((v) => !v)}
              >
                {showActiveLabTools ? "Hide" : "Show"}
              </Button>
            </div>
            {showActiveLabTools ? (
              <div className="mt-4 space-y-6">
                <div>
                  <p className="text-muted-foreground mb-2 text-xs font-semibold uppercase">
                    Change plan selection (mock)
                  </p>
                  {tierGrid}
                </div>
                <div>
                  <p className="text-muted-foreground mb-2 text-xs font-semibold uppercase">
                    Pass start (mock)
                  </p>
                  {dateBlock}
                </div>
                <div>
                  <h4 className="mb-2 text-sm font-semibold">Simulated payment</h4>
                  {paymentPanel}
                </div>
              </div>
            ) : null}
          </Surface>
        </>
      )}

      {showInvoiceForm ? (
        <Surface className="p-5">
          <h3 className="text-sm font-semibold">Invoice request form (mock)</h3>
          <Separator className="my-3" />
          <form onSubmit={handleInvoiceSubmit} className="grid max-w-lg gap-4">
            <div className="space-y-2">
              <Label htmlFor="inv-org">Organisation legal name</Label>
              <Input
                id="inv-org"
                value={invoiceOrgName}
                onChange={(e) => setInvoiceOrgName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inv-email">Billing email</Label>
              <Input
                id="inv-email"
                type="email"
                value={invoiceEmail}
                onChange={(e) => setInvoiceEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inv-notes">Notes</Label>
              <Input
                id="inv-notes"
                value={invoiceNotes}
                onChange={(e) => setInvoiceNotes(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={!canTryInvoice}>
                Submit (lab)
              </Button>
              <Button type="button" variant="ghost" onClick={() => setShowInvoiceForm(false)}>
                Close
              </Button>
            </div>
          </form>
        </Surface>
      ) : null}
    </div>
  );
}
