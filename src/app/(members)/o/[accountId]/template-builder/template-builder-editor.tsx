"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { TemplateBuilderAnimationCardPicker } from "./_components/template-builder-animation-card-picker";
import { TemplateBuilderChangedBadge } from "./_components/template-builder-changed-badge";
import { TemplateBuilderColorLayoutBrandingBar } from "./_components/template-builder-color-layout-branding-bar";
import { TemplateBuilderContrastModePicker } from "./_components/template-builder-contrast-mode-picker";
import {
  buildRelationSelectOptions,
  TemplateBuilderRelationFieldRow,
} from "./_components/template-builder-field-row";
import { TemplateBuilderGradientCardPicker } from "./_components/template-builder-gradient-card-picker";
import { TemplateBuilderMediaImagePicker } from "./_components/template-builder-media-image-picker";
import { TemplateBuilderNoiseCardPicker } from "./_components/template-builder-noise-card-picker";
import { TemplateBuilderPaletteCardPicker } from "./_components/template-builder-palette-card-picker";
import { TemplateBuilderPreviewPanel } from "./_components/template-builder-preview-panel";
import { TemplateBuilderRelationCardPicker } from "./_components/template-builder-relation-card-picker";
import { TemplateBuilderSelectableTilePicker } from "./_components/template-builder-selectable-tile-picker";
import { TemplateBuilderTextureCardPicker } from "./_components/template-builder-texture-card-picker";
import { TemplateBuilderUseBackgroundCardPicker } from "./_components/template-builder-use-background-card-picker";
import {
  TEMPLATE_BUILDER_RAIL_NAV_LIST_CLASS,
  TEMPLATE_BUILDER_RAIL_NAV_SURFACE_CLASS,
  TEMPLATE_BUILDER_RAIL_NAV_TRIGGER_CLASS,
  TEMPLATE_BUILDER_SUB_PICKER_SURFACE_CLASS,
  TEMPLATE_BUILDER_TOOL_RAIL_CLASS,
  TEMPLATE_BUILDER_WORKSPACE_GRID_CLASS,
  TEMPLATE_BUILDER_WORKSPACE_HEADER_CLASS,
} from "./_constants/template-builder-tabber";
import {
  buildDefaultAnimationForPreset,
  getAnimationPresetType,
  isAnimationPresetAvailable,
  resolveAnimatedEditorFields,
  resolveDefaultAnimationPreset,
} from "./_utils/template-builder-animation-catalog";
import { buildCategoryItemsForEditor } from "./_utils/template-builder-category-items";
import {
  cloneTemplateBuilderEditorState,
  compareTemplateBuilderEditorStates,
  mapCurrentSelectionToTemplateBuilderEditorState,
} from "./_utils/template-builder-editor-state";
import {
  BACKGROUND_RELATION_FIELDS,
  clearInactiveBackgroundRelations,
  isBackgroundRelationFieldVisible,
} from "./_utils/template-builder-field-visibility";
import {
  getLegacyBackgroundMigrationMessage,
  getSavedUseBackgroundRequiresMigration,
} from "./_utils/template-builder-legacy-background-migration";
import {
  clearUnavailableImageBackground,
  type TemplateBuilderMediaPreviewState,
} from "./_utils/template-builder-media-preview";
import {
  formatCategoryLabel,
  formatGradientLabel,
  formatImageLabel,
  formatModeLabel,
  formatNoiseLabel,
  formatPaletteLabel,
  formatParticleLabel,
  formatTextureLabel,
  formatVideoLabel,
} from "./_utils/template-builder-option-labels";
import { getTemplateBuilderSaveValidationErrors } from "./_utils/template-builder-save-payload";
import {
  optionIdToSelectValue,
  resolveRelationSelectValue,
} from "./_utils/template-builder-select-value";
import {
  groupTemplateTexturesByCategory,
  type TemplateBuilderTexturePickerItem,
} from "./_utils/template-builder-texture-catalog";

