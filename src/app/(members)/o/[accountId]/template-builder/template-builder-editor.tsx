"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

import { TemplateBuilderChangedBadge } from "./_components/template-builder-changed-badge";
import { TemplateBuilderColorLayoutBrandingBar } from "./_components/template-builder-color-layout-branding-bar";
import {
  buildRelationSelectOptions,
  TemplateBuilderRelationFieldRow,
} from "./_components/template-builder-field-row";
import { TemplateBuilderGradientCardPicker } from "./_components/template-builder-gradient-card-picker";
import { TemplateBuilderNoiseCardPicker } from "./_components/template-builder-noise-card-picker";
import { TemplateBuilderPaletteCardPicker } from "./_components/template-builder-palette-card-picker";
import { TemplateBuilderPreviewPanel } from "./_components/template-builder-preview-panel";
import { TemplateBuilderRelationCardPicker } from "./_components/template-builder-relation-card-picker";
import { TemplateBuilderSelectableTilePicker } from "./_components/template-builder-selectable-tile-picker";
import { TemplateBuilderTextureCardPicker } from "./_components/template-builder-texture-card-picker";
import { TemplateBuilderUseBackgroundCardPicker } from "./_components/template-builder-use-background-card-picker";
import {
  TABBER_PILL_BORDERLESS_BRAND_ACCENT_LIST_CLASS,
  TABBER_PILL_BORDERLESS_BRAND_ACCENT_TRIGGER_CLASS,
  TEMPLATE_BUILDER_PROMO_TOOLBAR_SURFACE_CLASS,
  TEMPLATE_BUILDER_SUB_PICKER_SURFACE_CLASS,
} from "./_constants/template-builder-tabber";
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

import type {
  TemplateBuilderEditorField,
  TemplateBuilderEditorState,
} from "./_utils/template-builder-editor-state";
import type { AccountBrandingData } from "@/types/api/account";
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

type RelationFieldKey = Exclude<TemplateBuilderEditorField, "useBackground">;
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

export function buildCategoryItemsForEditor({
  catalogCategories,
  categoryOptions,
}: {
  catalogCategories: TemplateCategoryCatalogItem[];
  categoryOptions?: TemplateCategoryCatalogItem[] | null | undefined;
}): TemplateCategoryCatalogItem[] {
  const base = categoryOptions && categoryOptions.length > 0 ? categoryOptions : catalogCategories;
  return base.filter((category) => !category.isPrivate);
}

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
  branding: AccountBrandingData | null;
  logoUrl: string | null;
  templateModeSlug: string | null;
};

export function TemplateBuilderEditor({
  accountId,
  payload,
  categoryOptions,
  branding,
  save,
  previewConfig,
  onDraftStateChange,
  onDebugStateChange,
  onActionsChange,
}: {
  accountId: string;
  payload: AllTemplateOptionsPayload;
  categoryOptions?: TemplateCategoryCatalogItem[] | null;
  branding: AccountBrandingData | null;
  save: TemplateBuilderEditorSaveProps;
  previewConfig?: TemplateBuilderPreviewConfig;
  onDraftStateChange?: (draft: TemplateBuilderEditorState) => void;
  onDebugStateChange?: (snapshot: TemplateBuilderEditorDebugSnapshot) => void;
  onActionsChange?: (snapshot: TemplateBuilderEditorActionsSnapshot) => void;
}) {
  const savedState = useMemo(
    () => mapCurrentSelectionToTemplateBuilderEditorState(payload.currentSelection),
    [payload.currentSelection],
  );

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

  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("setup");

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

  const handleSave = useCallback(async () => {
    save.onClearSaveFeedback();
    const errors = getTemplateBuilderSaveValidationErrors(draftState);
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
  }, [categoryItems, draftState, save]);

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
      save.onClearSaveFeedback();
      setDraftState((prev) =>
        clearInactiveBackgroundRelations({ ...prev, useBackground: value }, value),
      );
    },
    [save],
  );

  const renderRelationField = useCallback(
    (config: (typeof RELATION_FIELD_CONFIGS)[number]) => {
      const items =
        config.field === "templateCategoryId" ? categoryItems : config.getItems(payload);
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
          return (
            <TemplateBuilderTextureCardPicker
              key={field}
              branding={branding}
              palettes={payload.palettes}
              selectedPaletteId={draftState.templatePaletteId}
              items={items as TemplateTextureCatalogItem[]}
              selectedId={draftId}
              isChanged={changedFieldSet.has(field)}
              onSelect={(id) => updateField(field, id)}
              centerTiles
            />
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
    [branding, categoryItems, changedFieldSet, draftState, payload, updateField],
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
      case "background":
        return (
          <div className={cn(TEMPLATE_BUILDER_SUB_PICKER_SURFACE_CLASS, "self-stretch")}>
            <TemplateBuilderUseBackgroundCardPicker
              selectedValue={draftState.useBackground}
              isChanged={changedFieldSet.has("useBackground")}
              onSelect={handleUseBackgroundChange}
              centerTiles
            />
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
        return null;
      case "background":
        if (draftState.useBackground === null) {
          return (
            <p className="text-muted-foreground text-xs">
              Choose use background to pick a background asset.
            </p>
          );
        }

        return (
          <div className={cn(TEMPLATE_BUILDER_SUB_PICKER_SURFACE_CLASS, "self-stretch")}>
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="grid gap-2">
        <div className={TEMPLATE_BUILDER_PROMO_TOOLBAR_SURFACE_CLASS}>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <TabsList
              className={cn(
                TABBER_PILL_BORDERLESS_BRAND_ACCENT_LIST_CLASS,
                "w-full justify-start sm:w-auto",
              )}
            >
              <TabsTrigger
                value="setup"
                className={TABBER_PILL_BORDERLESS_BRAND_ACCENT_TRIGGER_CLASS}
              >
                1. Select a Template
              </TabsTrigger>
              <TabsTrigger
                value="style"
                className={TABBER_PILL_BORDERLESS_BRAND_ACCENT_TRIGGER_CLASS}
              >
                2. Select a color variation
              </TabsTrigger>
              <TabsTrigger
                value="background"
                className={TABBER_PILL_BORDERLESS_BRAND_ACCENT_TRIGGER_CLASS}
              >
                3. Select a background
              </TabsTrigger>
            </TabsList>

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
        </div>

        <div className="flex w-full flex-col items-center gap-4">
          {renderPrimaryTabPanel()}
          {renderSubTabPanel()}
        </div>

        {previewConfig ? (
          <TemplateBuilderPreviewPanel
            accountId={accountId}
            sport={previewConfig.sport}
            branding={previewConfig.branding}
            logoUrl={previewConfig.logoUrl}
            templateModeSlug={previewConfig.templateModeSlug}
            toolbarStart={
              <TemplateBuilderColorLayoutBrandingBar accountId={accountId} branding={branding} />
            }
          />
        ) : null}
      </Tabs>
    </div>
  );
}
