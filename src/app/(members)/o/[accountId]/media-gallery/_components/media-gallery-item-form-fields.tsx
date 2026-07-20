"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { TypographyHelperText } from "@/components/typography";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useAssetsListForSelection } from "@/lib/api/hooks/account/useAssetsListForSelection";
import { cn } from "@/lib/utils";

import { MediaGalleryFocalPoint } from "./media-gallery-focal-point";
import {
  categoryAssignmentToOptionIds,
  isAllScopeAssignment,
  selectAllCategoryScope,
  toggleAssociationCategoryOption,
  toggleClubCategoryOption,
  type MediaGalleryCategoryConfig,
} from "../_utils/media-gallery-category";
import {
  buildMediaLibraryAssetTypeOptions,
  MEDIA_LIBRARY_ASSET_TYPE_ALL,
  SHOW_MEDIA_LIBRARY_FOCAL_POINT_UI,
  SHOW_MEDIA_LIBRARY_TAGS_UI,
  toggleAssetTypeSelection,
} from "../_utils/media-gallery-form";

import type { AccountMediaLibraryCategoryAssignmentWrite } from "@/types/api/account";
import type { ReactNode } from "react";

const categoryAssignmentSchema = z.object({
  type: z.enum(["club-age", "competition", "grade"]),
  scope: z.enum(["all", "selected"]),
  targets: z.array(z.union([z.string(), z.number()])),
});

export const mediaGalleryFormSchema = z
  .object({
    title: z.string().trim().min(1, "Enter a title").max(120, "Title is too long"),
    tagsInput: z.string(),
    categoryAssignment: categoryAssignmentSchema,
    assetTypes: z.array(z.string().trim().min(1)).min(1, "Select at least one asset type"),
    isActive: z.boolean(),
    useFocalPoint: z.boolean(),
    markerTop: z.number().min(0).max(100),
    markerLeft: z.number().min(0).max(100),
  })
  .superRefine((values, ctx) => {
    const hasAll = values.assetTypes.includes(MEDIA_LIBRARY_ASSET_TYPE_ALL);
    if (hasAll && values.assetTypes.length > 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["assetTypes"],
        message: "ALL cannot be combined with specific asset types",
      });
    }
    if (
      values.categoryAssignment.scope === "selected" &&
      values.categoryAssignment.targets.length === 0
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["categoryAssignment"],
        message: "Select at least one category target",
      });
    }
  });

export type MediaGalleryFormValues = z.infer<typeof mediaGalleryFormSchema>;

const mediaGalleryPillToggleClassName = cn(
  "h-9 max-w-full rounded-full border px-3.5 text-xs font-medium sm:text-sm",
  "border-border bg-background text-foreground shadow-xs",
  "transition-[color,background-color,border-color,box-shadow,transform]",
  "hover:border-[var(--brand-primary)]/50 hover:bg-[color-mix(in_oklch,var(--brand-primary),transparent_92%)] hover:text-[var(--brand-primary)]",
  "active:translate-y-px active:bg-[color-mix(in_oklch,var(--brand-primary),transparent_85%)] active:shadow-none",
  "data-[state=on]:border-[var(--brand-primary)] data-[state=on]:bg-[var(--brand-primary)] data-[state=on]:text-primary-foreground data-[state=on]:shadow-sm",
  "data-[state=on]:hover:bg-[var(--brand-primary)]/90 data-[state=on]:hover:text-primary-foreground",
  "data-[state=on]:active:bg-[var(--brand-primary)]/80 data-[state=on]:active:translate-y-px",
  "focus-visible:ring-[3px] focus-visible:ring-[color-mix(in_oklch,var(--brand-primary),transparent_70%)]",
  "disabled:pointer-events-none disabled:opacity-50",
);

type MediaGalleryFormSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

function MediaGalleryFormSection({ title, description, children }: MediaGalleryFormSectionProps) {
  return (
    <section className="border-border grid gap-4 rounded-xl border p-4 sm:p-5">
      <header className="grid gap-1">
        <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
        {description ? <TypographyHelperText>{description}</TypographyHelperText> : null}
      </header>
      <div className="grid gap-4">{children}</div>
    </section>
  );
}

type MediaGalleryItemFormFieldsProps = {
  form: ReturnType<typeof useForm<MediaGalleryFormValues>>;
  previewUrl: string | null;
  accountSport: string | null;
  categoryConfig: MediaGalleryCategoryConfig;
  disabled?: boolean;
  idPrefix: string;
};

export function useMediaGalleryForm(defaultValues: MediaGalleryFormValues) {
  return useForm<MediaGalleryFormValues>({
    resolver: zodResolver(mediaGalleryFormSchema),
    defaultValues,
  });
}

