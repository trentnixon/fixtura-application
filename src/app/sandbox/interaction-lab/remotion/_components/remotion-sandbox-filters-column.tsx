"use client";

import {
  ImageOptionsAssetsPicker,
  type ImageOptionsAssetsPickerState,
} from "@/components/pickers/assets-list-for-selection";
import { TypographyMuted } from "@/components/typography";
import { PICKER_SANDBOX_ACCOUNT_SCOPE } from "@/lib/api/query/query-keys";

import { RemotionSandboxCategoryPickerBlock } from "./remotion-sandbox-category-picker-block";

type RemotionSandboxFiltersColumnProps = {
  isPending: boolean;
  isError: boolean;
  isEmpty: boolean;
  categoriesError: unknown;
  onCategoriesRetry: () => void;
  imageOptions: ImageOptionsAssetsPickerState;
};

export function RemotionSandboxFiltersColumn({
  isPending,
  isError,
  isEmpty,
  categoriesError,
  onCategoriesRetry,
  imageOptions,
}: RemotionSandboxFiltersColumnProps) {
  const { q } = imageOptions;

  return (
    <div className="bg-muted/30 flex w-full flex-col justify-between border-t border-l-0 p-6 md:p-8 lg:w-[min(100%,24rem)] lg:max-w-md lg:border-t-0 lg:border-l">
      <div className="space-y-4">
        <TypographyMuted className="text-xs font-semibold tracking-wide uppercase">
          Filters
        </TypographyMuted>

        <RemotionSandboxCategoryPickerBlock
          isPending={isPending}
          isError={isError}
          isEmpty={isEmpty}
          error={categoriesError}
          onRetry={onCategoriesRetry}
        />

        <div className="space-y-2">
          <TypographyMuted className="text-xs font-semibold tracking-wide uppercase">
            Asset / composition
          </TypographyMuted>
          <TypographyMuted className="text-xs leading-relaxed">
            Image Options from the CMS (
            <code className="font-mono text-[0.7rem]">CompositionID</code> must match a bundled
            cricket sandbox dataset for preview data to load).
          </TypographyMuted>
          {q.isPending ? (
            <p className="text-muted-foreground text-sm" role="status">
              Loading assets…
            </p>
          ) : q.isError ? (
            <TypographyMuted className="text-destructive text-sm">
              {q.error instanceof Error ? q.error.message : "Failed to load assets"}
            </TypographyMuted>
          ) : (
            <div className="pr-1">
              <ImageOptionsAssetsPicker accountId={PICKER_SANDBOX_ACCOUNT_SCOPE} compact isList />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
