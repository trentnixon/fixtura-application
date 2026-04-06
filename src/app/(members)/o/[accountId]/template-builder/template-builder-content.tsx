"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";

import { BrandedLoader } from "@/components/ui/branded-loader";
import { ErrorState } from "@/components/ui/error-state";
import {
  isAccountBrandingGatewayRedirect,
  useAccountBranding,
} from "@/lib/api/hooks/account/useAccountBranding";
import { useAccountMe } from "@/lib/api/hooks/account/useAccountMe";
import {
  isAllTemplateOptionsGatewayRedirect,
  useAllTemplateOptions,
} from "@/lib/api/hooks/account/useAllTemplateOptions";
import { queryKeys } from "@/lib/api/query/query-keys";
import { AUTH_ERROR_MESSAGES } from "@/lib/auth/auth-errors";
import { isValidAccountIdSegment } from "@/lib/config/account-routes";
import {
  SELECT_ORG_GATEWAY_REASON,
  selectOrganisationUrlWithReason,
} from "@/lib/config/gateway-reasons";

import { AllTemplateOptionsDump } from "./all-template-options-dump";

function removeAllTemplateOptionsQueriesForAccount(
  queryClient: ReturnType<typeof useQueryClient>,
  accountId: string,
) {
  void queryClient.removeQueries({
    predicate: (q) =>
      Array.isArray(q.queryKey) &&
      q.queryKey[0] === "account" &&
      q.queryKey[1] === "all-template-options" &&
      q.queryKey[2] === accountId,
  });
}

export function TemplateBuilderContent({ accountId }: { accountId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const redirectingRef = useRef(false);
  const segmentOk = isValidAccountIdSegment(accountId);
  const me = useAccountMe({ enabled: segmentOk });
  const brandingQ = useAccountBranding(accountId, { enabled: segmentOk });

  const templateOptionIdForCatalog = useMemo(() => {
    if (!segmentOk) return null;
    const n = Number(accountId);
    const row = me.data?.data.accounts?.find((a) => a.id === n);
    const fromMe = row?.templateOptionId;
    if (fromMe !== undefined && fromMe !== null) return fromMe;
    if (brandingQ.data && !isAccountBrandingGatewayRedirect(brandingQ.data)) {
      const t = brandingQ.data.data.templateOptionId;
      if (t !== undefined && t !== null) return t;
    }
    return null;
  }, [segmentOk, accountId, me.data, brandingQ.data]);

  const catalogQ = useAllTemplateOptions(accountId, {
    enabled: segmentOk,
    templateOptionId: templateOptionIdForCatalog,
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
    if (!catalogQ.isSuccess || !catalogQ.data || redirectingRef.current) return;
    if (!isAllTemplateOptionsGatewayRedirect(catalogQ.data)) return;
    redirectingRef.current = true;
    removeAllTemplateOptionsQueriesForAccount(queryClient, accountId);
    void queryClient.removeQueries({ queryKey: queryKeys.account.branding(accountId) });
    router.replace(selectOrganisationUrlWithReason(catalogQ.data.reason));
  }, [catalogQ.isSuccess, catalogQ.data, accountId, queryClient, router, segmentOk]);

  useEffect(() => {
    if (!segmentOk) return;
    if (!brandingQ.isSuccess || !brandingQ.data || redirectingRef.current) return;
    if (!isAccountBrandingGatewayRedirect(brandingQ.data)) return;
    redirectingRef.current = true;
    void queryClient.removeQueries({ queryKey: queryKeys.account.branding(accountId) });
    removeAllTemplateOptionsQueriesForAccount(queryClient, accountId);
    router.replace(selectOrganisationUrlWithReason(brandingQ.data.reason));
  }, [brandingQ.isSuccess, brandingQ.data, accountId, queryClient, router, segmentOk]);

  if (!segmentOk) {
    return (
      <div className="text-muted-foreground grid gap-2 text-center text-sm" role="status">
        <p>Redirecting…</p>
      </div>
    );
  }

  if (catalogQ.isSuccess && catalogQ.data && isAllTemplateOptionsGatewayRedirect(catalogQ.data)) {
    return (
      <div className="text-muted-foreground grid gap-2 text-center text-sm" role="status">
        <p>Redirecting…</p>
      </div>
    );
  }

  if (brandingQ.isPending) {
    return <BrandedLoader label="Loading branding" />;
  }

  if (brandingQ.isSuccess && isAccountBrandingGatewayRedirect(brandingQ.data)) {
    return (
      <div className="text-muted-foreground grid gap-2 text-center text-sm" role="status">
        <p>Redirecting…</p>
      </div>
    );
  }

  if (brandingQ.isError) {
    const err = brandingQ.error;
    return (
      <ErrorState
        title="Could not load branding"
        description={err instanceof Error ? err.message : AUTH_ERROR_MESSAGES.network}
        onRetry={() => void brandingQ.refetch()}
      />
    );
  }

  if (!brandingQ.isSuccess || isAccountBrandingGatewayRedirect(brandingQ.data)) {
    return null;
  }

  const payload = brandingQ.data.data;
  const templateLabel = payload.template?.frontEndName ?? payload.template?.name ?? null;
  const themeLabel = payload.theme?.name ?? null;
  const templateOptionIdLabel =
    payload.templateOptionId !== undefined && payload.templateOptionId !== null
      ? String(payload.templateOptionId)
      : "—";

  return (
    <div className="grid gap-6">
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
          <div className="grid gap-0.5">
            <dt className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              templateOptionId (CMS)
            </dt>
            <dd>{templateOptionIdLabel}</dd>
          </div>
        </dl>
      </div>

      <AllTemplateOptionsDump
        catalogQuery={catalogQ}
        templateOptionIdUsed={templateOptionIdForCatalog}
      />
    </div>
  );
}
