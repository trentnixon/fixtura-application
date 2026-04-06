"use client";

import {
  isAccountBrandingGatewayRedirect,
  useAccountBranding,
} from "@/lib/api/hooks/account/useAccountBranding";

import { DumpBlock } from "../dashboard/temp-data-drilling/dump-block";

export function BrandingApiDump({ accountId }: { accountId: string }) {
  const branding = useAccountBranding(accountId);

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

  return (
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
  );
}
