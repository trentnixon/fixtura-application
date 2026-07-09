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
import { isCricketSport, useRemotionAssetPreview } from "@/features/remotion-asset-preview";
import {
  isAccountSponsorsGatewayRedirect,
  useAccountSponsors,
} from "@/lib/api/hooks/account/useAccountSponsors";
import { accountScopedRoutes } from "@/lib/config/account-routes";
import { cn } from "@/lib/utils";

import { DashboardAssetPreviewBrandingDebug } from "./dashboard-asset-preview-branding-debug";
import { DashboardOverviewCarousel } from "./dashboard-overview-carousel";
import { AccountSectionShell } from "../../account/_components/AccountSectionShell";

import type { AccountBrandingData } from "@/types/api/account";
import type { ReactNode } from "react";

/** Primary CTA in the asset preview toolbar. */
const DASHBOARD_PREVIEW_CHANGE_TEMPLATE_CLASS =
  "inline-flex h-auto min-h-0 shrink-0 items-center rounded-full border border-primary bg-primary px-4 py-1.5 text-xs text-primary-foreground shadow-none transition-colors hover:bg-primary/90 focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none sm:px-6 sm:py-2 sm:text-sm";

type DashboardAssetPreviewPanelProps = {
  accountId: string;
  sport: string | null;
  branding: AccountBrandingData | null;
  logoUrl: string | null;
  templateModeSlug: string | null;
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
  debugPlacement = "carousel",
  showAssetPicker = true,
  previewTitle = null,
  compactPreview = true,
}: DashboardAssetPreviewPanelProps) {
  const imageOptions = useImageOptionsAssetsPicker(
    sport != null && sport.trim() !== "" ? { lockSportFilterTo: sport } : undefined,
  );

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
    exampleCompositionId,
    accountSponsors,
  });

  const brandingSettingsDebug = useMemo(
    () => (
      <DashboardAssetPreviewBrandingDebug
        branding={branding}
        templateModeSlug={templateModeSlug}
        accountSponsors={accountSponsors}
      />
    ),
    [accountSponsors, branding, templateModeSlug],
  );

  const shouldShowAssetPicker = showAssetPicker && isCricketSport(sport);

  return (
    <AccountSectionShell
      title="Asset preview"
      description="Live preview of your branded compositions."
      icon={<Play className="size-5" aria-hidden />}
      headerTone="brand"
    >
      <div className="flex flex-col px-6 pb-5">
        <div className="w-full min-w-0 py-2">
          <DashboardOverviewCarousel
            remotionPreviewState={remotionAssetPreview}
            displayMode="thumbnails"
            brandingSettingsDebug={debugPlacement === "carousel" ? brandingSettingsDebug : null}
            title={previewTitle}
            compact={compactPreview}
          />
        </div>

        <div className="border-border flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-t pt-4">
          {shouldShowAssetPicker ? (
            <ImageOptionsAssetsPicker
              compact
              inline
              isSelect
              hideSelectLabel
              hideStatusSummary
              organisationSport={sport}
            />
          ) : null}
          <Link
            href={accountScopedRoutes.templateBuilder(accountId)}
            className={cn(DASHBOARD_PREVIEW_CHANGE_TEMPLATE_CLASS, "ml-auto")}
          >
            Change template
          </Link>
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
    </AccountSectionShell>
  );
}
