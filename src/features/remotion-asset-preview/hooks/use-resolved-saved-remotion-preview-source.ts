"use client";

import { useMemo } from "react";

import {
  isAllTemplateOptionsGatewayRedirect,
  useAllTemplateOptions,
} from "@/lib/api/hooks/account/useAllTemplateOptions";
import { useTemplateTexturesUi } from "@/lib/api/hooks/template-textures/useTemplateTexturesUi";

import { resolveRemotionPreviewTextureCatalog } from "../utils/resolve-remotion-preview-texture-catalog";
import {
  needsCatalogToResolveSavedBranding,
  readTemplateOptionIdFromBranding,
} from "../utils/resolve-saved-branding-for-remotion-preview";

import type { AssembleAccountRemotionPreviewSavedSource } from "../utils/assemble-account-remotion-preview";
import type { AccountBrandingData, AccountMediaLibraryImage } from "@/types/api/account";
import type { TemplateCategoryCatalogItem } from "@/types/api/all-template-options";

export type ResolvedSavedRemotionPreviewSourceStatus =
  "ready" | "loading-catalog" | "catalog-error";

export type UseResolvedSavedRemotionPreviewSourceInput = {
  accountId: string;
  branding: AccountBrandingData | null;
  previewImage?: AccountMediaLibraryImage | null;
  templateCategoryCatalog?: TemplateCategoryCatalogItem[] | null;
};

export type UseResolvedSavedRemotionPreviewSourceResult = {
  source: AssembleAccountRemotionPreviewSavedSource;
  status: ResolvedSavedRemotionPreviewSourceStatus;
  catalogError: string | null;
};

/**
 * Saved Remotion preview source — same shape as template builder after save:
 * always loads aggregate catalog + texture catalog, expands thin branding when needed.
 */
export function useResolvedSavedRemotionPreviewSource({
  accountId,
  branding,
  previewImage = null,
  templateCategoryCatalog = null,
}: UseResolvedSavedRemotionPreviewSourceInput): UseResolvedSavedRemotionPreviewSourceResult {
  const needsCatalog = useMemo(() => needsCatalogToResolveSavedBranding(branding), [branding]);
  const templateOptionId = useMemo(() => readTemplateOptionIdFromBranding(branding), [branding]);
  const queryEnabled = Boolean(accountId);

  const catalogQuery = useAllTemplateOptions(accountId, {
    enabled: queryEnabled,
    templateOptionId,
  });

  const templateTexturesQuery = useTemplateTexturesUi({ enabled: queryEnabled });

  const catalogPayload = useMemo(() => {
    const data = catalogQuery.data;
    if (!data || isAllTemplateOptionsGatewayRedirect(data)) return null;
    return data.data;
  }, [catalogQuery.data]);

  const textureCatalog = useMemo(
    () =>
      resolveRemotionPreviewTextureCatalog({
        templateTexturesSuccess: templateTexturesQuery.isSuccess,
        templateTexturesPending: templateTexturesQuery.isPending,
        templateTexturesData: templateTexturesQuery.data?.data,
        templateTexturesError: templateTexturesQuery.error,
        catalogTextures: catalogPayload?.textures,
      }),
    [
      catalogPayload?.textures,
      templateTexturesQuery.data?.data,
      templateTexturesQuery.error,
      templateTexturesQuery.isPending,
      templateTexturesQuery.isSuccess,
    ],
  );

  const source = useMemo(
    (): AssembleAccountRemotionPreviewSavedSource => ({
      kind: "saved",
      branding,
      previewImage,
      templateOptionsCatalog: catalogPayload,
      templateCategoryCatalog,
      textureCatalog,
    }),
    [branding, catalogPayload, previewImage, templateCategoryCatalog, textureCatalog],
  );

  const catalogError = useMemo(() => {
    if (!needsCatalog) return null;
    if (catalogQuery.isError) {
      return catalogQuery.error instanceof Error
        ? catalogQuery.error.message
        : "Could not load template catalog.";
    }
    if (
      catalogQuery.isSuccess &&
      catalogQuery.data &&
      isAllTemplateOptionsGatewayRedirect(catalogQuery.data)
    ) {
      return "Template catalog is unavailable for this account.";
    }
    return null;
  }, [
    catalogQuery.data,
    catalogQuery.error,
    catalogQuery.isError,
    catalogQuery.isSuccess,
    needsCatalog,
  ]);

  const status = useMemo((): ResolvedSavedRemotionPreviewSourceStatus => {
    if (!needsCatalog) return "ready";
    if (catalogError) return "catalog-error";
    if (catalogQuery.isPending || catalogPayload == null) return "loading-catalog";
    return "ready";
  }, [catalogError, catalogPayload, catalogQuery.isPending, needsCatalog]);

  return { source, status, catalogError };
}
