import { AlertTriangle } from "lucide-react";

import { MetricComparisonCard } from "@/components/cards";
import { Button } from "@/components/ui/button";
import { FeedbackCardInline } from "@/components/ui/feedback-card";

import { MediaGalleryItemCard } from "./media-gallery-item-card";
import {
  formatCategoryAssignmentLabels,
  itemBelongsToCategoryGroup,
  type MediaGalleryCategoryConfig,
} from "../_utils/media-gallery-category";
import { mediaGalleryGroupDomId } from "../_utils/media-gallery-coverage";
import { sortMediaGalleryItems } from "../_utils/media-gallery-filter-sort";
import {
  itemBelongsToAssetTypeGroup,
  MEDIA_LIBRARY_ASSET_TYPE_ALL,
} from "../_utils/media-gallery-form";

import type {
  CategoryGroupCoverage,
  AssetTypeGroupCoverage,
  MediaGalleryCoverage,
} from "../_utils/media-gallery-coverage";
import type { MediaGallerySort, MediaGalleryView } from "../_utils/media-gallery-query-state";
import type { AccountMediaLibraryAssetType, AccountMediaLibraryItem } from "@/types/api/account";

const GROUP_CARD_CLASS_NAME =
  "ring-border w-full min-w-0 rounded-2xl border-none shadow-none ring-1";

const ITEM_GRID_CLASS_NAME = "grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4";

type MediaGalleryGridProps = {
  items: AccountMediaLibraryItem[];
  view: MediaGalleryView;
  sort: MediaGallerySort;
  originalIndexById: ReadonlyMap<number, number>;
  assetTypeOptions: AccountMediaLibraryAssetType[];
  categoryConfig: MediaGalleryCategoryConfig;
  coverage: MediaGalleryCoverage;
  onEdit: (item: AccountMediaLibraryItem) => void;
  onDelete: (item: AccountMediaLibraryItem) => void;
  onAddBackground: () => void;
};

type AssignmentCount = {
  label: string;
  count: number;
};

type GridGroup = {
  name: string;
  items: AccountMediaLibraryItem[];
  needsAttention: boolean;
  showAddAction: boolean;
};

function buildCrossAssignmentCounts(
  groupItems: AccountMediaLibraryItem[],
  view: Exclude<MediaGalleryView, "pool">,
  categoryConfig: MediaGalleryCategoryConfig,
): AssignmentCount[] {
  const counts = new Map<string, number>();

  if (view === "category") {
    for (const item of groupItems) {
      const types =
        item.assetTypes.length > 0 ? [...new Set(item.assetTypes)] : [MEDIA_LIBRARY_ASSET_TYPE_ALL];
      for (const assetType of types) {
        counts.set(assetType, (counts.get(assetType) ?? 0) + 1);
      }
    }
  } else {
    for (const item of groupItems) {
      for (const label of formatCategoryAssignmentLabels(item, categoryConfig)) {
        counts.set(label, (counts.get(label) ?? 0) + 1);
      }
    }
  }

  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return a.label.localeCompare(b.label, undefined, { sensitivity: "base" });
    });
}

function buildCategoryGroups(
  items: AccountMediaLibraryItem[],
  coverage: MediaGalleryCoverage,
  categoryConfig: MediaGalleryCategoryConfig,
  sort: MediaGallerySort,
  originalIndexById: ReadonlyMap<number, number>,
): GridGroup[] {
  const coverageById = new Map(
    coverage.categoryGroups.map((group) => [group.groupId, group] as const),
  );

  return categoryConfig.options.map((option) => {
    const groupCoverage = coverageById.get(option.id) as CategoryGroupCoverage;
    const groupItems = sortMediaGalleryItems(
      items.filter((item) => itemBelongsToCategoryGroup(item, option, categoryConfig)),
      sort,
      originalIndexById,
    );
    return {
      name: option.label,
      items: groupItems,
      needsAttention: groupCoverage?.needsAttention ?? true,
      showAddAction: groupCoverage?.needsAttention ?? true,
    };
  });
}

