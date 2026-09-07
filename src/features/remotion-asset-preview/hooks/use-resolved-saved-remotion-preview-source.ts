"use client";

import { useMemo } from "react";

import {
  isAllTemplateOptionsGatewayRedirect,
  useAllTemplateOptions,
} from "@/lib/api/hooks/account/useAllTemplateOptions";
import { useTemplateTexturesUi } from "@/lib/api/hooks/template-textures/useTemplateTexturesUi";

import { applyRemotionPreviewDraftToBranding } from "../utils/apply-remotion-preview-draft-to-branding";
import { buildRemotionPreviewDraftFromCurrentSelection } from "../utils/build-remotion-preview-draft-for-saved-branding";
import { readUseBackgroundFromAccountBranding } from "../utils/read-use-background-from-account-branding";
import { resolveRemotionPreviewTextureCatalog } from "../utils/resolve-remotion-preview-texture-catalog";
import { readTemplateOptionIdFromBranding } from "../utils/resolve-saved-branding-for-remotion-preview";

import type { AssembleAccountRemotionPreviewSource } from "../utils/assemble-account-remotion-preview";
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
  source: AssembleAccountRemotionPreviewSource;
  status: ResolvedSavedRemotionPreviewSourceStatus;
  catalogError: string | null;
  /** Draft-applied branding — same basis as template builder preview mode slug. */
  previewBranding: AccountBrandingData | null;
  useBackground: string | null;
};

/**
 * Dashboard preview source — mirrors template builder after save:
 * catalog `currentSelection` → draft assembly (not raw `/branding` saved path).
 */
export function useResolvedSavedRemotionPreviewSource({
  accountId,
  branding,
  previewImage = null,
  templateCategoryCatalog = null,
}: UseResolvedSavedRemotionPreviewSourceInput): UseResolvedSavedRemotionPreviewSourceResult {
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

  const draft = useMemo(
    () =>
      catalogPayload != null ? buildRemotionPreviewDraftFromCurrentSelection(catalogPayload) : null,
    [catalogPayload],
  );

  const previewBranding = useMemo(() => {
    if (branding === null) return null;
    if (catalogPayload == null || draft == null) return branding;
    return (
      applyRemotionPreviewDraftToBranding({
        branding,
        catalog: catalogPayload,
        categoryOptions: templateCategoryCatalog,
        draft,
        previewImage,
        textureCatalog,
      }) ?? branding
    );
  }, [branding, catalogPayload, draft, previewImage, templateCategoryCatalog, textureCatalog]);

  const useBackground = useMemo(
    () => readUseBackgroundFromAccountBranding(previewBranding ?? branding),
    [branding, previewBranding],
  );

  const source = useMemo((): AssembleAccountRemotionPreviewSource => {
    const common = {
      branding,
      previewImage,
      templateOptionsCatalog: catalogPayload,
      templateCategoryCatalog,
      textureCatalog,
    };

    if (catalogPayload != null && draft != null) {
      return {
        kind: "draft",
        ...common,
        draft,
        templateOptionsCatalog: catalogPayload,
      };
    }

    return {
      kind: "saved",
      ...common,
    };
  }, [branding, catalogPayload, draft, previewImage, templateCategoryCatalog, textureCatalog]);

  const catalogError = useMemo(() => {
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
  }, [catalogQuery.data, catalogQuery.error, catalogQuery.isError, catalogQuery.isSuccess]);

  const status = useMemo((): ResolvedSavedRemotionPreviewSourceStatus => {
    if (catalogError) return "catalog-error";
    if (catalogQuery.isPending || catalogPayload == null) return "loading-catalog";
    return "ready";
  }, [catalogError, catalogPayload, catalogQuery.isPending]);

  return { source, status, catalogError, previewBranding, useBackground };
}
