"use client";

import { useMemo, useState } from "react";

import {
  ImageOptionsAssetsPicker,
  useImageOptionsAssetsPicker,
} from "@/components/pickers/assets-list-for-selection";
import { DEFAULT_REMOTION_SANDBOX_COMPOSITION_ID } from "@/components/remotion/_constants/remotion-composition";
import { isRemotionSandboxCricketCompositionId } from "@/components/remotion/_constants/remotion-datasets";
import {
  AssetPreviewDisplayModeToggle,
  AssetPreviewStage,
  isCricketSport,
  useRemotionAssetPreview,
} from "@/features/remotion-asset-preview";
import {
  isAccountSponsorsGatewayRedirect,
  useAccountSponsors,
} from "@/lib/api/hooks/account/useAccountSponsors";
import { cn } from "@/lib/utils";

import {
  TEMPLATE_BUILDER_PREVIEW_CAROUSEL_CONTENT_CLASS,
  TEMPLATE_BUILDER_PREVIEW_ITEMS_IN_VIEW,
  TEMPLATE_BUILDER_PREVIEW_REMOTION_ROOT_CLASS,
  TEMPLATE_BUILDER_PREVIEW_SECTION_CLASS,
  TEMPLATE_BUILDER_PREVIEW_STAGE_CLASS,
  TEMPLATE_BUILDER_PREVIEW_TOOLBAR_CLASS,
} from "../_constants/template-builder-preview-layout";
import { TEMPLATE_BUILDER_PREVIEW_TOOLBAR_SURFACE_CLASS } from "../_constants/template-builder-tabber";

import type { AssetPreviewDisplayMode } from "@/features/remotion-asset-preview";
import type { AccountBrandingData } from "@/types/api/account";
import type { ReactNode } from "react";

export function TemplateBuilderPreviewPanel({
  accountId,
  sport,
  branding,
  logoUrl,
  templateModeSlug,
  toolbarStart,
}: {
  accountId: string;
  sport: string | null;
  branding: AccountBrandingData | null;
  logoUrl: string | null;
  templateModeSlug: string | null;
  toolbarStart?: ReactNode;
}) {
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
    const data = sponsorsQuery.data;
    if (!data || isAccountSponsorsGatewayRedirect(data)) return null;
    return data.data.items;
  }, [sponsorsQuery.data]);

  const remotionPreview = useRemotionAssetPreview({
    sport,
    branding,
    logoUrl,
    templateModeSlug,
    exampleCompositionId,
    accountSponsors,
  });

  const [displayMode, setDisplayMode] = useState<AssetPreviewDisplayMode>("thumbnails");
  const previewSupported = isCricketSport(sport) && remotionPreview.status !== "unsupported-sport";

  return (
    <section aria-label="Template preview" className={TEMPLATE_BUILDER_PREVIEW_SECTION_CLASS}>
      <div className="flex w-full items-center justify-end gap-2 px-2">
        {isCricketSport(sport) ? (
          <ImageOptionsAssetsPicker
            accountId={accountId}
            compact
            inline
            isSelect
            hideSelectLabel
            hideStatusSummary
            organisationSport={sport}
          />
        ) : (
          <p className="text-muted-foreground text-sm">No selectable assets for this sport.</p>
        )}
      </div>

      <div className={TEMPLATE_BUILDER_PREVIEW_STAGE_CLASS}>
        <AssetPreviewStage
          embedded
          displayMode={displayMode}
          state={remotionPreview}
          title={null}
          brandingSettingsDebug={null}
          itemsInView={TEMPLATE_BUILDER_PREVIEW_ITEMS_IN_VIEW}
          contentClassName={TEMPLATE_BUILDER_PREVIEW_CAROUSEL_CONTENT_CLASS}
          thumbnailPreviewRootClassName={TEMPLATE_BUILDER_PREVIEW_REMOTION_ROOT_CLASS}
        />
      </div>

      <div className="flex justify-center px-2">
        <AssetPreviewDisplayModeToggle
          value={displayMode}
          onValueChange={setDisplayMode}
          disabled={!previewSupported}
        />
      </div>

      {toolbarStart != null ? (
        <div className={TEMPLATE_BUILDER_PREVIEW_TOOLBAR_SURFACE_CLASS}>
          <div className={cn(TEMPLATE_BUILDER_PREVIEW_TOOLBAR_CLASS, "justify-end")}>
            <div className="flex min-w-0 flex-wrap items-center justify-end gap-x-4 gap-y-2 text-sm">
              {toolbarStart}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
