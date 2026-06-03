"use client";

import { BrandedLoader } from "@/components/ui/branded-loader";
import { ErrorState } from "@/components/ui/error-state";
import { useOnboardingOnboardingState } from "@/lib/api/hooks/account/useOnboardingOnboardingState";
import { AUTH_ERROR_MESSAGES } from "@/lib/auth/auth-errors";

import { SEASON_LOADING_COPY, SEASON_ONBOARDING_COPY } from "./_constants";

import type { SeasonOnboardingShellProps } from "./_types";

/**
 * Season hub is only available after account setup finishes.
 * Lock condition is lifecycle `state.isSetup !== true`.
 */
export function SeasonOnboardingShell({ accountId, children }: SeasonOnboardingShellProps) {
  const onboarding = useOnboardingOnboardingState(accountId);

  if (onboarding.isPending) {
    return <BrandedLoader fullPage label={SEASON_LOADING_COPY.access} />;
  }

  if (onboarding.isError) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center p-6">
        <div className="w-full max-w-md">
          <ErrorState
            title="Could not verify access"
            description={
              onboarding.error instanceof Error
                ? onboarding.error.message
                : AUTH_ERROR_MESSAGES.network
            }
            onRetry={() => void onboarding.refetch()}
          />
        </div>
      </div>
    );
  }

  const state = onboarding.data;
  if (state && state.isSetup !== true) {
    return (
      <div className="mx-auto grid max-w-lg gap-4 p-6 text-center">
        <h1 className="font-brand text-xl font-semibold">{SEASON_ONBOARDING_COPY.title}</h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {SEASON_ONBOARDING_COPY.description}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-[88rem] gap-6 px-4 pb-12 sm:px-6 lg:px-8">{children}</div>
  );
}
