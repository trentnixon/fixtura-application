"use client";

import { ImageOptionsAssetsPicker } from "@/components/pickers/assets-list-for-selection";
import { TypographyH1, TypographyMuted } from "@/components/typography";
import { Button } from "@/components/ui/button";
import { useAssetsListForSelection } from "@/lib/api/hooks/account/useAssetsListForSelection";
import { PICKER_SANDBOX_ACCOUNT_SCOPE } from "@/lib/api/query/query-keys";
import { appRoutes } from "@/lib/api/routes/route-definitions";

export default function DataLabAssetsListForSelectionPage() {
  const q = useAssetsListForSelection();

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <TypographyMuted className="text-xs font-medium tracking-wide uppercase">
          Data lab
        </TypographyMuted>
        <TypographyH1 className="text-2xl font-semibold tracking-tight">
          Assets — list for selection
        </TypographyH1>
        <TypographyMuted className="max-w-2xl leading-relaxed">
          Calls{" "}
          <code className="bg-muted rounded px-1.5 py-0.5 font-mono text-xs">
            {appRoutes.assets.listForSelection.path}
          </code>{" "}
          (BFF → Strapi GET /api/assets/list-for-selection). The CMS route is public; this BFF does
          not require sign-in. When you are signed in, the session token is forwarded to Strapi.
          This page lists only the{" "}
          <strong className="text-foreground font-medium">Image Options</strong> category; other
          asset categories are hidden.
        </TypographyMuted>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => void q.refetch()}>
          Refetch
        </Button>
        {q.isFetching && !q.isPending ? (
          <TypographyMuted className="text-xs">Refreshing…</TypographyMuted>
        ) : null}
      </div>

      {q.isPending ? (
        <p className="text-muted-foreground text-sm" role="status">
          Loading…
        </p>
      ) : q.isError ? (
        <div className="space-y-2">
          <TypographyMuted className="text-destructive text-sm">
            {q.error instanceof Error ? q.error.message : "Request failed"}
          </TypographyMuted>
        </div>
      ) : (
        <ImageOptionsAssetsPicker accountId={PICKER_SANDBOX_ACCOUNT_SCOPE} isSelect isList />
      )}
    </div>
  );
}
