import { applyRemotionPreviewDraftToBranding } from "@/features/remotion-asset-preview/utils/apply-remotion-preview-draft-to-branding";

import type { TemplateBuilderEditorState } from "./template-builder-editor-state";
import type { TemplateBuilderTexturePickerItem } from "./template-builder-texture-catalog";
import type { RemotionPreviewDraft } from "@/features/remotion-asset-preview/types/remotion-preview-draft";
import type { AccountBrandingData, AccountMediaLibraryImage } from "@/types/api/account";
import type {
  AllTemplateOptionsPayload,
  TemplateCategoryCatalogItem,
} from "@/types/api/all-template-options";

/** Map template-builder editor state to Remotion Preview Draft DTO. */
export function toRemotionPreviewDraft(state: TemplateBuilderEditorState): RemotionPreviewDraft {
  return {
    templateCategoryId: state.templateCategoryId,
    templateModeId: state.templateModeId,
    templatePaletteId: state.templatePaletteId,
    templateGradientId: state.templateGradientId,
    templateImageId: state.templateImageId,
    templateNoiseId: state.templateNoiseId,
    templateParticleId: state.templateParticleId,
    templatePatternId: state.templatePatternId,
    templateTextureId: state.templateTextureId,
    templateVideoId: state.templateVideoId,
    useBackground: state.useBackground,
  };
}

/**
 * @deprecated Prefer passing a draft `source` into `useRemotionAssetPreview`.
 * Kept for debug/view-model overlays that still need AccountBrandingData.
 */
export function buildTemplateBuilderPreviewBranding({
  branding,
  catalog,
  categoryOptions,
  draft,
  previewImage = null,
  textureCatalog = null,
}: {
  branding: AccountBrandingData | null;
  catalog: AllTemplateOptionsPayload | null;
  categoryOptions?: TemplateCategoryCatalogItem[] | null;
  draft: TemplateBuilderEditorState | null;
  previewImage?: AccountMediaLibraryImage | null;
  textureCatalog?: TemplateBuilderTexturePickerItem[] | null;
}): AccountBrandingData | null {
  return applyRemotionPreviewDraftToBranding({
    branding,
    catalog,
    ...(categoryOptions !== undefined ? { categoryOptions } : {}),
    draft: draft === null ? null : toRemotionPreviewDraft(draft),
    previewImage,
    textureCatalog,
  });
}