function CategoryAssignmentControls({
  assignment,
  categoryConfig,
  disabled,
  idPrefix,
  onChange,
  errorMessage,
}: {
  assignment: AccountMediaLibraryCategoryAssignmentWrite;
  categoryConfig: MediaGalleryCategoryConfig;
  disabled: boolean;
  idPrefix: string;
  onChange: (next: AccountMediaLibraryCategoryAssignmentWrite) => void;
  errorMessage?: string | undefined;
}) {
  const isClub = categoryConfig.type === "club-age";
  const selectedOptionIds = categoryAssignmentToOptionIds(assignment, categoryConfig.options);
  const allSelected = isAllScopeAssignment(assignment);
  const labelId = `${idPrefix}-category-label`;
  const toggleValue = allSelected ? [] : selectedOptionIds;

  const handleToggle = (optionId: string) => {
    const option = categoryConfig.options.find((entry) => entry.id === optionId);
    if (!option?.selectable) return;
    const next = isClub
      ? toggleClubCategoryOption(assignment, optionId, categoryConfig)
      : toggleAssociationCategoryOption(assignment, optionId, categoryConfig);
    onChange(next);
  };

  return (
    <div className="grid gap-2">
      <Label id={labelId} className="sr-only">
        {categoryConfig.categoryLabel}
      </Label>
      <ToggleGroup
        type="multiple"
        variant="outline"
        spacing={2}
        value={toggleValue}
        disabled={disabled || categoryConfig.isLoading}
        aria-labelledby={labelId}
        aria-invalid={Boolean(errorMessage)}
        className="flex w-full flex-wrap justify-start gap-y-2"
        onValueChange={(nextValues) => {
          if (isClub) return;
          const added = nextValues.find((value) => !toggleValue.includes(value));
          const removed = toggleValue.find((value) => !nextValues.includes(value));
          const toggled = added ?? removed;
          if (toggled) handleToggle(toggled);
        }}
      >
        <ToggleGroupItem
          value="__all__"
          title={categoryConfig.allLabel}
          className={mediaGalleryPillToggleClassName}
          data-state={allSelected ? "on" : "off"}
          disabled={disabled || categoryConfig.isLoading}
          onClick={() => onChange(selectAllCategoryScope(categoryConfig))}
        >
          {categoryConfig.allLabel}
        </ToggleGroupItem>
        {categoryConfig.options.map((option) => {
          const selected = selectedOptionIds.includes(option.id);
          const itemClassName = cn(
            mediaGalleryPillToggleClassName,
            !option.selectable && "opacity-60 line-through",
          );
          return (
            <ToggleGroupItem
              key={option.id}
              value={option.id}
              title={option.label}
              className={itemClassName}
              data-state={selected ? "on" : "off"}
              disabled={disabled || categoryConfig.isLoading || !option.selectable}
              onClick={() => handleToggle(option.id)}
            >
              {option.label}
            </ToggleGroupItem>
          );
        })}
      </ToggleGroup>
      {categoryConfig.isLoading ? (
        <TypographyHelperText>
          Loading {categoryConfig.categoryLabel.toLowerCase()} options…
        </TypographyHelperText>
      ) : null}
      {categoryConfig.isError ? (
        <TypographyHelperText className="text-destructive">
          Could not load {categoryConfig.categoryLabel.toLowerCase()} options. Please try again.
        </TypographyHelperText>
      ) : null}
      {errorMessage ? (
        <TypographyHelperText className="text-destructive">{errorMessage}</TypographyHelperText>
      ) : null}
    </div>
  );
}

