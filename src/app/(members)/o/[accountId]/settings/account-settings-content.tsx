"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import { BrandedLoader } from "@/components/ui/branded-loader";
import { ErrorState } from "@/components/ui/error-state";
import {
  isAccountSettingsGatewayRedirect,
  useAccountSettings,
} from "@/lib/api/hooks/account/useAccountSettings";
import { queryKeys } from "@/lib/api/query/query-keys";
import { AUTH_ERROR_MESSAGES } from "@/lib/auth/auth-errors";
import { isValidAccountIdSegment } from "@/lib/config/account-routes";
import {
  SELECT_ORG_GATEWAY_REASON,
  selectOrganisationUrlWithReason,
} from "@/lib/config/gateway-reasons";

export function AccountSettingsContent({ accountId }: { accountId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const redirectingRef = useRef(false);
  const segmentOk = isValidAccountIdSegment(accountId);
  const q = useAccountSettings(accountId, { enabled: segmentOk });

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
    if (!isAccountSettingsGatewayRedirect(q.data)) return;
    redirectingRef.current = true;
    void queryClient.removeQueries({ queryKey: queryKeys.account.settings(accountId) });
    router.replace(selectOrganisationUrlWithReason(q.data.reason));
  }, [q.isSuccess, q.data, accountId, queryClient, router, segmentOk]);

  if (!segmentOk) {
    return (
      <div className="text-muted-foreground grid gap-2 text-center text-sm" role="status">
        <p>Redirecting…</p>
      </div>
    );
  }

  if (q.isPending) {
    return <BrandedLoader label="Loading settings" />;
  }

  if (q.isSuccess && q.data && isAccountSettingsGatewayRedirect(q.data)) {
    return (
      <div className="text-muted-foreground grid gap-2 text-center text-sm" role="status">
        <p>Redirecting…</p>
      </div>
    );
  }

  if (q.isError) {
    const err = q.error;
    return (
      <ErrorState
        title="Could not load settings"
        description={err instanceof Error ? err.message : AUTH_ERROR_MESSAGES.network}
        onRetry={() => void q.refetch()}
      />
    );
  }

  if (!q.isSuccess || !q.data || isAccountSettingsGatewayRedirect(q.data)) {
    return null;
  }

  const payload = q.data.data;

  return (
    <div className="border-border bg-card text-card-foreground grid max-w-lg gap-4 rounded-lg border p-6 text-sm shadow-sm">
      <dl className="grid gap-3">
        <div className="grid gap-0.5">
          <dt className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            Sport
          </dt>
          <dd>{payload.Sport}</dd>
        </div>
        <div className="grid gap-0.5">
          <dt className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            Start sequence completed
          </dt>
          <dd>{payload.hasCompletedStartSequence ? "Yes" : "No"}</dd>
        </div>
        <div className="grid gap-0.5">
          <dt className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            Custom template
          </dt>
          <dd>{payload.hasCustomTemplate ? "Yes" : "No"}</dd>
        </div>
        <div className="grid gap-0.5">
          <dt className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            Account active
          </dt>
          <dd>{payload.isActive ? "Yes" : "No"}</dd>
        </div>
      </dl>
    </div>
  );
}
