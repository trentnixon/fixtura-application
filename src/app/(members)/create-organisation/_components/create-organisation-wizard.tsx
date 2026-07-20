"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { InlineAlert } from "@/components/auth/actions";
import {
  TypographyFinePrint,
  TypographyPageDescription,
  TypographyPageTitle,
} from "@/components/typography";
import { BrandedLoader } from "@/components/ui/branded-loader";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GridCard, GridCardVisualSlot } from "@/components/ui/grid-card";
import { accountPickerRowsFromMePayload } from "@/lib/account/account-me-rows";
import {
  accountCreateBusyMessage,
  accountCreateBusyRetryAfterSeconds,
  isAccountCreateBusyError,
} from "@/lib/api/account-create-busy";
import { ApiError } from "@/lib/api/client/api-error";
import { useAccountMe } from "@/lib/api/hooks/account/useAccountMe";
import { useCreateFirstAccount } from "@/lib/api/hooks/account/useCreateFirstAccount";
import { useDeleteUnfinishedAccount } from "@/lib/api/hooks/account/useDeleteUnfinishedAccount";
import { useOnboardingLookupSports } from "@/lib/api/hooks/account/useOnboardingLookupSports";
import { useOnboardingOnboardingState } from "@/lib/api/hooks/account/useOnboardingOnboardingState";
import { parseOnboardingStatePayload } from "@/lib/api/parse-onboarding-state";
import { queryKeys } from "@/lib/api/query/query-keys";
import { accountApi } from "@/lib/api/services/account.api";
import { accountScopedRoutes, isValidAccountIdSegment } from "@/lib/config/account-routes";
import { ROUTES } from "@/lib/config/routes";
import { deleteUnfinishedAccountErrorMessage } from "@/lib/onboarding/delete-unfinished-account-error";
import { resolveAccountEntry } from "@/lib/onboarding/resolve-account-entry";
import { cn } from "@/lib/utils";

import { WizardStepBranding, type WizardStepBrandingHandle } from "./wizard-step-branding";
import { WizardStepContact, type WizardStepContactHandle } from "./wizard-step-contact";
import {
  WizardStepOrganisation,
  type WizardStepOrganisationHandle,
} from "./wizard-step-organisation";
import { WizardStepReview, type WizardStepReviewHandle } from "./wizard-step-review";

import type { OnboardingStateData } from "@/types/api/account";

const WIZARD_STEPS = [
  {
    key: "organisation",
    title: "Organisation and permission",
    description:
      "Organisation type, name, and authority to act for this organisation. Your answers are saved when you continue.",
  },
  {
    key: "branding",
    title: "Branding",
    description: "Add your logo and choose the colours that represent your brand.",
  },
  {
    key: "contact",
    title: "Contact and delivery",
    description: "Your contact name and where weekly assets should be sent.",
  },
  {
    key: "review",
    title: "Review and confirm",
    description: "Review your choices and confirm to complete setup.",
  },
] as const;

const TOTAL_WIZARD_STEPS = WIZARD_STEPS.length;

/** Sport / choice tiles — deliberate grid (not flex-wrap shrink of desktop). */
const CHOICE_CARD_GRID_CLASS =
  "grid w-full grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4";

const CHOICE_CARD_CLASS = "mx-0 h-full min-h-0 w-full min-w-0 max-w-none";

const WIZARD_FOOTER_CLASS =
  "flex w-full flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center";

const WIZARD_FOOTER_BTN_CLASS = "w-full sm:w-auto";