export function MediaGalleryItemFormFields({
  form,
  previewUrl,
  accountSport,
  categoryConfig,
  disabled = false,
  idPrefix,
}: MediaGalleryItemFormFieldsProps) {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const assetsQuery = useAssetsListForSelection({
    sport: accountSport,
    catalogueMode: "media-library",
  });
  const assetTypes = watch("assetTypes");
  const categoryAssignment = watch("categoryAssignment");
  const assetTypeOptions = useMemo(
    () => buildMediaLibraryAssetTypeOptions(assetsQuery.data?.data, assetTypes ?? []),
    [assetsQuery.data?.data, assetTypes],
  );

  const isActive = watch("isActive");
  const useFocalPoint = watch("useFocalPoint");
  const markerTop = watch("markerTop");
  const markerLeft = watch("markerLeft");

  useEffect(() => {
    if (!useFocalPoint) return;
    if (!previewUrl) {
      setValue("useFocalPoint", false);
    }
  }, [previewUrl, setValue, useFocalPoint]);

  const assetTypeControlDisabled = disabled || assetsQuery.isPending || assetsQuery.isError;
  const assetTypesLabelId = `${idPrefix}-asset-types-label`;

  return (
    <div className="grid gap-5">
      <MediaGalleryFormSection
        title={categoryConfig.categoryLabel}
        description={`Choose which ${categoryConfig.categoryLabel.toLowerCase()} this background belongs to.`}
      >
        <CategoryAssignmentControls
          assignment={categoryAssignment}
          categoryConfig={categoryConfig}
          disabled={disabled}
          idPrefix={idPrefix}
          {...(errors.categoryAssignment?.message
            ? { errorMessage: errors.categoryAssignment.message }
            : {})}
          onChange={(next) =>
            setValue("categoryAssignment", next, { shouldValidate: true, shouldDirty: true })
          }
        />
      </MediaGalleryFormSection>

      <MediaGalleryFormSection
        title="Asset types"
        description="Select one or more asset types. ALL applies everywhere and clears other selections."
      >
        <div className="grid gap-2">
          <Label id={assetTypesLabelId} className="sr-only">
            Asset types
          </Label>
          <ToggleGroup
            type="multiple"
            variant="outline"
            spacing={2}
            value={assetTypes}
            disabled={assetTypeControlDisabled}
            aria-labelledby={assetTypesLabelId}
            aria-invalid={Boolean(errors.assetTypes)}
            className="flex w-full flex-wrap justify-start gap-y-2"
            onValueChange={(next) => {
              const current = assetTypes ?? [];
              const added = next.find((value) => !current.includes(value));
              const removed = current.find((value) => !next.includes(value));
              const toggled = added ?? removed;
              if (!toggled) return;
              setValue("assetTypes", toggleAssetTypeSelection(current, toggled), {
                shouldValidate: true,
                shouldDirty: true,
              });
            }}
          >
            {assetTypeOptions.map((option) => (
              <ToggleGroupItem
                key={option}
                value={option}
                title={option}
                className={mediaGalleryPillToggleClassName}
              >
                {option}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          {assetsQuery.isPending ? (
            <TypographyHelperText>Loading asset types…</TypographyHelperText>
          ) : null}
          {assetsQuery.isError ? (
            <TypographyHelperText className="text-destructive">
              Could not load asset types. Please try again.
            </TypographyHelperText>
          ) : null}
          {errors.assetTypes?.message ? (
            <TypographyHelperText className="text-destructive">
              {errors.assetTypes.message}
            </TypographyHelperText>
          ) : null}
        </div>
      </MediaGalleryFormSection>

      <section className="border-border grid gap-4 rounded-xl border p-4 sm:p-5">
        <div className="grid gap-1.5">
          <Label htmlFor={`${idPrefix}-title`}>Title</Label>
          <Input
            id={`${idPrefix}-title`}
            disabled={disabled}
            {...register("title")}
            aria-invalid={Boolean(errors.title)}
          />
          {errors.title?.message ? (
            <TypographyHelperText className="text-destructive">
              {errors.title.message}
            </TypographyHelperText>
          ) : null}
        </div>

        {SHOW_MEDIA_LIBRARY_TAGS_UI ? (
          <div className="grid gap-1.5">
            <Label htmlFor={`${idPrefix}-tags`}>Tags</Label>
            <Input
              id={`${idPrefix}-tags`}
              disabled={disabled}
              placeholder="clubhouse, seniors"
              {...register("tagsInput")}
            />
            <TypographyHelperText>Comma-separated. Up to 20 tags.</TypographyHelperText>
            {errors.tagsInput?.message ? (
              <TypographyHelperText className="text-destructive">
                {errors.tagsInput.message}
              </TypographyHelperText>
            ) : null}
          </div>
        ) : null}

        <div className="grid gap-1.5">
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor={`${idPrefix}-active`}>Available for new assets</Label>
            <Switch
              id={`${idPrefix}-active`}
              checked={isActive}
              disabled={disabled}
              onCheckedChange={(next) => setValue("isActive", Boolean(next), { shouldDirty: true })}
            />
          </div>
          <TypographyHelperText>
            When off, the image stays in your library but won&apos;t be selected for new assets.
          </TypographyHelperText>
        </div>
      </section>

      {SHOW_MEDIA_LIBRARY_FOCAL_POINT_UI ? (
        <MediaGalleryFormSection
          title="Focal point"
          description="Optional focus area for cropping in generated assets."
        >
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor={`${idPrefix}-focal`}>Use focal point</Label>
            <Switch
              id={`${idPrefix}-focal`}
              checked={useFocalPoint}
              disabled={disabled || !previewUrl}
              onCheckedChange={(next) =>
                setValue("useFocalPoint", Boolean(next), { shouldDirty: true })
              }
            />
          </div>

          {useFocalPoint && previewUrl ? (
            <MediaGalleryFocalPoint
              imageUrl={previewUrl}
              top={markerTop}
              left={markerLeft}
              disabled={disabled}
              onChange={({ top, left }) => {
                setValue("markerTop", top, { shouldValidate: true, shouldDirty: true });
                setValue("markerLeft", left, { shouldValidate: true, shouldDirty: true });
              }}
            />
          ) : null}
        </MediaGalleryFormSection>
      ) : null}
    </div>
  );
}