import type {
  TemplateBuilderEditorField,
  TemplateBuilderEditorState,
} from "./_utils/template-builder-editor-state";
import type { AssembleAccountRemotionPreviewSource } from "@/features/remotion-asset-preview/utils/assemble-account-remotion-preview";
import type { AccountBrandingData } from "@/types/api/account";
import type { AnimationPresetCatalogItem } from "@/types/api/all-template-options";
import type {
  AllTemplateOptionsPayload,
  TemplateCategoryCatalogItem,
  TemplateGradientItem,
  TemplateImageItem,
  TemplateModeItem,
  TemplateNoiseItem,
  TemplatePaletteItem,
  TemplateParticleItem,
  TemplateTextureCatalogItem,
  TemplateVideoItem,
} from "@/types/api/all-template-options";

type RelationFieldKey = Exclude<TemplateBuilderEditorField, "useBackground" | "animation">;
type RelationCatalogItem =
  | TemplateCategoryCatalogItem
  | TemplateModeItem
  | TemplatePaletteItem
  | TemplateGradientItem
  | TemplateImageItem
  | TemplateNoiseItem
  | TemplateParticleItem
  | TemplateTextureCatalogItem
  | TemplateVideoItem;

interface RelationFieldConfig {
  field: RelationFieldKey;
  label: string;
  getItems: (payload: AllTemplateOptionsPayload) => RelationCatalogItem[];
  formatItemLabel: (item: RelationCatalogItem) => string;
}

const RELATION_FIELD_CONFIGS: RelationFieldConfig[] = [
  {
    field: "templateCategoryId",
    label: "Select Template style",
    getItems: (p) => p.categories,
    formatItemLabel: (item) => formatCategoryLabel(item as TemplateCategoryCatalogItem),
  },
  {
    field: "templateModeId",
    label: "Mode",
    getItems: (p) => p.modes,
    formatItemLabel: (item) => formatModeLabel(item as TemplateModeItem),
  },
  {
    field: "templatePaletteId",
    label: "Color Layout",
    getItems: (p) => p.palettes,
    formatItemLabel: (item) => formatPaletteLabel(item as TemplatePaletteItem),
  },
  {
    field: "templateGradientId",
    label: "Gradient",
    getItems: (p) => p.gradients,
    formatItemLabel: (item) => formatGradientLabel(item as TemplateGradientItem),
  },
  {
    field: "templateImageId",
    label: "Image",
    getItems: (p) => p.images,
    formatItemLabel: (item) => formatImageLabel(item as TemplateImageItem),
  },
  {
    field: "templateNoiseId",
    label: "Noise",
    getItems: (p) => p.noises,
    formatItemLabel: (item) => formatNoiseLabel(item as TemplateNoiseItem),
  },
  {
    field: "templateParticleId",
    label: "Particle",
    getItems: (p) => p.particles,
    formatItemLabel: (item) => formatParticleLabel(item as TemplateParticleItem),
  },
  {
    field: "templateTextureId",
    label: "Texture",
    getItems: (p) => p.textures,
    formatItemLabel: (item) => formatTextureLabel(item as TemplateTextureCatalogItem),
  },
  {
    field: "templateVideoId",
    label: "Video",
    getItems: (p) => p.videos,
    formatItemLabel: (item) => formatVideoLabel(item as TemplateVideoItem),
  },
];

const WORKSPACE_GROUPS = [
  { id: "setup", label: "1. Template" },
  { id: "style", label: "2. Color pairing" },
  { id: "contrast", label: "3. Contrast" },
  { id: "background", label: "4. Background" },
] as const;

function TemplateBuilderCategoryCardPicker({
  items,
  selectedId,
  isChanged,
  onSelect,
  centerTiles = false,
}: {
  items: TemplateCategoryCatalogItem[];
  selectedId: number | null;
  isChanged: boolean;
  onSelect: (id: number) => void;
  centerTiles?: boolean;
}) {
  return (
    <TemplateBuilderSelectableTilePicker
      hideHeader
      label="Select Template style"
      groupAriaLabel="Select Template style"
      items={items.map((category) => ({
        id: category.id,
        title: formatCategoryLabel(category),
      }))}
      selectedId={selectedId}
      isChanged={isChanged}
      onSelect={onSelect}
      emptyMessage="No public template styles available."
      centerTiles={centerTiles}
      orientation="vertical"
      scrollClassName="h-[min(55vh,26rem)]"
    />
  );
}

export interface TemplateBuilderEditorSaveProps {
  onSaveDraft: (draft: TemplateBuilderEditorState) => Promise<void>;
  isSaving: boolean;
  saveError: string | null;
  saveSuccess: boolean;
  onClearSaveFeedback: () => void;
}

