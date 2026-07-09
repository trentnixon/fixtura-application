"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { BrandedLoader } from "@/components/ui/branded-loader";
import { ErrorState } from "@/components/ui/error-state";
import { resolveTemplateModeSlugFromBranding } from "@/features/remotion-asset-preview";
import {
  isAccountBrandingGatewayRedirect,
  useAccountBranding,
} from "@/lib/api/hooks/account/useAccountBranding";
import { useAccountMe } from "@/lib/api/hooks/account/useAccountMe";
import {
  isAccountOrganisationContextGatewayRedirect,
  useAccountOrganisationContext,
} from "@/lib/api/hooks/account/useAccountOrganisationContext";
import {
  isAccountSettingsGatewayRedirect,
  useAccountSettings,
} from "@/lib/api/hooks/account/useAccountSettings";
import {
  isAccountSponsorsGatewayRedirect,
  useAccountSponsors,
} from "@/lib/api/hooks/account/useAccountSponsors";
import {
  isAllTemplateOptionsGatewayRedirect,
  useAllTemplateOptions,
} from "@/lib/api/hooks/account/useAllTemplateOptions";
import {
  getPutTemplateOptionsErrorMessage,
  usePutTemplateOptions,
} from "@/lib/api/hooks/account/usePutTemplateOptions";
import { useTemplateCategoriesListForSelection } from "@/lib/api/hooks/account/useTemplateCategoriesListForSelection";
import { useTemplateModesUi } from "@/lib/api/hooks/template-modes/useTemplateModesUi";
import { queryKeys } from "@/lib/api/query/query-keys";
import { AUTH_ERROR_MESSAGES } from "@/lib/auth/auth-errors";
import { isValidAccountIdSegment } from "@/lib/config/account-routes";
import {
  SELECT_ORG_GATEWAY_REASON,
  selectOrganisationUrlWithReason,
} from "@/lib/config/gateway-reasons";

import { TemplateBuilderPreviewPanel } from "./_components/template-builder-preview-panel";
import { buildTemplateBuilderPreviewBranding } from "./_utils/template-builder-preview-branding";
import { mapTemplateBuilderEditorStateToPutBody } from "./_utils/template-builder-save-payload";
import { TemplateBuilderEditor } from "./template-builder-editor";
import { DashboardAssetPreviewBrandingDebug } from "../dashboard/_components/dashboard-asset-preview-branding-debug";
import { buildDashboardViewModel } from "../dashboard/dashboard-view-model";

import type { TemplateBuilderEditorState } from "./_utils/template-builder-editor-state";
import type { TemplateBuilderEditorDebugSnapshot } from "./template-builder-editor";
import type { ReactNode } from "react";

