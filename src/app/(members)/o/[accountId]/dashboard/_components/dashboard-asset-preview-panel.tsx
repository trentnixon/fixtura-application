"use client";

import { Play } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

import {
  ImageOptionsAssetsPicker,
  useImageOptionsAssetsPicker,
} from "@/components/pickers/assets-list-for-selection";
import { DEFAULT_REMOTION_SANDBOX_COMPOSITION_ID } from "@/components/remotion/_constants/remotion-composition";
import { isRemotionSandboxCricketCompositionId } from "@/components/remotion/_constants/remotion-datasets";
import { TypographyH4, TypographyMuted } from "@/components/typography";
import { Button } from "@/components/ui/button";
import { isCricketSport, useRemotionAssetPreview } from "@/features/remotion-asset-preview";
import { captureUserAction } from "@/lib/analytics";
import {
  isAccountSponsorsGatewayRedirect,
  useAccountSponsors,
} from "@/lib/api/hooks/account/useAccountSponsors";
import { accountScopedRoutes } from "@/lib/config/account-routes";

import { DashboardAssetPreviewBrandingDebug } from "./dashboard-asset-preview-branding-debug";
import { DashboardOverviewCarousel } from "./dashboard-overview-carousel";

import type { AccountBrandingData } from "@/types/api/account";
import type { TemplateCategoryCatalogItem } from "@/types/api/all-template-options";
import type { ReactNode } from "react";

type DashboardAssetPreviewPanelProps = {
  accountId: string;
  sport: string | null;
  branding: AccountBrandingData | null;
  logoUrl: string | null;
  templateModeSlug: string | null;
  templateCategoryCatalog?: TemplateCategoryCatalogItem[];
  debugPlacement?: "carousel" | "below" | "none";
  showAssetPicker?: boolean;
  previewTitle?: ReactNode;
  compactPreview?: boolean;
};

export function DashboardAssetPreviewPanel({
  accountId,
  sport,
  branding,
  logoUrl,
  templateModeSlug,
  templateCategoryCatalog = [],
  debugPlacement = "carousel",
  showAssetPicker = true,
  previewTitle = null,
  compactPreview = true,
}: DashboardAssetPreviewPanelProps) {
  const imageOptions = useImageOptionsAssetsPicker({
    accountId,
    ...(sport != null && sport.trim() !== "" ? { lockSportFilterTo: sport } : {}),
  });

  const exampleCompositionId = useMemo(() => {
    const fromAsset = imageOptions.selected?.CompositionID;
    if (isRemotionSandboxCricketCompositionId(fromAsset)) {
      return fromAsset;
    }
    return DEFAULT_REMOTION_SANDBOX_COMPOSITION_ID;
  }, [imageOptions.selected]);

  const sponsorsQuery = useAccountSponsors(accountId);

  const accountSponsors = useMemo(() => {
    const d = sponsorsQuery.data;
    if (!d || isAccountSponsorsGatewayRedirect(d)) return null;
    return d.data.items;
  }, [sponsorsQuery.data]);

  const remotionAssetPreview = useRemotionAssetPreview({
    sport,
    branding,
    logoUrl,
    templateModeSlug,
    templateCategoryCatalog,
    exampleCompositionId,
    accountSponsors,
  });

  const brandingSettingsDebug = useMemo(
    () => (
      <DashboardAssetPreviewBrandingDebug
        branding={branding}
        templateModeSlug={templateModeSlug}
        templateCategoryCatalog={templateCategoryCatalog}
        accountSponsors={accountSponsors}
      />
    ),
    [accountSponsors, branding, templateCategoryCatalog, templateModeSlug],
  );

  const shouldShowAssetPicker = showAssetPicker && isCricketSport(sport);

  return (
    <div className="flex min-w-0 flex-col px-6 py-6">
      <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <TypographyH4 className="text-sm font-semibold">Asset preview</TypographyH4>
          <TypographyMuted className="text-xs">
            Live preview of your branded compositions.
          </TypographyMuted>
        </div>
        <Play className="text-primary size-5 shrink-0" aria-hidden />
      </div>

      <div className="mt-6 flex flex-col">
        <div className="w-full min-w-0 py-2">
          <DashboardOverviewCarousel
            remotionPreviewState={remotionAssetPreview}
            displayMode="thumbnails"
            brandingSettingsDebug={debugPlacement === "carousel" ? brandingSettingsDebug : null}
            title={previewTitle}
            compact={compactPreview}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 pt-4">
          {shouldShowAssetPicker ? (
            <ImageOptionsAssetsPicker
              accountId={accountId}
              compact
              inline
              isSelect
              hideSelectLabel
              hideStatusSummary
              organisationSport={sport}
            />
          ) : null}
          <Button
            variant="outline"
            size="sm"
            className="border-primary text-primary hover:bg-primary/10 hover:text-primary ml-auto"
            asChild
          >
            <Link
              href={accountScopedRoutes.templateBuilder(accountId)}
              onClick={() =>
                captureUserAction("dashboard_route_clicked", {
                  destination: "template_builder",
                  accountId,
                })
              }
            >
              Change template
            </Link>
          </Button>
        </div>

        {debugPlacement === "below" ? (
          <div className="border-border bg-muted/35 mt-4 shrink-0 space-y-2 rounded-lg border p-3">
            <p className="text-muted-foreground text-[0.65rem] font-semibold tracking-wide uppercase">
              User settings (debug)
            </p>
            {brandingSettingsDebug}
          </div>
        ) : null}
      </div>
    </div>
  );
}