function buildAssetTypeGroups(
  items: AccountMediaLibraryItem[],
  assetTypeOptions: AccountMediaLibraryAssetType[],
  coverage: MediaGalleryCoverage,
  sort: MediaGallerySort,
  originalIndexById: ReadonlyMap<number, number>,
): GridGroup[] {
  const coverageByName = new Map(
    coverage.assetTypeGroups.map((group) => [group.groupName, group] as const),
  );

  const universalItems = sortMediaGalleryItems(
    items.filter((item) =>
      itemBelongsToAssetTypeGroup(item.assetTypes, MEDIA_LIBRARY_ASSET_TYPE_ALL),
    ),
    sort,
    originalIndexById,
  );

  const universalGroup: GridGroup = {
    name: "All asset types",
    items: universalItems,
    needsAttention: coverage.universalActiveCount === 0,
    showAddAction: coverage.universalActiveCount === 0,
  };

  const specificGroups = assetTypeOptions
    .filter((name) => name !== MEDIA_LIBRARY_ASSET_TYPE_ALL)
    .map((name) => {
      const groupCoverage = coverageByName.get(name) as AssetTypeGroupCoverage;
      const groupItems = sortMediaGalleryItems(
        items.filter((item) => itemBelongsToAssetTypeGroup(item.assetTypes, name)),
        sort,
        originalIndexById,
      );
      return {
        name,
        items: groupItems,
        needsAttention: groupCoverage.needsAttention,
        showAddAction: groupCoverage.directActive === 0,
      };
    });

  return [universalGroup, ...specificGroups];
}

function MediaGalleryItemGrid({
  items,
  view,
  categoryConfig,
  onEdit,
  onDelete,
}: {
  items: AccountMediaLibraryItem[];
  view: MediaGalleryView;
  categoryConfig: MediaGalleryCategoryConfig;
  onEdit: (item: AccountMediaLibraryItem) => void;
  onDelete: (item: AccountMediaLibraryItem) => void;
}) {
  return (
    <ul className={ITEM_GRID_CLASS_NAME}>
      {items.map((item) => (
        <li key={item.id}>
          <MediaGalleryItemCard
            item={item}
            view={view}
            categoryConfig={categoryConfig}
            onEdit={() => onEdit(item)}
            onDelete={() => onDelete(item)}
          />
        </li>
      ))}
    </ul>
  );
}

export function MediaGalleryGrid({
  items,
  view,
  sort,
  originalIndexById,
  assetTypeOptions,
  categoryConfig,
  coverage,
  onEdit,
  onDelete,
  onAddBackground,
}: MediaGalleryGridProps) {
  if (view === "pool") {
    return (
      <MediaGalleryItemGrid
        items={items}
        view={view}
        categoryConfig={categoryConfig}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );
  }

  const groups =
    view === "category"
      ? buildCategoryGroups(items, coverage, categoryConfig, sort, originalIndexById)
      : buildAssetTypeGroups(items, assetTypeOptions, coverage, sort, originalIndexById);

  return (
    <div className="grid gap-5">
      {groups.map((group) => {
        const titleId = mediaGalleryGroupDomId(view, group.name);
        const crossCounts = buildCrossAssignmentCounts(group.items, view, categoryConfig);

        if (group.items.length === 0) {
          return (
            <FeedbackCardInline
              key={group.name}
              kind="info"
              title={group.name}
              description={
                view === "category"
                  ? `No backgrounds assigned to this ${categoryConfig.categoryLabel.toLowerCase()} yet.`
                  : "No backgrounds assigned to this asset type yet."
              }
              {...(group.showAddAction
                ? { actionLabel: "Add background", onAction: onAddBackground }
                : {})}
            />
          );
        }

        const hasFooter = crossCounts.length > 0 || group.showAddAction;

        return (
          <MetricComparisonCard
            key={group.name}
            layout="card"
            data-card="card.metric.comparison-card.body-prose"
            className={GROUP_CARD_CLASS_NAME}
            aria-labelledby={titleId}
            titleRowClassName="items-center"
            title={
              <div
                id={titleId}
                tabIndex={-1}
                className="focus-visible:ring-ring flex min-w-0 scroll-mt-24 items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              >
                {group.needsAttention ? (
                  <AlertTriangle className="size-4 shrink-0 text-amber-600" aria-hidden />
                ) : null}
                <span className="text-sm font-semibold">{group.name}</span>
              </div>
            }
            body={
              <MediaGalleryItemGrid
                items={group.items}
                view={view}
                categoryConfig={categoryConfig}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            }
            footer={
              hasFooter ? (
                <div className="grid w-full min-w-0 gap-2">
                  {crossCounts.length > 0 ? (
                    <ul className="text-muted-foreground flex flex-wrap gap-x-3 gap-y-1 text-xs">
                      {crossCounts.map((entry) => (
                        <li key={entry.label}>
                          <span className="text-foreground font-medium tabular-nums">
                            {entry.count}
                          </span>
                          <span> — {entry.label}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {group.showAddAction ? (
                    <div>
                      <Button type="button" size="sm" variant="outline" onClick={onAddBackground}>
                        Add background
                      </Button>
                    </div>
                  ) : null}
                </div>
              ) : undefined
            }
          />
        );
      })}
    </div>
  );
}