function TemplateBuilderSection({
  title,
  children,
  className,
}: {
  title?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={[
        "border-border bg-card text-card-foreground grid gap-4 rounded-lg border p-4 shadow-sm sm:p-5",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {title ? (
        <h2 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
          {title}
        </h2>
      ) : null}
      {children}
    </section>
  );
}

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
  const settingsQ = useAccountSettings(accountId, { enabled: segmentOk });
  const organisationContextQ = useAccountOrganisationContext(accountId, { enabled: segmentOk });
  const sponsorsQ = useAccountSponsors(accountId);
  const templateModesQuery = useTemplateModesUi();

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

  const templateCategoriesListQ = useTemplateCategoriesListForSelection({
    enabled: segmentOk,
  });

  const putTemplateOptions = usePutTemplateOptions(accountId);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [previewDraftState, setPreviewDraftState] = useState<TemplateBuilderEditorState | null>(
    null,
  );
  const [debugSnapshot, setDebugSnapshot] = useState<TemplateBuilderEditorDebugSnapshot | null>(
    null,
  );
  const settingsData =
    settingsQ.data && !isAccountSettingsGatewayRedirect(settingsQ.data)
      ? settingsQ.data.data
      : null;

  const organisationContextData =
    organisationContextQ.data &&
    !isAccountOrganisationContextGatewayRedirect(organisationContextQ.data)
      ? organisationContextQ.data.data
      : null;

  const accountSponsors =
    sponsorsQ.data && !isAccountSponsorsGatewayRedirect(sponsorsQ.data)
      ? sponsorsQ.data.data.items
      : null;

  const brandingData =
    brandingQ.data && !isAccountBrandingGatewayRedirect(brandingQ.data)
      ? brandingQ.data.data
      : null;

  const catalogPayload =
    catalogQ.isSuccess && catalogQ.data && !isAllTemplateOptionsGatewayRedirect(catalogQ.data)
      ? catalogQ.data.data
      : null;

  const previewBranding = useMemo(
    () =>
      buildTemplateBuilderPreviewBranding({
        branding: brandingData,
        catalog: catalogPayload,
        categoryOptions: templateCategoriesListQ.data?.data ?? null,
        draft: previewDraftState,
      }),
    [brandingData, catalogPayload, previewDraftState, templateCategoriesListQ.data],
  );

  const dashboardPreviewModel = useMemo(
    () =>
      buildDashboardViewModel({
        accountId,
        me: me.data,
        settings: settingsData,
        branding: previewBranding,
        organisationContext: organisationContextData,
        analytics: null,
      }),
    [accountId, me.data, organisationContextData, previewBranding, settingsData],
  );

  const templateModeSlug = useMemo(
    () =>
      resolveTemplateModeSlugFromBranding(
        dashboardPreviewModel.branding,
        templateModesQuery.data?.data ?? [],
      ),
    [dashboardPreviewModel.branding, templateModesQuery.data],
  );

  const previewConfig = useMemo(
    () => ({
      sport: dashboardPreviewModel.sport,
      branding: dashboardPreviewModel.branding,
      logoUrl: dashboardPreviewModel.logoUrl,
      templateModeSlug,
    }),
    [
      dashboardPreviewModel.branding,
      dashboardPreviewModel.logoUrl,
      dashboardPreviewModel.sport,
      templateModeSlug,
    ],
  );

  const clearSaveFeedback = useCallback(() => {
    setSaveSuccess(false);
    putTemplateOptions.reset();
  }, [putTemplateOptions]);

  const handleSaveDraft = useCallback(
    async (draft: TemplateBuilderEditorState) => {
      const body = mapTemplateBuilderEditorStateToPutBody(draft);
      await putTemplateOptions.mutateAsync(body);
      setSaveSuccess(true);
    },
    [putTemplateOptions],
  );

  const saveError = putTemplateOptions.isError
    ? getPutTemplateOptionsErrorMessage(putTemplateOptions.error)
    : null;

  const editorSave = useMemo(
    () => ({
      onSaveDraft: handleSaveDraft,
      isSaving: putTemplateOptions.isPending,
      saveError,
      saveSuccess,
      onClearSaveFeedback: clearSaveFeedback,
    }),
    [clearSaveFeedback, handleSaveDraft, putTemplateOptions.isPending, saveError, saveSuccess],
  );

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

  const changedFieldsLabel =
    debugSnapshot && debugSnapshot.changedFields.length > 0
      ? debugSnapshot.changedFields.join(", ")
      : "-";

  const previewPanel = <TemplateBuilderPreviewPanel accountId={accountId} {...previewConfig} />;

  return (
    <div className="grid gap-6">
      <div className="grid min-h-screen content-start gap-3">
        {catalogPayload ? (
          <TemplateBuilderEditor
            accountId={accountId}
            payload={catalogPayload}
            categoryOptions={templateCategoriesListQ.data?.data ?? null}
            branding={brandingData}
            save={editorSave}
            previewConfig={previewConfig}
            onDraftStateChange={setPreviewDraftState}
            onDebugStateChange={setDebugSnapshot}
          />
        ) : (
          <>
            {previewPanel}
            <p className="text-muted-foreground text-sm">Loading template options...</p>
          </>
        )}
      </div>

      <TemplateBuilderSection title="Debugger" className="hidden">
        <dl className="grid gap-3 text-sm sm:grid-cols-3">
          <div className="grid gap-0.5">
            <dt className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Dirty
            </dt>
            <dd>{debugSnapshot?.isDirty ? "Yes" : "No"}</dd>
          </div>
          <div className="grid gap-0.5">
            <dt className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Changed count
            </dt>
            <dd>{debugSnapshot?.changedCount ?? 0}</dd>
          </div>
          <div className="grid gap-0.5">
            <dt className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Changed fields
            </dt>
            <dd className="text-xs">{changedFieldsLabel}</dd>
          </div>
        </dl>
        {debugSnapshot ? (
          <pre className="bg-muted text-muted-foreground max-h-72 overflow-auto rounded-md p-3 text-xs">
            {JSON.stringify(
              {
                savedState: debugSnapshot.savedState,
                draftState: debugSnapshot.draftState,
              },
              null,
              2,
            )}
          </pre>
        ) : null}
      </TemplateBuilderSection>

      <TemplateBuilderSection title="User settings (debug)" className="hidden">
        <DashboardAssetPreviewBrandingDebug
          branding={dashboardPreviewModel.branding}
          templateModeSlug={templateModeSlug}
          accountSponsors={accountSponsors}
        />
      </TemplateBuilderSection>
    </div>
  );
}
