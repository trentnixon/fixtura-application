"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  buildRelationSelectOptions,
  TemplateBuilderRelationFieldRow,
  TemplateBuilderUseBackgroundFieldRow,
} from "./_components/template-builder-field-row";
import { TemplateBuilderPaletteCardPicker } from "./_components/template-builder-palette-card-picker";
import { TemplateBuilderSelectableTilePicker } from "./_components/template-builder-selectable-tile-picker";
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
  buildUseBackgroundSelectOptions,
  optionIdToSelectValue,
  resolveRelationSelectValue,
  useBackgroundToSelectValue,
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
}: {
  items: TemplateCategoryCatalogItem[];
  selectedId: number | null;
  isChanged: boolean;
  onSelect: (id: number) => void;
}) {
  return (
    <TemplateBuilderSelectableTilePicker
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

export function TemplateBuilderEditor({
  payload,
  categoryOptions,
  branding,
  save,
  onDraftStateChange,
  onDebugStateChange,
  onActionsChange,
}: {
  payload: AllTemplateOptionsPayload;
  categoryOptions?: TemplateCategoryCatalogItem[] | null;
  branding: AccountBrandingData | null;
  save: TemplateBuilderEditorSaveProps;
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

  const useBackgroundOptions = useMemo(() => buildUseBackgroundSelectOptions(), []);
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
    [categoryItems, changedFieldSet, draftState, payload, updateField],
  );

  return (
    <div className="text-card-foreground grid gap-4 text-sm">
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

      <div className="hidden">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleReset}
          disabled={save.isSaving}
        >
          Reset to saved
        </Button>
        <Button
          type="button"
          variant="success"
          size="sm"
          disabled={!comparison.isDirty || save.isSaving}
          onClick={() => void handleSave()}
        >
          {save.isSaving ? "Saving…" : comparison.isDirty ? "Save changes" : "No changes"}
        </Button>
      </div>

      <Tabs defaultValue="setup" className="grid gap-4 pt-2">
        <TabsList className="h-auto w-full flex-wrap justify-start">
          <TabsTrigger value="setup">Setup</TabsTrigger>
          <TabsTrigger value="style">Style</TabsTrigger>
          <TabsTrigger value="background">Background</TabsTrigger>
        </TabsList>

        <TabsContent value="setup" className="mt-0 grid gap-4">
          <TemplateBuilderCategoryCardPicker
            items={categoryItems}
            selectedId={draftState.templateCategoryId ?? savedState.templateCategoryId}
            isChanged={changedFieldSet.has("templateCategoryId")}
            onSelect={(id) => updateField("templateCategoryId", id)}
          />

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
        </TabsContent>

        <TabsContent value="style" className="mt-0 grid gap-4">
          <TemplateBuilderPaletteCardPicker
            items={payload.palettes}
            theme={branding?.theme ?? null}
            selectedId={draftState.templatePaletteId}
            isChanged={changedFieldSet.has("templatePaletteId")}
            onSelect={(id) => updateField("templatePaletteId", id)}
          />
        </TabsContent>

        <TabsContent value="background" className="mt-0 grid gap-4">
          <TemplateBuilderUseBackgroundFieldRow
            fieldId="template-builder-useBackground"
            selectValue={useBackgroundToSelectValue(draftState.useBackground)}
            options={useBackgroundOptions}
            isChanged={changedFieldSet.has("useBackground")}
            onValueChange={handleUseBackgroundChange}
          />

          {draftState.useBackground === null ? (
            <p className="text-muted-foreground text-xs">
              Choose use background to pick a background asset.
            </p>
          ) : visibleBackgroundRelationConfigs.length > 0 ? (
            <div className="grid gap-4">
              <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                Background asset
              </p>
              {visibleBackgroundRelationConfigs.map((config) => renderRelationField(config))}
            </div>
          ) : null}
        </TabsContent>
      </Tabs>
    </div>
  );
}
