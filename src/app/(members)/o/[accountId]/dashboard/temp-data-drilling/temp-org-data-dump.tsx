"use client";

import {
  isAccountAnalyticsOverviewGatewayRedirect,
  useAccountAnalyticsOverview,
} from "@/lib/api/hooks/account/useAccountAnalyticsOverview";
import {
  isAccountBrandingGatewayRedirect,
  useAccountBranding,
} from "@/lib/api/hooks/account/useAccountBranding";
import { useAccountMe } from "@/lib/api/hooks/account/useAccountMe";
import {
  isOrganisationGatewayRedirect,
  useAccountOrganisation,
} from "@/lib/api/hooks/account/useAccountOrganisation";
import {
  isAccountOrganisationContextGatewayRedirect,
  useAccountOrganisationContext,
} from "@/lib/api/hooks/account/useAccountOrganisationContext";
import {
  isAccountSettingsGatewayRedirect,
  useAccountSettings,
} from "@/lib/api/hooks/account/useAccountSettings";

import { DumpBlock } from "./dump-block";

export function TempOrgDataDump({ accountId }: { accountId: string }) {
  const me = useAccountMe();
  const settings = useAccountSettings(accountId);
  const branding = useAccountBranding(accountId);
  const organisationContext = useAccountOrganisationContext(accountId);

  const analytics = useAccountAnalyticsOverview(accountId);
  const legacy = useAccountOrganisation(accountId);

  const meBody = me.data ? (
    <pre className="border-border max-h-[min(50vh,32rem)] overflow-auto rounded-md border p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap">
      {JSON.stringify(me.data, null, 2)}
    </pre>
  ) : (
    <p className="text-muted-foreground text-sm" role="status">
      No payload.
    </p>
  );

  const settingsBody =
    settings.data && !isAccountSettingsGatewayRedirect(settings.data) ? (
      <pre className="border-border max-h-[min(50vh,32rem)] overflow-auto rounded-md border p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap">
        {JSON.stringify(settings.data, null, 2)}
      </pre>
    ) : (
      <p className="text-muted-foreground text-sm" role="status">
        No payload (redirect or empty). This should not appear after the access boundary.
      </p>
    );

  const brandingBody =
    branding.data && !isAccountBrandingGatewayRedirect(branding.data) ? (
      <pre className="border-border max-h-[min(50vh,32rem)] overflow-auto rounded-md border p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap">
        {JSON.stringify(branding.data, null, 2)}
      </pre>
    ) : (
      <p className="text-muted-foreground text-sm" role="status">
        No payload (redirect or empty). This should not appear after the access boundary.
      </p>
    );

  const organisationContextBody =
    organisationContext.data &&
    !isAccountOrganisationContextGatewayRedirect(organisationContext.data) ? (
      <pre className="border-border max-h-[min(50vh,32rem)] overflow-auto rounded-md border p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap">
        {JSON.stringify(organisationContext.data, null, 2)}
      </pre>
    ) : (
      <p className="text-muted-foreground text-sm" role="status">
        No payload (redirect or empty). This should not appear after the access boundary.
      </p>
    );

  const analyticsBody =
    analytics.data && !isAccountAnalyticsOverviewGatewayRedirect(analytics.data) ? (
      <pre className="border-border max-h-[min(50vh,32rem)] overflow-auto rounded-md border p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap">
        {JSON.stringify(analytics.data, null, 2)}
      </pre>
    ) : (
      <p className="text-muted-foreground text-sm" role="status">
        No payload (redirect or empty). This should not appear after the access boundary.
      </p>
    );

  const legacyBody =
    legacy.data && !isOrganisationGatewayRedirect(legacy.data) ? (
      <pre className="border-border max-h-[min(50vh,32rem)] overflow-auto rounded-md border p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap">
        {JSON.stringify(legacy.data, null, 2)}
      </pre>
    ) : (
      <p className="text-muted-foreground text-sm" role="status">
        No payload (redirect or empty). This should not appear after the access boundary.
      </p>
    );

  return (
    <div className="grid gap-8">
      <DumpBlock
        title="Phase 1 — GET /api/account/me (bootstrap: user, accountId, accounts[])"
        isPending={me.isPending}
        isError={me.isError}
        error={me.error instanceof Error ? me.error : null}
        refetch={() => void me.refetch()}
        emptyMessage=""
      >
        {meBody}
      </DumpBlock>

      <DumpBlock
        title="Phase 2 — GET /api/accounts/:id/settings (account configuration)"
        isPending={settings.isPending}
        isError={settings.isError}
        error={settings.error instanceof Error ? settings.error : null}
        refetch={() => void settings.refetch()}
        emptyMessage=""
      >
        {settingsBody}
      </DumpBlock>

      <DumpBlock
        title="Phase 3 — GET /api/accounts/:id/branding (template, theme, template_option)"
        isPending={branding.isPending}
        isError={branding.isError}
        error={branding.error instanceof Error ? branding.error : null}
        refetch={() => void branding.refetch()}
        emptyMessage=""
      >
        {brandingBody}
      </DumpBlock>

      <DumpBlock
        title="Phase 4 — GET /api/accounts/:id/organisation (org summary)"
        isPending={organisationContext.isPending}
        isError={organisationContext.isError}
        error={organisationContext.error instanceof Error ? organisationContext.error : null}
        refetch={() => void organisationContext.refetch()}
        emptyMessage=""
      >
        {organisationContextBody}
      </DumpBlock>

      <DumpBlock
        title="Phase 9 — GET /api/accounts/:id/analytics/overview (default date window)"
        isPending={analytics.isPending}
        isError={analytics.isError}
        error={analytics.error instanceof Error ? analytics.error : null}
        refetch={() => void analytics.refetch()}
        emptyMessage=""
      >
        {analyticsBody}
      </DumpBlock>

      <DumpBlock
        title="Legacy hub — GET /api/account/organisation/:id (all-time aggregates)"
        isPending={legacy.isPending}
        isError={legacy.isError}
        error={legacy.error instanceof Error ? legacy.error : null}
        refetch={() => void legacy.refetch()}
        emptyMessage=""
      >
        {legacyBody}
      </DumpBlock>
    </div>
  );
}
