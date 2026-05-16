"use client";

import { useMemo } from "react";

import { readTemplateModeId } from "@/features/branding/components/branding-workspace/_utils";
import {
  isAccountBrandingGatewayRedirect,
  useAccountBranding,
} from "@/lib/api/hooks/account/useAccountBranding";
import { useTemplateModesUi } from "@/lib/api/hooks/template-modes/useTemplateModesUi";
import { themeColoursFromAccountBrandingTheme } from "@/lib/branding/theme-colours-from-account";

import type { SponsorPlacementBrandingPreviewState } from "../_types/sponsor-placement-branding-preview";

export function useSponsorPlacementBrandingPreview({
  accountId,
  enabled,
}: {
  accountId: string;
  enabled: boolean;
}): SponsorPlacementBrandingPreviewState {
  const brandingQuery = useAccountBranding(accountId, { enabled });
  const templateModesQuery = useTemplateModesUi({ enabled });

  const brandingAccountData = useMemo(() => {
    if (!brandingQuery.isSuccess || !brandingQuery.data) return null;
    if (isAccountBrandingGatewayRedirect(brandingQuery.data)) return null;
    return brandingQuery.data.data;
  }, [brandingQuery.data, brandingQuery.isSuccess]);

  const assetPreviewPalette = useMemo(
    () => themeColoursFromAccountBrandingTheme(brandingAccountData?.theme ?? null),
    [brandingAccountData?.theme],
  );

  const assetPreviewTemplateModeSlug = useMemo(() => {
    const savedId = readTemplateModeId(brandingAccountData?.template_option ?? null);
    if (savedId === null) return null;
    const modes = templateModesQuery.data?.data ?? [];
    return modes.find((mode) => mode.id === savedId)?.slug ?? null;
  }, [brandingAccountData?.template_option, templateModesQuery.data]);

  return {
    showBrandingAssetPreview: enabled && brandingQuery.isSuccess && brandingAccountData !== null,
    showBrandingAssetPreviewSkeleton: enabled && brandingQuery.isPending,
    assetPreviewPalette,
    assetPreviewTemplateModeSlug,
  };
}
