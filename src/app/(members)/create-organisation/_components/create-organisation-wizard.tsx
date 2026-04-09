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
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GridCard, GridCardVisualSlot } from "@/components/ui/grid-card";
import { Separator } from "@/components/ui/separator";
import { accountPickerRowsFromMePayload } from "@/lib/account/account-me-rows";
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
import { canDeleteUnfinishedOnboardingAccount } from "@/lib/onboarding/can-delete-unfinished-onboarding-account";
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
    description:
      "Operational contact for this account. Field rules and validation will follow the signed semantics document.",
  },
  {
    key: "review",
    title: "Review and confirm",
    description:
      "Summary of your choices and confirmation to complete the wizard. Finishing records wizard completion on the server.",
  },
] as const;

const TOTAL_WIZARD_STEPS = WIZARD_STEPS.length;

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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const step1Ref = useRef<WizardStepOrganisationHandle>(null);
  const step2Ref = useRef<WizardStepBrandingHandle>(null);
  const step3Ref = useRef<WizardStepContactHandle>(null);
  const step4Ref = useRef<WizardStepReviewHandle>(null);
  const stepHydratedFromServerRef = useRef(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { data: meData, isPending: mePending, isError: meError } = useAccountMe();
  const createFirst = useCreateFirstAccount();
  const sportsQuery = useOnboardingLookupSports({ enabled: stepIndex === 0 });

  const accountPayload = meData?.data;
  const accountIdFromQuery = searchParams.get("accountId")?.trim() ?? "";
  const accountId = useMemo(() => {
    const rows = accountPickerRowsFromMePayload(accountPayload);
    const allowed = new Set(rows.map((r) => String(r.id)));
    if (
      accountIdFromQuery &&
      isValidAccountIdSegment(accountIdFromQuery) &&
      allowed.has(accountIdFromQuery)
    ) {
      return accountIdFromQuery;
    }
    if (accountPayload?.accountId != null && accountPayload.accountId > 0) {
      const fromMe = String(accountPayload.accountId);
      if (allowed.size === 0 || allowed.has(fromMe)) return fromMe;
    }
    return "";
  }, [accountPayload, accountIdFromQuery]);

  const onboardingStateQuery = useOnboardingOnboardingState(accountId, {
    enabled: Boolean(accountId),
  });

  const deleteAccountMutation = useDeleteUnfinishedAccount(accountId);

  const needsFirstAccount = useMemo(() => {
    const rows = accountPickerRowsFromMePayload(accountPayload);
    return rows.length === 0;
  }, [accountPayload]);

  const onboardingData = onboardingStateQuery.data;

  const canDeleteUnfinishedAccount = useMemo(
    () => canDeleteUnfinishedOnboardingAccount(onboardingData),
    [onboardingData],
  );

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
    if (needsFirstAccount) {
      createFirst.mutate(
        { sport: selectedSportId.trim(), hasCompletedStartSequence: true },
        {
          onSuccess: () => {
            setStepIndex(1);
          },
        },
      );
    } else {
      goNext();
    }
  }, [createFirst, goNext, meError, mePending, needsFirstAccount, selectedSportId]);

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

  const getStartedPending = mePending || (isGetStarted && createFirst.isPending);
  const getStartedError =
    isGetStarted && createFirst.isError && createFirst.error instanceof Error
      ? createFirst.error.message
      : null;

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

  if (accountId && onboardingStateQuery.isError) {
    const errMsg =
      onboardingStateQuery.error instanceof ApiError
        ? onboardingStateQuery.error.message
        : "We could not load onboarding state. Try again or go back to organisation selection.";
    return (
      <div className="mx-auto flex w-full max-w-md flex-col gap-4 py-8">
        <InlineAlert message={errMsg} variant="destructive" />
        <Button
          type="button"
          variant="accent"
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

  return (
    <div
      className={cn(
        "mx-auto flex w-full flex-col gap-6 py-4",
        isGetStarted || isOrganisationStep || isBrandingStep ? "max-w-none" : "max-w-2xl",
      )}
    >
      {meError ? (
        <InlineAlert
          message="We could not load your account information. Try again or go back to organisation selection."
          variant="destructive"
        />
      ) : null}
      {getStartedError ? <InlineAlert message={getStartedError} variant="destructive" /> : null}
      {!isGetStarted ? (
        <div className="flex flex-col gap-3">
          <TypographyFinePrint as="p" className="text-muted-foreground">
            Wizard step {wizardStepNumber} of {TOTAL_WIZARD_STEPS}
          </TypographyFinePrint>
          <ol className="flex flex-wrap gap-2" aria-label="Onboarding steps">
            {WIZARD_STEPS.map((step, i) => {
              const n = i + 1;
              const state =
                n === wizardStepNumber ? "current" : n < wizardStepNumber ? "done" : "upcoming";
              return (
                <li key={step.key}>
                  <span
                    className={
                      state === "current"
                        ? "bg-primary text-primary-foreground inline-flex rounded-md px-2.5 py-1 text-xs font-medium"
                        : state === "done"
                          ? "bg-muted text-muted-foreground inline-flex rounded-md px-2.5 py-1 text-xs font-medium"
                          : "text-muted-foreground inline-flex rounded-md border border-dashed px-2.5 py-1 text-xs"
                    }
                  >
                    {n}. {step.title}
                  </span>
                </li>
              );
            })}
          </ol>
          <Separator />
        </div>
      ) : null}

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
            <div
              role="radiogroup"
              aria-label="Sport to set up"
              className="flex flex-wrap items-stretch justify-center gap-4"
            >
              {sportsSorted.map((s) => {
                const comingSoon = isComingSoonSportLabel(s.label);
                const selected = selectedSportId === s.id && !comingSoon;
                return (
                  <GridCard
                    key={s.id}
                    className="mx-0 h-full min-h-0 w-full"
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

          <div className="flex w-full flex-wrap items-center justify-center gap-3 border-t pt-6">
            <Button type="button" variant="accent" onClick={() => setPendingNav("selection")}>
              Back to selection
            </Button>
            <Button type="button" onClick={handleGetStarted} disabled={getStartedDisabled}>
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
          <div className="text-sm">
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
          <div className="flex w-full flex-wrap items-center justify-center gap-3 border-t pt-6">
            <Button type="button" variant="destructive" onClick={() => setPendingNav("back")}>
              Back
            </Button>
            <Button type="button" variant="accent" onClick={() => setPendingNav("selection")}>
              Back to selection
            </Button>
            <Button
              type="button"
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
          <div className="flex w-full flex-wrap items-center justify-center gap-3 border-t pt-6">
            <Button type="button" variant="destructive" onClick={() => setPendingNav("back")}>
              Back
            </Button>
            <Button type="button" variant="accent" onClick={() => setPendingNav("selection")}>
              Back to selection
            </Button>
            <Button
              type="button"
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
          <div className="text-sm">
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
          <div className="flex w-full flex-wrap items-center justify-center gap-3 border-t pt-6">
            <Button type="button" variant="destructive" onClick={() => setPendingNav("back")}>
              Back
            </Button>
            <Button type="button" variant="accent" onClick={() => setPendingNav("selection")}>
              Back to selection
            </Button>
            <Button
              type="button"
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
          <div className="text-sm">
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
          <div className="flex w-full flex-col gap-3 border-t pt-6">
            <div className="flex w-full flex-wrap items-center justify-center gap-3">
              <Button type="button" variant="destructive" onClick={() => setPendingNav("back")}>
                Back
              </Button>
              <Button type="button" variant="accent" onClick={() => setPendingNav("selection")}>
                Back to selection
              </Button>
              <Button
                type="button"
                disabled={!accountId || step4Pending || wizardCompleted}
                onClick={() => void step4Ref.current?.submit()}
              >
                {wizardCompleted ? "Completed" : step4Pending ? "Finishing…" : "Finish"}
              </Button>
            </div>
            <Card className="gap-0 py-4">
              <CardContent className="text-muted-foreground text-sm">
                <TypographyFinePrint className="max-w-none">
                  {wizardCompleted
                    ? "Wizard recorded. Return to organisation selection if you need to pick an account."
                    : "Finishing records wizard completion on the server. You can continue to your dashboard while background setup runs; status appears in the app when available."}
                </TypographyFinePrint>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {canDeleteUnfinishedAccount && accountId ? (
        <div className="flex flex-col items-center gap-2 border-t pt-6">
          <Button
            type="button"
            variant="outline"
            className="text-destructive border-destructive/40 hover:bg-destructive/10"
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
