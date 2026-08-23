"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

import { InlineAlert } from "@/components/auth/actions";
import { TypographyPageDescription, TypographyPageTitle } from "@/components/typography";
import { BrandedLoader } from "@/components/ui/branded-loader";
import { Button } from "@/components/ui/button";
import { captureUserAction } from "@/lib/analytics";
import { useOnboardingOnboardingState } from "@/lib/api/hooks/account/useOnboardingOnboardingState";
import { useOnboardingSetupStatus } from "@/lib/api/hooks/account/useOnboardingSetupStatus";
import { queryKeys } from "@/lib/api/query/query-keys";
import { accountScopedRoutes, isValidAccountIdSegment } from "@/lib/config/account-routes";
import { ROUTES } from "@/lib/config/routes";
import {
  isSetupStatusFailed,
  shouldHoldSetupRecoveryPage,
} from "@/lib/onboarding/is-setup-recovery-hold";
import { resolveAccountEntry } from "@/lib/onboarding/resolve-account-entry";

import { SetupStatusCard } from "../_components/setup-status-card";

/**
 * Optional / recovery route: wizard-complete accounts resolve to dashboard and redirect immediately.
 * Wizard-incomplete visits redirect to the gateway wizard. Remaining UI is for manual links, bookmarks, or support.
 */
export function CreateOrganisationSetupClient() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const raw = searchParams.get("accountId")?.trim() ?? "";
  const accountId = raw && isValidAccountIdSegment(raw) ? raw : "";

  const onboardingState = useOnboardingOnboardingState(accountId, { enabled: Boolean(accountId) });
  const setupStatus = useOnboardingSetupStatus(accountId, { enabled: Boolean(accountId) });

  const onboardingData = onboardingState.data;
  const setupRow = setupStatus.data;
  const setupPending = setupStatus.isPending && !setupRow;
  const setupFailed = isSetupStatusFailed(setupRow?.status);
  const holdRecovery = shouldHoldSetupRecoveryPage({ setupPending, setupFailed });
  const setupViewedRef = useRef(false);

  useEffect(() => {
    if (!accountId || setupViewedRef.current) return;
    if (!onboardingData || !holdRecovery) return;
    if (resolveAccountEntry(onboardingData) === "wizard") return;
    setupViewedRef.current = true;
    captureUserAction("onboarding_setup_viewed", { accountId });
  }, [accountId, holdRecovery, onboardingData]);

  useEffect(() => {
    if (!accountId || !onboardingData || holdRecovery) return;
    if (resolveAccountEntry(onboardingData) === "wizard") {
      router.replace(`${ROUTES.createOrganisation}?accountId=${encodeURIComponent(accountId)}`);
    }
  }, [accountId, holdRecovery, onboardingData, router]);

  useEffect(() => {
    if (!accountId || !onboardingData || holdRecovery) return;
    if (resolveAccountEntry(onboardingData) === "dashboard") {
      router.replace(accountScopedRoutes.dashboard(accountId));
    }
  }, [accountId, holdRecovery, onboardingData, router]);

  useEffect(() => {
    if (!accountId || !onboardingData || resolveAccountEntry(onboardingData) === "dashboard")
      return;
    const st = setupRow?.status?.trim().toLowerCase();
    if (st === "ready") {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.account.onboardingState(accountId),
      });
    }
  }, [accountId, onboardingData, setupRow, queryClient]);

  if (!accountId) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-col gap-4 py-8">
        <InlineAlert
          message="Missing or invalid account. Return to organisation selection and try again."
          variant="destructive"
        />
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

  if (onboardingState.isPending && !onboardingData) {
    return <BrandedLoader fullPage label="Loading organisation…" />;
  }

  if (onboardingState.isError) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-col gap-4 py-8">
        <InlineAlert
          message="We could not load onboarding state. Try again."
          variant="destructive"
        />
        <Button type="button" variant="accent" onClick={() => void onboardingState.refetch()}>
          Retry
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(ROUTES.selectOrganisation)}
        >
          Back to organisation selection
        </Button>
      </div>
    );
  }

  if (onboardingData && setupPending && !setupFailed) {
    return <BrandedLoader fullPage label="Checking setup status…" />;
  }

  if (onboardingData && resolveAccountEntry(onboardingData) === "dashboard" && !holdRecovery) {
    return <BrandedLoader fullPage label="Opening your organisation…" />;
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6 py-8">
      <header className="flex flex-col gap-2">
        <TypographyPageTitle as="h1">Setup status</TypographyPageTitle>
        <TypographyPageDescription>
          If you opened this page directly, you can return to the wizard or open your organisation
          dashboard while setup continues. The details below are for troubleshooting or if you were
          asked to wait here.
        </TypographyPageDescription>
      </header>
      <SetupStatusCard accountId={accountId} showRetryOnFailure />
    </div>
  );
}
