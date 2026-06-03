"use client";

import { useMemo } from "react";

import {
  ImageOptionsAssetsPicker,
  useImageOptionsAssetsPicker,
} from "@/components/pickers/assets-list-for-selection";
import { DEFAULT_REMOTION_SANDBOX_COMPOSITION_ID } from "@/components/remotion/_constants/remotion-composition";
import { isRemotionSandboxCricketCompositionId } from "@/components/remotion/_constants/remotion-datasets";
import { TypographyMuted } from "@/components/typography";
import { isCricketSport, useRemotionAssetPreview } from "@/features/remotion-asset-preview";
import {
  isAccountSponsorsGatewayRedirect,
  useAccountSponsors,
} from "@/lib/api/hooks/account/useAccountSponsors";

import { DashboardAssetPreviewBrandingDebug } from "./dashboard-asset-preview-branding-debug";
import { DashboardOverviewCarousel } from "./dashboard-overview-carousel";

import type { AccountBrandingData } from "@/types/api/account";

type DashboardAssetPreviewPanelProps = {
  accountId: string;
  sport: string | null;
  branding: AccountBrandingData | null;
  logoUrl: string | null;
  templateModeSlug: string | null;
};

export function DashboardAssetPreviewPanel({
  accountId,
  sport,
  branding,
  logoUrl,
  templateModeSlug,
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

  const showAssetPicker = isCricketSport(sport);

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      {showAssetPicker ? (
        <div className="shrink-0 space-y-2">
          <TypographyMuted className="text-xs font-semibold tracking-wide uppercase">
            Asset / composition
          </TypographyMuted>
          <ImageOptionsAssetsPicker compact isSelect organisationSport={sport} />
        </div>
      ) : null}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <DashboardOverviewCarousel
          remotionPreviewState={remotionAssetPreview}
          brandingSettingsDebug={brandingSettingsDebug}
        />
      </div>
    </div>
  );
}
