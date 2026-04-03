"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import { BrandedLoader } from "@/components/ui/branded-loader";
import { ErrorState } from "@/components/ui/error-state";
import { ApiError } from "@/lib/api/client/api-error";
import { useAccountOrganisation } from "@/lib/api/hooks/account/useAccountOrganisation";
import { queryKeys } from "@/lib/api/query/query-keys";
import { AUTH_ERROR_MESSAGES } from "@/lib/auth/auth-errors";
import { ROUTES } from "@/lib/config/routes";

import type { ReactNode } from "react";

/**
 * Loads organisation dashboard aggregate for `accountId`; redirects to gateway on 403/404 (CMS ownership / missing).
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
  const q = useAccountOrganisation(accountId);

  useEffect(() => {
    if (!q.isError || !q.error || redirectingRef.current) return;
    const err = q.error;
    if (
      err instanceof ApiError &&
      (err.status === 404 || err.status === 403 || err.status === 400)
    ) {
      redirectingRef.current = true;
      void queryClient.removeQueries({ queryKey: queryKeys.account.organisation(accountId) });
      router.replace(ROUTES.selectOrganisation);
    }
  }, [q.isError, q.error, accountId, queryClient, router]);

  if (q.isPending) {
    return <BrandedLoader fullPage label="Loading organisation" />;
  }

  if (q.isError) {
    const err = q.error;
    if (
      err instanceof ApiError &&
      (err.status === 404 || err.status === 403 || err.status === 400)
    ) {
      return (
        <div className="text-muted-foreground grid gap-2 p-6 text-center text-sm" role="status">
          <p>Redirecting…</p>
        </div>
      );
    }
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

  return <>{children}</>;
}
