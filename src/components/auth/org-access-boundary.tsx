"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import { BrandedLoader } from "@/components/ui/branded-loader";
import { ErrorState } from "@/components/ui/error-state";
import {
  isAccountOrganisationContextGatewayRedirect,
  useAccountOrganisationContext,
} from "@/lib/api/hooks/account/useAccountOrganisationContext";
import { useOnboardingOnboardingState } from "@/lib/api/hooks/account/useOnboardingOnboardingState";
import { queryKeys } from "@/lib/api/query/query-keys";
import { AUTH_ERROR_MESSAGES } from "@/lib/auth/auth-errors";
import { isValidAccountIdSegment } from "@/lib/config/account-routes";
import {
  SELECT_ORG_GATEWAY_REASON,
  selectOrganisationUrlWithReason,
} from "@/lib/config/gateway-reasons";
import {
  accountEntryFromOnboardingState,
  resolveAccountEntry,
} from "@/lib/onboarding/resolve-account-entry";

import type { ReactNode } from "react";

/**
 * Validates scoped access via GET /api/accounts/:accountId/organisation (Phase 4); redirects to gateway with `reason` on 403/404/400 or invalid segment.
 * After access is OK, enforces onboarding lifecycle (GET …/onboarding-state): unfinished wizard redirects to gateway, not scoped shell.
 */
export function OrgAccessBoundary({
  accountId,
  children,
}: {
  accountId: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const redirectingRef = useRef(false);
  const segmentOk = isValidAccountIdSegment(accountId);
  const q = useAccountOrganisationContext(accountId, { enabled: segmentOk });

  const orgContextReady =
    segmentOk &&
    q.isSuccess &&
    Boolean(q.data) &&
    !isAccountOrganisationContextGatewayRedirect(q.data);

  const onboardingQuery = useOnboardingOnboardingState(accountId, {
    enabled: orgContextReady,
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
    if (!q.isSuccess || !q.data || redirectingRef.current) return;
    if (!isAccountOrganisationContextGatewayRedirect(q.data)) return;
    redirectingRef.current = true;
    void queryClient.removeQueries({ queryKey: queryKeys.account.organisationContext(accountId) });
    router.replace(selectOrganisationUrlWithReason(q.data.reason));
  }, [q.isSuccess, q.data, accountId, queryClient, router, segmentOk]);

  useEffect(() => {
    if (!orgContextReady) return;
    if (!onboardingQuery.isSuccess || !onboardingQuery.data || redirectingRef.current) return;
    const intent = resolveAccountEntry(onboardingQuery.data);
    if (intent === "dashboard") return;
    redirectingRef.current = true;
    router.replace(accountEntryFromOnboardingState(onboardingQuery.data, accountId));
  }, [orgContextReady, onboardingQuery.isSuccess, onboardingQuery.data, accountId, router]);

  if (!segmentOk) {
    return (
      <div className="text-muted-foreground grid gap-2 p-6 text-center text-sm" role="status">
        <p>Redirecting…</p>
      </div>
    );
  }

  if (q.isPending) {
    return <BrandedLoader fullPage label="Loading organisation" />;
  }

  if (q.isSuccess && q.data && isAccountOrganisationContextGatewayRedirect(q.data)) {
    return (
      <div className="text-muted-foreground grid gap-2 p-6 text-center text-sm" role="status">
        <p>Redirecting…</p>
      </div>
    );
  }

  if (q.isError) {
    const err = q.error;
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-md">
          <ErrorState
            title="Could not load organisation"
            description={err instanceof Error ? err.message : AUTH_ERROR_MESSAGES.network}
            onRetry={() => void q.refetch()}
          />
        </div>
      </div>
    );
  }

  if (orgContextReady && onboardingQuery.isPending && !onboardingQuery.data) {
    return <BrandedLoader fullPage label="Checking organisation…" />;
  }

  if (orgContextReady && onboardingQuery.isError) {
    const err = onboardingQuery.error;
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-md">
          <ErrorState
            title="Could not verify onboarding"
            description={err instanceof Error ? err.message : AUTH_ERROR_MESSAGES.network}
            onRetry={() => void onboardingQuery.refetch()}
          />
        </div>
      </div>
    );
  }

  if (
    orgContextReady &&
    onboardingQuery.isSuccess &&
    onboardingQuery.data &&
    resolveAccountEntry(onboardingQuery.data) !== "dashboard"
  ) {
    return (
      <div className="text-muted-foreground grid gap-2 p-6 text-center text-sm" role="status">
        <p>Redirecting…</p>
      </div>
    );
  }

  return <>{children}</>;
}