export interface TemplateBuilderEditorDebugSnapshot {
  isDirty: boolean;
  changedCount: number;
  changedFields: string[];
  savedState: TemplateBuilderEditorState;
  draftState: TemplateBuilderEditorState;
}

export interface TemplateBuilderEditorActionsSnapshot {
  isDirty: boolean;
  isSaving: boolean;
  saveLabel: string;
  onReset: () => void;
  onSave: () => void;
}

export type TemplateBuilderPreviewConfig = {
  sport: string | null;
  logoUrl: string | null;
  templateModeSlug: string | null;
  source: AssembleAccountRemotionPreviewSource;
  templateCategoryCatalog?: TemplateCategoryCatalogItem[] | null;
};

export type TemplateBuilderTextureCatalogLoadState = "loading" | "ready" | "error";

export function TemplateBuilderEditor({
  accountId,
  payload,
  categoryOptions,
  branding,
  textureCatalog,
  textureCatalogLoadState = "ready",
  textureCatalogError = null,
  textureCatalogNotice = null,
  onTexturesRetry,
  save,
  previewConfig,
  mediaPreview,
  onDraftStateChange,
  onDebugStateChange,
  onActionsChange,
}: {
  accountId: string;
  payload: AllTemplateOptionsPayload;
  categoryOptions?: TemplateCategoryCatalogItem[] | null;
  branding: AccountBrandingData | null;
  textureCatalog?: TemplateBuilderTexturePickerItem[];
  textureCatalogLoadState?: TemplateBuilderTextureCatalogLoadState;
  textureCatalogError?: string | null;
  textureCatalogNotice?: string | null;
  onTexturesRetry?: () => void;
  save: TemplateBuilderEditorSaveProps;
  previewConfig?: TemplateBuilderPreviewConfig;
  mediaPreview: TemplateBuilderMediaPreviewState;
  onDraftStateChange?: (draft: TemplateBuilderEditorState) => void;
  onDebugStateChange?: (snapshot: TemplateBuilderEditorDebugSnapshot) => void;
  onActionsChange?: (snapshot: TemplateBuilderEditorActionsSnapshot) => void;
}) {
  const savedState = useMemo(() => {
    const base = mapCurrentSelectionToTemplateBuilderEditorState(payload.currentSelection);
    if (base.useBackground !== "Animated") return base;

    return {
      ...base,
      ...resolveAnimatedEditorFields(payload.animations ?? [], {
        templateAnimationId: base.templateAnimationId,
        templateAnimationPresetId: payload.currentSelection?.templateAnimation?.presetId ?? null,
      }),
    };
  }, [payload.animations, payload.currentSelection]);

  const [draftState, setDraftState] = useState<TemplateBuilderEditorState>(() =>
    cloneTemplateBuilderEditorState(savedState),
  );

  useEffect(() => {
    setDraftState(cloneTemplateBuilderEditorState(savedState));
  }, [savedState]);

  useEffect(() => {
    onDraftStateChange?.(draftState);
  }, [draftState, onDraftStateChange]);

  const comparison = useMemo(
    () => compareTemplateBuilderEditorStates(savedState, draftState),
    [savedState, draftState],
  );

  const changedFieldSet = useMemo(
    () => new Set(comparison.fields.filter((f) => f.isChanged).map((f) => f.field)),
    [comparison.fields],
  );

  useEffect(() => {
    onDebugStateChange?.({
      isDirty: comparison.isDirty,
      changedCount: comparison.changedCount,
      changedFields: comparison.fields.filter((f) => f.isChanged).map((f) => f.field),
      savedState,
      draftState,
    });
  }, [comparison, draftState, onDebugStateChange, savedState]);

  const savedLegacyMode = useMemo(
    () => getSavedUseBackgroundRequiresMigration(payload.currentSelection?.useBackground),
    [payload.currentSelection?.useBackground],
  );

  const unavailableAnimationPresetId = useMemo(() => {
    const type = getAnimationPresetType(draftState.animation);
    if (type === null) return null;
    if (payload.animations == null || payload.animations.length === 0) return type;
    return isAnimationPresetAvailable(payload.animations, type) ? null : type;
  }, [draftState.animation, payload.animations]);

  const defaultAnimationPreset = useMemo(
    () => resolveDefaultAnimationPreset(payload.animations ?? [], payload.defaultAnimationPresetId),
    [payload.animations, payload.defaultAnimationPresetId],
  );

  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("setup");
  const [showImageUnavailableWarning, setShowImageUnavailableWarning] = useState(false);

  const hasConfirmedEmptyMediaLibrary =
    mediaPreview.status === "ready" && mediaPreview.items.length === 0;

  const updateField = useCallback(
    <K extends TemplateBuilderEditorField>(field: K, value: TemplateBuilderEditorState[K]) => {
      setValidationErrors([]);
      save.onClearSaveFeedback();
      setDraftState((prev) => ({ ...prev, [field]: value }));
    },
    [save],
  );

  const handleReset = useCallback(() => {
    setDraftState(cloneTemplateBuilderEditorState(savedState));
    setValidationErrors([]);
    save.onClearSaveFeedback();
  }, [savedState, save]);

  const categoryItems = useMemo(
    () =>
      buildCategoryItemsForEditor({
        catalogCategories: payload.categories,
        categoryOptions,
      }),
    [categoryOptions, payload.categories],
  );

  const textureCatalogItems = useMemo(() => textureCatalog ?? [], [textureCatalog]);
  const textureCategoryGroups = useMemo(
    () => groupTemplateTexturesByCategory(textureCatalogItems),
    [textureCatalogItems],
  );

  const handleSave = useCallback(async () => {
    save.onClearSaveFeedback();
    const errors = getTemplateBuilderSaveValidationErrors(draftState, {
      savedUseBackground: payload.currentSelection?.useBackground,
    });
    if (
      draftState.templateCategoryId !== null &&
      !categoryItems.some((category) => category.id === draftState.templateCategoryId)
    ) {
      errors.push("Choose a public category before saving.");
    }
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }
    setValidationErrors([]);
    try {
      await save.onSaveDraft(draftState);
    } catch {
      // Mutation state owns the visible error; keep draft selections intact.
    }
  }, [categoryItems, draftState, payload.currentSelection?.useBackground, save]);

  const resetActionRef = useRef<() => void>(() => undefined);
  const saveActionRef = useRef<() => void>(() => undefined);

  useEffect(() => {
    resetActionRef.current = handleReset;
    saveActionRef.current = () => void handleSave();
  }, [handleReset, handleSave]);

  const triggerReset = useCallback(() => {
    resetActionRef.current();
  }, []);

  const triggerSave = useCallback(() => {
    saveActionRef.current();
  }, []);

  const saveLabel = save.isSaving
    ? "Saving..."
    : comparison.isDirty
      ? "Save changes"
      : "No changes";

  useEffect(() => {
    onActionsChange?.({
      isDirty: comparison.isDirty,
      isSaving: save.isSaving,
      saveLabel,
      onReset: triggerReset,
      onSave: triggerSave,
    });
  }, [comparison.isDirty, onActionsChange, save.isSaving, saveLabel, triggerReset, triggerSave]);

  const categoryRelationConfig = useMemo(
    () => RELATION_FIELD_CONFIGS.find((c) => c.field === "templateCategoryId") ?? null,
    [],
  );

  const visibleBackgroundRelationConfigs = useMemo(
    () =>
      RELATION_FIELD_CONFIGS.filter(
        (c) =>
          (BACKGROUND_RELATION_FIELDS as readonly string[]).includes(c.field) &&
          isBackgroundRelationFieldVisible(
            c.field as (typeof BACKGROUND_RELATION_FIELDS)[number],
            draftState.useBackground,
          ),
      ),
    [draftState.useBackground],
  );

  const handleUseBackgroundChange = useCallback(
    (value: TemplateBuilderEditorState["useBackground"]) => {
      setValidationErrors([]);
      setShowImageUnavailableWarning(false);
      save.onClearSaveFeedback();
      setDraftState((prev) => {
        const next = clearInactiveBackgroundRelations({ ...prev, useBackground: value }, value);
        if (value === "Animated" && next.animation === null && defaultAnimationPreset) {
          next.animation = buildDefaultAnimationForPreset(defaultAnimationPreset);
          next.templateAnimationId = defaultAnimationPreset.id;
        }
        return next;
      });
    },
    [defaultAnimationPreset, save],
  );

  const handleAnimationPresetSelect = useCallback(
    (preset: AnimationPresetCatalogItem) => {
      setValidationErrors([]);
      save.onClearSaveFeedback();
      setDraftState((prev) => ({
        ...prev,
        useBackground: "Animated",
        templateAnimationId: preset.id,
        animation: buildDefaultAnimationForPreset(preset),
      }));
    },
    [save],
  );

  useEffect(() => {
    if (!hasConfirmedEmptyMediaLibrary) {
      setShowImageUnavailableWarning(false);
      return;
    }
    if (draftState.useBackground !== "Image") return;

    setShowImageUnavailableWarning(true);
    setValidationErrors([]);
    save.onClearSaveFeedback();
    setDraftState((current) =>
      clearUnavailableImageBackground(current, hasConfirmedEmptyMediaLibrary),
    );
  }, [draftState.useBackground, hasConfirmedEmptyMediaLibrary, save]);

  const renderRelationField = useCallback(
    (config: (typeof RELATION_FIELD_CONFIGS)[number]) => {
      const items =
        config.field === "templateCategoryId"
          ? categoryItems
          : config.field === "templateTextureId"
            ? textureCatalogItems
            : config.getItems(payload);
      const field = config.field;
      const draftId = draftState[field];
      const isBackgroundField = (BACKGROUND_RELATION_FIELDS as readonly string[]).includes(field);

      if (isBackgroundField) {
        if (field === "templateGradientId") {
          return (
            <TemplateBuilderGradientCardPicker
              key={field}
              branding={branding}
              palettes={payload.palettes}
              selectedPaletteId={draftState.templatePaletteId}
              items={items as TemplateGradientItem[]}
              selectedId={draftId}
              isChanged={changedFieldSet.has(field)}
              onSelect={(id) => updateField(field, id)}
              centerTiles
            />
          );
        }

        if (field === "templateNoiseId") {
          return (
            <TemplateBuilderNoiseCardPicker
              key={field}
              branding={branding}
              palettes={payload.palettes}
              selectedPaletteId={draftState.templatePaletteId}
              items={items as TemplateNoiseItem[]}
              selectedId={draftId}
              isChanged={changedFieldSet.has(field)}
              onSelect={(id) => updateField(field, id)}
              centerTiles
            />
          );
        }

        if (field === "templateTextureId") {
          if (textureCatalogLoadState === "loading") {
            return (
              <p key={field} className="text-muted-foreground text-sm">
                Loading textures…
              </p>
            );
          }

          if (textureCatalogLoadState === "error") {
            return (
              <div key={field} className="grid gap-2">
                <p className="text-destructive text-sm" role="alert">
                  {textureCatalogError ?? "Could not load textures."}
                </p>
                {onTexturesRetry ? (
                  <Button type="button" variant="outline" size="sm" onClick={onTexturesRetry}>
                    Retry
                  </Button>
                ) : null}
              </div>
            );
          }

          return (
            <div key={field} className="grid gap-3">
              {textureCatalogNotice ? (
                <p className="border-border bg-muted/40 text-muted-foreground rounded-md border px-3 py-2 text-xs">
                  {textureCatalogNotice}
                </p>
              ) : null}
              <TemplateBuilderTextureCardPicker
                branding={branding}
                palettes={payload.palettes}
                selectedPaletteId={draftState.templatePaletteId}
                items={items as TemplateTextureCatalogItem[]}
                groups={textureCategoryGroups}
                selectedId={draftId}
                isChanged={changedFieldSet.has(field)}
                onSelect={(id) => updateField(field, id)}
                centerTiles
              />
            </div>
          );
        }

        return (
          <TemplateBuilderRelationCardPicker
            key={field}
            label={config.label}
            items={items}
            formatItemLabel={config.formatItemLabel}
            selectedId={draftId}
            isChanged={changedFieldSet.has(field)}
            onSelect={(id) => updateField(field, id)}
            centerTiles
          />
        );
      }

      return (
        <TemplateBuilderRelationFieldRow
          key={field}
          fieldId={`template-builder-${field}`}
          label={config.label}
          selectValue={optionIdToSelectValue(draftId)}
          options={buildRelationSelectOptions(items, config.formatItemLabel)}
          isChanged={changedFieldSet.has(field)}
          onValueChange={(id) => updateField(field, id)}
        />
      );
    },
    [
      branding,
      categoryItems,
      changedFieldSet,
      draftState,
      onTexturesRetry,
      payload,
      textureCatalogItems,
      textureCatalogError,
      textureCatalogLoadState,
      textureCatalogNotice,
      textureCategoryGroups,
      updateField,
    ],
  );

  const renderPrimaryTabPanel = () => {
    switch (activeTab) {
      case "setup":
        return (
          <div className={cn(TEMPLATE_BUILDER_SUB_PICKER_SURFACE_CLASS, "self-stretch")}>
            <TemplateBuilderCategoryCardPicker
              items={categoryItems}
              selectedId={draftState.templateCategoryId ?? savedState.templateCategoryId}
              isChanged={changedFieldSet.has("templateCategoryId")}
              onSelect={(id) => updateField("templateCategoryId", id)}
              centerTiles
            />
          </div>
        );
      case "style":
        return (
          <div className={cn(TEMPLATE_BUILDER_SUB_PICKER_SURFACE_CLASS, "self-stretch")}>
            <TemplateBuilderPaletteCardPicker
              branding={branding}
              items={payload.palettes}
              selectedId={draftState.templatePaletteId}
              isChanged={changedFieldSet.has("templatePaletteId")}
              onSelect={(id) => updateField("templatePaletteId", id)}
              centerTiles
            />
          </div>
        );
      case "contrast":
        return (
          <div className={cn(TEMPLATE_BUILDER_SUB_PICKER_SURFACE_CLASS, "self-stretch")}>
            <TemplateBuilderContrastModePicker
              branding={branding}
              modes={payload.modes}
              selectedId={draftState.templateModeId}
              isChanged={changedFieldSet.has("templateModeId")}
              onSelect={(id) => updateField("templateModeId", id)}
              centerTiles
            />
          </div>
        );
      case "background":
        return (
          <div className={cn(TEMPLATE_BUILDER_SUB_PICKER_SURFACE_CLASS, "self-stretch")}>
            <TemplateBuilderUseBackgroundCardPicker
              selectedValue={draftState.useBackground}
              isChanged={changedFieldSet.has("useBackground")}
              hideImageOption={hasConfirmedEmptyMediaLibrary}
              onSelect={handleUseBackgroundChange}
            />
            {showImageUnavailableWarning ? (
              <div
                className="border-destructive/40 bg-destructive/10 text-destructive mt-3 rounded-md border px-3 py-2 text-xs"
                role="alert"
              >
                Image background was cleared because this account has no uploaded images. Choose
                another background type before saving.
              </div>
            ) : null}
            {savedLegacyMode ? (
              <div
                className="border-destructive/40 bg-destructive/10 text-destructive mt-3 rounded-md border px-3 py-2 text-xs"
                role="alert"
              >
                {getLegacyBackgroundMigrationMessage(savedLegacyMode)}
              </div>
            ) : null}
          </div>
        );
      default:
        return null;
    }
  };

  const renderSubTabPanel = () => {
    switch (activeTab) {
      case "setup":
        return (
          <div className="hidden">
            {categoryRelationConfig ? (
              <TemplateBuilderRelationFieldRow
                fieldId="template-builder-templateCategoryId"
                label={categoryRelationConfig.label}
                selectValue={resolveRelationSelectValue(
                  draftState.templateCategoryId,
                  savedState.templateCategoryId,
                  false,
                )}
                options={buildRelationSelectOptions(categoryItems, formatCategoryLabel)}
                isChanged={changedFieldSet.has("templateCategoryId")}
                allowUnset={false}
                selectPlaceholder="Select a category…"
                onValueChange={(id) =>
                  updateField("templateCategoryId", id ?? savedState.templateCategoryId)
                }
              />
            ) : null}
          </div>
        );
      case "style":
        return (
          <div className={cn(TEMPLATE_BUILDER_SUB_PICKER_SURFACE_CLASS, "self-stretch")}>
            <TemplateBuilderColorLayoutBrandingBar accountId={accountId} branding={branding} />
          </div>
        );
      case "contrast":
        return null;
      case "background":
        if (draftState.useBackground === null) {
          return (
            <p className="text-xs text-white/65">Choose a background type to pick a variant.</p>
          );
        }

        if (draftState.useBackground === "Solid") {
          return <p className="text-xs text-white/65">Solid uses no background asset variant.</p>;
        }

        if (draftState.useBackground === "Animated") {
          return (
            <div className={cn(TEMPLATE_BUILDER_SUB_PICKER_SURFACE_CLASS, "self-stretch")}>
              <TemplateBuilderAnimationCardPicker
                presets={payload.animations ?? []}
                selectedAnimation={draftState.animation}
                isChanged={changedFieldSet.has("animation")}
                unavailablePresetId={unavailableAnimationPresetId}
                onSelectPreset={handleAnimationPresetSelect}
              />
            </div>
          );
        }

        return (
          <div className={cn(TEMPLATE_BUILDER_SUB_PICKER_SURFACE_CLASS, "self-stretch")}>
            {draftState.useBackground === "Image" ? (
              <TemplateBuilderMediaImagePicker mediaPreview={mediaPreview} />
            ) : null}
            {visibleBackgroundRelationConfigs.map((config) => renderRelationField(config))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="text-card-foreground grid gap-3 text-sm">
      {comparison.isDirty ? <TemplateBuilderChangedBadge placement="floating" /> : null}

      <div className={TEMPLATE_BUILDER_WORKSPACE_HEADER_CLASS}>
        <div className="min-w-0 flex-1">
          {(validationErrors.length > 0 || save.saveError) && (
            <div
              className="border-destructive/40 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-xs"
              role="alert"
            >
              {validationErrors.length > 0 ? (
                <ul className="list-inside list-disc">
                  {validationErrors.map((msg) => (
                    <li key={msg}>{msg}</li>
                  ))}
                </ul>
              ) : (
                <p>{save.saveError}</p>
              )}
            </div>
          )}
          {save.saveSuccess && (
            <p className="text-xs font-medium text-emerald-600 dark:text-emerald-500" role="status">
              Template options saved.
            </p>
          )}
        </div>

        <div className="flex w-full shrink-0 flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex-1 sm:flex-none"
            onClick={handleReset}
            disabled={save.isSaving}
          >
            Reset to saved
          </Button>
          <Button
            type="button"
            variant="success"
            size="sm"
            className="flex-1 sm:flex-none"
            disabled={!comparison.isDirty || save.isSaving}
            onClick={() => void handleSave()}
          >
            {saveLabel}
          </Button>
        </div>
      </div>

      <div className={TEMPLATE_BUILDER_WORKSPACE_GRID_CLASS}>
        <aside className={TEMPLATE_BUILDER_TOOL_RAIL_CLASS} aria-label="Template tools">
          <div className={TEMPLATE_BUILDER_RAIL_NAV_SURFACE_CLASS}>
            <div
              role="tablist"
              aria-orientation="vertical"
              className={TEMPLATE_BUILDER_RAIL_NAV_LIST_CLASS}
            >
              {WORKSPACE_GROUPS.map((group) => {
                const isActive = activeTab === group.id;
                return (
                  <button
                    key={group.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    data-state={isActive ? "active" : "inactive"}
                    className={TEMPLATE_BUILDER_RAIL_NAV_TRIGGER_CLASS}
                    onClick={() => setActiveTab(group.id)}
                  >
                    {group.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div role="tabpanel" className="flex min-w-0 flex-col gap-3">
            {activeTab === "style" ? (
              <>
                {renderSubTabPanel()}
                {renderPrimaryTabPanel()}
              </>
            ) : (
              <>
                {renderPrimaryTabPanel()}
                {renderSubTabPanel()}
              </>
            )}
          </div>
        </aside>

        <section className="min-w-0" aria-label="Template canvas">
          {previewConfig ? (
            <TemplateBuilderPreviewPanel
              accountId={accountId}
              sport={previewConfig.sport}
              source={previewConfig.source}
              logoUrl={previewConfig.logoUrl}
              templateModeSlug={previewConfig.templateModeSlug}
              templateCategoryCatalog={previewConfig.templateCategoryCatalog ?? null}
            />
          ) : null}
        </section>
      </div>
    </div>
  );
}