/** Two-letter initials for {@link GridCardVisualSlot} `org` preset (same idea as select-organisation). */
function initialsFromSportLabel(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

/** L1 labels still listed in lookups but not yet available in onboarding (case-insensitive). */
const COMING_SOON_SPORT_LABELS = new Set(
  ["afl", "hockey", "netball", "basketball"].map((s) => s.toLowerCase()),
);

function isComingSoonSportLabel(label: string): boolean {
  return COMING_SOON_SPORT_LABELS.has(label.trim().toLowerCase());
}

type PendingNav = "back" | "selection";

export function CreateOrganisationWizard() {
  const [stepIndex, setStepIndex] = useState(0);
  const [pendingNav, setPendingNav] = useState<PendingNav | null>(null);
  const [selectedSportId, setSelectedSportId] = useState("");
  const [step1Pending, setStep1Pending] = useState(false);
  const [step2Pending, setStep2Pending] = useState(false);
  const [step3Pending, setStep3Pending] = useState(false);
  const [step4Pending, setStep4Pending] = useState(false);
  const [wizardCompleted, setWizardCompleted] = useState(false);
  const [createdAccountId, setCreatedAccountId] = useState("");
  const [createAccountError, setCreateAccountError] = useState<string | null>(null);
  const [busyCooldownUntilMs, setBusyCooldownUntilMs] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const step1Ref = useRef<WizardStepOrganisationHandle>(null);
  const step2Ref = useRef<WizardStepBrandingHandle>(null);
  const step3Ref = useRef<WizardStepContactHandle>(null);
  const step4Ref = useRef<WizardStepReviewHandle>(null);
  const stepHydratedFromServerRef = useRef(false);
  const prevAccountIdFromQueryRef = useRef<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { data: meData, isPending: mePending, isError: meError } = useAccountMe();
  const createFirst = useCreateFirstAccount();
  const sportsQuery = useOnboardingLookupSports({ enabled: stepIndex === 0 });

  const accountPayload = meData?.data;
  const accountIdFromQuery = searchParams.get("accountId")?.trim() ?? "";
  const accountRows = useMemo(
    () => accountPickerRowsFromMePayload(accountPayload),
    [accountPayload],
  );
  const explicitResumeAccountId = useMemo(() => {
    if (!accountIdFromQuery || !isValidAccountIdSegment(accountIdFromQuery)) return "";
    const allowed = new Set(accountRows.map((r) => String(r.id)));
    return allowed.has(accountIdFromQuery) ? accountIdFromQuery : "";
  }, [accountIdFromQuery, accountRows]);
  /** Just-created blank id trusted until /account/me lists it (URL sync race). */
  const justCreatedAccountId =
    createdAccountId &&
    (!accountIdFromQuery || accountIdFromQuery === createdAccountId) &&
    isValidAccountIdSegment(createdAccountId)
      ? createdAccountId
      : "";
  const accountId = useMemo(() => {
    if (explicitResumeAccountId) return explicitResumeAccountId;
    if (justCreatedAccountId) return justCreatedAccountId;
    return "";
  }, [explicitResumeAccountId, justCreatedAccountId]);
  const accountIdQueryError = useMemo(() => {
    if (!accountIdFromQuery) return null;
    if (!isValidAccountIdSegment(accountIdFromQuery)) return "Invalid account id.";
    if (justCreatedAccountId && accountIdFromQuery === justCreatedAccountId) return null;
    if (mePending) return null;
    if (!explicitResumeAccountId) {
      return "We could not find that organisation on your account. Return to organisation selection and try again.";
    }
    return null;
  }, [accountIdFromQuery, explicitResumeAccountId, justCreatedAccountId, mePending]);

  const needsFirstAccount = useMemo(() => {
    if (accountIdFromQuery) return false;
    if (createdAccountId) return false;
    return true;
  }, [accountIdFromQuery, createdAccountId]);

  useEffect(() => {
    if (busyCooldownUntilMs == null) return;
    const remaining = busyCooldownUntilMs - Date.now();
    if (remaining <= 0) {
      setBusyCooldownUntilMs(null);
      return;
    }
    const timer = window.setTimeout(() => setBusyCooldownUntilMs(null), remaining);
    return () => window.clearTimeout(timer);
  }, [busyCooldownUntilMs]);

  useEffect(() => {
    const prev = prevAccountIdFromQueryRef.current;
    prevAccountIdFromQueryRef.current = accountIdFromQuery;
    if (prev === null) return;
    if (prev === accountIdFromQuery) return;
    // Query id changed to a different account — drop stale local create state / hydration.
    if (createdAccountId && accountIdFromQuery !== createdAccountId) {
      setCreatedAccountId("");
    }
    stepHydratedFromServerRef.current = false;
  }, [accountIdFromQuery, createdAccountId]);

  const onboardingStateQuery = useOnboardingOnboardingState(accountId, {
    enabled: Boolean(accountId),
  });

  const deleteAccountMutation = useDeleteUnfinishedAccount(accountId);

  const onboardingData = onboardingStateQuery.data;

  const entryIntent = onboardingData ? resolveAccountEntry(onboardingData) : null;

  useEffect(() => {
    if (!accountId || !onboardingData) return;
    if (resolveAccountEntry(onboardingData) === "dashboard") {
      router.replace(accountScopedRoutes.dashboard(accountId));
    }
  }, [accountId, onboardingData, router]);

  useEffect(() => {
    if (!accountId || !onboardingData) return;
    if (onboardingData.hasCompletedOnboardingWizard) return;
    if (stepHydratedFromServerRef.current) return;
    stepHydratedFromServerRef.current = true;
    if (onboardingData.onboardingWizardStatus === "in_progress") {
      const s = onboardingData.onboardingCurrentStep;
      if (s >= 1 && s <= 4) setStepIndex(s);
    } else if (onboardingData.onboardingWizardStatus === "not_started") {
      setStepIndex(1);
    }
  }, [accountId, onboardingData]);

  const isGetStarted = stepIndex === 0;
  const wizardStepNumber = stepIndex; // 1–4 when in wizard
  const isOrganisationStep = wizardStepNumber === 1;
  const isBrandingStep = wizardStepNumber === 2;
  const isContactStep = wizardStepNumber === 3;

  const sportsSorted = useMemo(() => {
    const list = sportsQuery.data?.data ?? [];
    return [...list].sort((a, b) => a.sortOrder - b.sortOrder);
  }, [sportsQuery.data?.data]);

  const goNext = useCallback(() => {
    setStepIndex((i) => Math.min(i + 1, TOTAL_WIZARD_STEPS));
  }, []);

  const goBack = useCallback(() => {
    setStepIndex((i) => Math.max(i - 1, 0));
  }, []);

  const handleConfirmNav = useCallback(() => {
    if (pendingNav === "back") {
      goBack();
    } else if (pendingNav === "selection") {
      router.push(ROUTES.selectOrganisation);
    }
    setPendingNav(null);
  }, [goBack, pendingNav, router]);

  const handleGetStarted = useCallback(() => {
    if (mePending || meError) return;
    if (!selectedSportId.trim()) return;
    if (busyCooldownUntilMs != null && Date.now() < busyCooldownUntilMs) return;
    if (needsFirstAccount) {
      if (createFirst.isPending) return;
      setCreateAccountError(null);
      createFirst.mutate(
        { sport: selectedSportId.trim(), hasCompletedStartSequence: true },
        {
          onSuccess: (res) => {
            const id = res.data.accountId;
            if (typeof id === "number" && Number.isFinite(id) && id > 0) {
              const idStr = String(id);
              setCreatedAccountId(idStr);
              setBusyCooldownUntilMs(null);
              setStepIndex(1);
              router.replace(`${ROUTES.createOrganisation}?accountId=${encodeURIComponent(idStr)}`);
              return;
            }
            setCreateAccountError("Account was created, but the new account id was missing.");
          },
          onError: (err) => {
            if (isAccountCreateBusyError(err)) {
              setCreateAccountError(accountCreateBusyMessage(err));
              const seconds = accountCreateBusyRetryAfterSeconds(err);
              setBusyCooldownUntilMs(Date.now() + seconds * 1000);
              return;
            }
            if (err instanceof Error) {
              setCreateAccountError(err.message);
            } else {
              setCreateAccountError("Could not prepare your organisation. Please try again.");
            }
          },
        },
      );
    } else {
      goNext();
    }
  }, [
    busyCooldownUntilMs,
    createFirst,
    goNext,
    meError,
    mePending,
    needsFirstAccount,
    router,
    selectedSportId,
  ]);

  const handleConfirmSuccess = useCallback(async () => {
    if (!accountId) {
      setWizardCompleted(true);
      return;
    }
    await queryClient.fetchQuery({
      queryKey: queryKeys.account.onboardingState(accountId),
      queryFn: async (): Promise<OnboardingStateData> => {
        const raw = await accountApi.getOnboardingOnboardingState(accountId);
        const parsed = parseOnboardingStatePayload(raw);
        if (!parsed) {
          throw new Error("Onboarding state response could not be parsed.");
        }
        return parsed;
      },
    });
    router.replace(accountScopedRoutes.dashboard(accountId));
  }, [accountId, queryClient, router]);

  const busyCooldownActive = busyCooldownUntilMs != null;
  const getStartedPending =
    mePending || (isGetStarted && createFirst.isPending) || (isGetStarted && busyCooldownActive);
  const getStartedError = useMemo(() => {
    if (!isGetStarted) return null;
    if (createAccountError) return createAccountError;
    if (createFirst.isError && createFirst.error) {
      if (isAccountCreateBusyError(createFirst.error)) {
        return accountCreateBusyMessage(createFirst.error);
      }
      if (createFirst.error instanceof Error) return createFirst.error.message;
    }
    return null;
  }, [createAccountError, createFirst.error, createFirst.isError, isGetStarted]);

  const sportChosen = useMemo(() => {
    if (!selectedSportId.trim()) return false;
    const sport = sportsSorted.find((x) => x.id === selectedSportId);
    if (!sport) return false;
    return !isComingSoonSportLabel(sport.label);
  }, [selectedSportId, sportsSorted]);

  const getStartedDisabled =
    getStartedPending || Boolean(meError) || !sportChosen || sportsQuery.isPending;

  const sportsLookupError =
    isGetStarted && sportsQuery.isError
      ? "We could not load sports. Refresh the page or try again later."
      : null;

  const navDialogCopy =
    pendingNav === "selection"
      ? {
          title: "Leave setup?",
          description:
            "You will return to organisation selection. You can resume setup later from there.",
          confirm: "Leave",
        }
      : pendingNav === "back" && wizardStepNumber === 1
        ? {
            title: "Go back?",
            description: "You will return to sport selection. Continue only if you are sure.",
            confirm: "Go back",
          }
        : pendingNav === "back"
          ? {
              title: "Go back?",
              description: "You will return to the previous step. Continue only if you are sure.",
              confirm: "Go back",
            }
          : { title: "", description: "", confirm: "" };

  if (accountId && onboardingStateQuery.isPending && !onboardingData) {
    return <BrandedLoader fullPage label="Loading onboarding state…" />;
  }

  if (accountIdQueryError) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 py-8 sm:px-6">
        <InlineAlert message={accountIdQueryError} variant="destructive" />
        <Button
          type="button"
          variant="accent"
          className="w-full sm:w-auto"
          onClick={() => router.push(ROUTES.selectOrganisation)}
        >
          Back to organisation selection
        </Button>
      </div>
    );
  }

  if (accountId && onboardingStateQuery.isError) {
    const errMsg =
      onboardingStateQuery.error instanceof ApiError
        ? onboardingStateQuery.error.message
        : "We could not load onboarding state. Try again or go back to organisation selection.";
    return (
      <div className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 py-8 sm:px-6">
        <InlineAlert message={errMsg} variant="destructive" />
        <Button
          type="button"
          variant="accent"
          className="w-full sm:w-auto"
          onClick={() => router.push(ROUTES.selectOrganisation)}
        >
          Back to organisation selection
        </Button>
      </div>
    );
  }

  if (accountId && entryIntent === "dashboard") {
    return <BrandedLoader fullPage label="Opening your organisation…" />;
  }

  const wizardStepper = !isGetStarted ? (
    <nav className="border-border/60 -mx-1 overflow-x-auto px-1" aria-label="Onboarding progress">
      <ol className="flex min-w-0 items-center justify-start gap-2 sm:flex-wrap sm:justify-center">
        {WIZARD_STEPS.map((step, i) => {
          const n = i + 1;
          const state =
            n === wizardStepNumber ? "current" : n < wizardStepNumber ? "done" : "upcoming";
          return (
            <li key={step.key} className="shrink-0">
              <span
                aria-label={`Step ${n}: ${step.title}`}
                aria-current={state === "current" ? "step" : undefined}
                className={
                  state === "current"
                    ? "bg-primary text-primary-foreground inline-flex min-h-9 items-center rounded-full px-3 py-1.5 text-xs font-medium sm:px-4"
                    : state === "done"
                      ? "bg-muted text-muted-foreground inline-flex min-h-9 items-center rounded-full px-3 py-1.5 text-xs font-medium sm:px-4"
                      : "text-muted-foreground inline-flex min-h-9 items-center rounded-full border border-dashed px-3 py-1.5 text-xs sm:px-4"
                }
              >
                <span className="sm:hidden" aria-hidden>
                  {n}
                </span>
                <span className="hidden sm:inline">
                  {n}. {step.title}
                </span>
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  ) : null;

  return (
    <div
      className={cn(
        "mx-auto flex w-full min-w-0 flex-col gap-6 px-4 py-4 pb-12 sm:px-6 lg:px-8",
        isGetStarted || isOrganisationStep || isBrandingStep ? "max-w-7xl" : "max-w-2xl",
      )}
    >
      {meError ? (
        <InlineAlert
          message="We could not load your account information. Try again or go back to organisation selection."
          variant="destructive"
        />
      ) : null}
      {getStartedError ? <InlineAlert message={getStartedError} variant="destructive" /> : null}

      {isGetStarted ? (
        <>
          <header className="flex flex-col gap-2">
            <TypographyPageTitle>Set up</TypographyPageTitle>
            <TypographyPageDescription>
              Choose the sport you want to set up.
            </TypographyPageDescription>
          </header>

          {sportsLookupError ? (
            <InlineAlert message={sportsLookupError} variant="destructive" />
          ) : null}
          {sportsQuery.isPending ? (
            <TypographyFinePrint className="text-muted-foreground text-center">
              Loading sports…
            </TypographyFinePrint>
          ) : (
            <div role="radiogroup" aria-label="Sport to set up" className={CHOICE_CARD_GRID_CLASS}>
              {sportsSorted.map((s) => {
                const comingSoon = isComingSoonSportLabel(s.label);
                const selected = selectedSportId === s.id && !comingSoon;
                return (
                  <GridCard
                    key={s.id}
                    className={CHOICE_CARD_CLASS}
                    title={s.label}
                    ctaLabel={comingSoon ? "Coming soon" : selected ? "Selected" : "Select"}
                    visual={
                      <GridCardVisualSlot visual="org" initials={initialsFromSportLabel(s.label)} />
                    }
                    tone={comingSoon ? "mute" : selected ? "success" : "default"}
                    disabled={comingSoon}
                    onClick={() => setSelectedSportId(s.id)}
                  />
                );
              })}
            </div>
          )}
          {!sportsQuery.isPending && sportsSorted.length === 0 && !sportsQuery.isError ? (
            <p className="text-muted-foreground text-center text-sm">
              No sports are available yet.
            </p>
          ) : null}

          <div className={WIZARD_FOOTER_CLASS}>
            <Button
              type="button"
              variant="accentOutline"
              className={WIZARD_FOOTER_BTN_CLASS}
              onClick={() => setPendingNav("selection")}
            >
              Back to selection
            </Button>
            <Button
              type="button"
              className={WIZARD_FOOTER_BTN_CLASS}
              onClick={handleGetStarted}
              disabled={getStartedDisabled}
            >
              {createFirst.isPending ? "Preparing…" : mePending ? "Loading…" : "Get started"}
            </Button>
          </div>
        </>
      ) : isOrganisationStep ? (
        <>
          <header className="flex flex-col gap-2">
            <TypographyPageTitle>{WIZARD_STEPS[0].title}</TypographyPageTitle>
            <TypographyPageDescription>{WIZARD_STEPS[0].description}</TypographyPageDescription>
          </header>
          {wizardStepper}
          <div className="min-w-0 text-sm">
            {!accountId ? (
              <InlineAlert
                message="No active account id. Go back to organisation selection or try Get started again."
                variant="destructive"
              />
            ) : (
              <WizardStepOrganisation
                ref={step1Ref}
                accountId={accountId}
                sportId={selectedSportId}
                onContinue={goNext}
                onPendingChange={setStep1Pending}
              />
            )}
          </div>
          <div className={WIZARD_FOOTER_CLASS}>
            <Button
              type="button"
              variant="destructive"
              className={WIZARD_FOOTER_BTN_CLASS}
              onClick={() => setPendingNav("back")}
            >
              Back
            </Button>
            <Button
              type="button"
              variant="accentOutline"
              className={WIZARD_FOOTER_BTN_CLASS}
              onClick={() => setPendingNav("selection")}
            >
              Back to selection
            </Button>
            <Button
              type="button"
              variant="brandPrimaryOutline"
              className={WIZARD_FOOTER_BTN_CLASS}
              onClick={() => {
                if (accountId) {
                  void step1Ref.current?.submit();
                }
              }}
              disabled={!accountId || step1Pending}
            >
              {step1Pending ? "Saving…" : "Next"}
            </Button>
          </div>
        </>
      ) : isBrandingStep ? (
        <>
          <header className="flex flex-col gap-2">
            <TypographyPageTitle>{WIZARD_STEPS[1].title}</TypographyPageTitle>
            <TypographyPageDescription>{WIZARD_STEPS[1].description}</TypographyPageDescription>
          </header>
          {wizardStepper}
          <div className="min-w-0">
            {!accountId ? (
              <InlineAlert
                message="No active account id. Go back to organisation selection or try Get started again."
                variant="destructive"
              />
            ) : (
              <WizardStepBranding
                ref={step2Ref}
                accountId={accountId}
                onContinue={goNext}
                onPendingChange={setStep2Pending}
              />
            )}
          </div>
          <div className={WIZARD_FOOTER_CLASS}>
            <Button
              type="button"
              variant="destructive"
              className={WIZARD_FOOTER_BTN_CLASS}
              onClick={() => setPendingNav("back")}
            >
              Back
            </Button>
            <Button
              type="button"
              variant="accentOutline"
              className={WIZARD_FOOTER_BTN_CLASS}
              onClick={() => setPendingNav("selection")}
            >
              Back to selection
            </Button>
            <Button
              type="button"
              variant="brandPrimaryOutline"
              className={WIZARD_FOOTER_BTN_CLASS}
              onClick={() => {
                if (accountId) {
                  void step2Ref.current?.submit();
                }
              }}
              disabled={!accountId || step2Pending}
            >
              {step2Pending ? "Saving…" : "Next"}
            </Button>
          </div>
        </>
      ) : isContactStep ? (
        <>
          <header className="flex flex-col gap-2">
            <TypographyPageTitle>{WIZARD_STEPS[2].title}</TypographyPageTitle>
            <TypographyPageDescription>{WIZARD_STEPS[2].description}</TypographyPageDescription>
          </header>
          {wizardStepper}
          <div className="min-w-0 text-sm">
            {!accountId ? (
              <InlineAlert
                message="No active account id. Go back to organisation selection or try Get started again."
                variant="destructive"
              />
            ) : (
              <WizardStepContact
                ref={step3Ref}
                accountId={accountId}
                onContinue={goNext}
                onPendingChange={setStep3Pending}
              />
            )}
          </div>
          <div className={WIZARD_FOOTER_CLASS}>
            <Button
              type="button"
              variant="destructive"
              className={WIZARD_FOOTER_BTN_CLASS}
              onClick={() => setPendingNav("back")}
            >
              Back
            </Button>
            <Button
              type="button"
              variant="accentOutline"
              className={WIZARD_FOOTER_BTN_CLASS}
              onClick={() => setPendingNav("selection")}
            >
              Back to selection
            </Button>
            <Button
              type="button"
              variant="brandPrimaryOutline"
              className={WIZARD_FOOTER_BTN_CLASS}
              onClick={() => {
                if (accountId) {
                  void step3Ref.current?.submit();
                }
              }}
              disabled={!accountId || step3Pending}
            >
              {step3Pending ? "Saving…" : "Next"}
            </Button>
          </div>
        </>
      ) : (
        <>
          <header className="flex flex-col gap-2">
            <TypographyPageTitle>{WIZARD_STEPS[3].title}</TypographyPageTitle>
            <TypographyPageDescription>{WIZARD_STEPS[3].description}</TypographyPageDescription>
          </header>
          {wizardStepper}
          <div className="min-w-0 text-sm">
            {!accountId ? (
              <InlineAlert
                message="No active account id. Go back to organisation selection or try Get started again."
                variant="destructive"
              />
            ) : (
              <WizardStepReview
                ref={step4Ref}
                accountId={accountId}
                confirmed={wizardCompleted}
                onPendingChange={setStep4Pending}
                onConfirmSuccess={handleConfirmSuccess}
              />
            )}
          </div>
          <div className={WIZARD_FOOTER_CLASS}>
            <Button
              type="button"
              variant="destructive"
              className={WIZARD_FOOTER_BTN_CLASS}
              onClick={() => setPendingNav("back")}
            >
              Back
            </Button>
            <Button
              type="button"
              variant="accentOutline"
              className={WIZARD_FOOTER_BTN_CLASS}
              onClick={() => setPendingNav("selection")}
            >
              Back to selection
            </Button>
            <Button
              type="button"
              className={WIZARD_FOOTER_BTN_CLASS}
              disabled={!accountId || step4Pending || wizardCompleted}
              onClick={() => void step4Ref.current?.submit()}
            >
              {wizardCompleted ? "Completed" : step4Pending ? "Finishing…" : "Finish"}
            </Button>
          </div>
        </>
      )}

      {accountId ? (
        <div className="flex flex-col items-center gap-2 border-t pt-6">
          <Button
            type="button"
            variant="outline"
            className="text-destructive border-destructive/40 hover:bg-destructive/10 w-full sm:w-auto"
            disabled={deleteAccountMutation.isPending}
            onClick={() => {
              setDeleteError(null);
              setDeleteDialogOpen(true);
            }}
          >
            Delete this unfinished account
          </Button>
          <TypographyFinePrint className="text-muted-foreground max-w-md text-center">
            This permanently removes the account. You can create a new organisation from
            organisation selection when you are ready.
          </TypographyFinePrint>
        </div>
      ) : null}

      <Dialog
        open={pendingNav !== null}
        onOpenChange={(open) => {
          if (!open) setPendingNav(null);
        }}
      >
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>{navDialogCopy.title}</DialogTitle>
            <DialogDescription>{navDialogCopy.description}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setPendingNav(null)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant={pendingNav === "selection" ? "destructive" : "default"}
              onClick={handleConfirmNav}
            >
              {navDialogCopy.confirm}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) setDeleteError(null);
        }}
      >
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Delete this unfinished account?</DialogTitle>
            <DialogDescription>
              This cannot be undone. You will return to organisation selection and can start a new
              setup when you are ready.
            </DialogDescription>
          </DialogHeader>
          {deleteError ? <InlineAlert message={deleteError} variant="destructive" /> : null}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={deleteAccountMutation.isPending}
              onClick={() => {
                setDeleteDialogOpen(false);
                setDeleteError(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deleteAccountMutation.isPending}
              onClick={() => {
                setDeleteError(null);
                deleteAccountMutation.mutate(undefined, {
                  onError: (e) => {
                    setDeleteError(deleteUnfinishedAccountErrorMessage(e));
                  },
                });
              }}
            >
              {deleteAccountMutation.isPending ? "Deleting…" : "Delete account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
