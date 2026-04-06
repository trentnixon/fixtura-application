"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import { BrandedLoader } from "@/components/ui/branded-loader";
import { ErrorState } from "@/components/ui/error-state";
import {
  isAccountBrandingGatewayRedirect,
  useAccountBranding,
} from "@/lib/api/hooks/account/useAccountBranding";
import { queryKeys } from "@/lib/api/query/query-keys";
import { AUTH_ERROR_MESSAGES } from "@/lib/auth/auth-errors";
import { isValidAccountIdSegment } from "@/lib/config/account-routes";
import {
  SELECT_ORG_GATEWAY_REASON,
  selectOrganisationUrlWithReason,
} from "@/lib/config/gateway-reasons";

export function TemplateBuilderContent({ accountId }: { accountId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const redirectingRef = useRef(false);
  const segmentOk = isValidAccountIdSegment(accountId);
  const q = useAccountBranding(accountId, { enabled: segmentOk });

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
    if (!isAccountBrandingGatewayRedirect(q.data)) return;
    redirectingRef.current = true;
    void queryClient.removeQueries({ queryKey: queryKeys.account.branding(accountId) });
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
    return <BrandedLoader label="Loading branding" />;
  }

  if (q.isSuccess && q.data && isAccountBrandingGatewayRedirect(q.data)) {
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
        title="Could not load branding"
        description={err instanceof Error ? err.message : AUTH_ERROR_MESSAGES.network}
        onRetry={() => void q.refetch()}
      />
    );
  }

  if (!q.isSuccess || !q.data || isAccountBrandingGatewayRedirect(q.data)) {
    return null;
  }

  const payload = q.data.data;
  const templateLabel = payload.template?.frontEndName ?? payload.template?.name ?? null;
  const themeLabel = payload.theme?.name ?? null;

  return (
    <div className="border-border bg-card text-card-foreground grid max-w-lg gap-4 rounded-lg border p-6 text-sm shadow-sm">
      <p className="text-muted-foreground">
        Read-only preview from the CMS branding endpoint. Custom template flags live on Settings.
      </p>
      <dl className="grid gap-3">
        <div className="grid gap-0.5">
          <dt className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            Template
          </dt>
          <dd>
            {templateLabel ?? (payload.template ? `ID ${payload.template.id}` : "None linked")}
          </dd>
        </div>
        <div className="grid gap-0.5">
          <dt className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            Theme
          </dt>
          <dd>{themeLabel ?? (payload.theme ? `ID ${payload.theme.id}` : "None")}</dd>
        </div>
        <div className="grid gap-0.5">
          <dt className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            Template option
          </dt>
          <dd>{payload.template_option ? "Configured" : "None"}</dd>
        </div>
      </dl>
    </div>
  );
}
