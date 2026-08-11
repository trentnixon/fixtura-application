"use client";

import { Eye } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

import { MediaGalleryThumbnail } from "./media-gallery-thumbnail";
import {
  formatCategoryAssignmentLabels,
  itemNeedsRecategorisation,
  type MediaGalleryCategoryConfig,
} from "../_utils/media-gallery-category";
import { SHOW_MEDIA_LIBRARY_TAGS_UI } from "../_utils/media-gallery-form";

import type { MediaGalleryView } from "../_utils/media-gallery-query-state";
import type { AccountMediaLibraryItem } from "@/types/api/account";

const CATEGORY_BADGE_CLASS_NAME = cn(
  "max-w-full truncate border-[var(--brand-secondary)]/35 bg-[var(--brand-secondary)]/10",
  "text-[var(--brand-secondary-700)] dark:border-[var(--brand-secondary)]/45 dark:bg-[var(--brand-secondary)]/15 dark:text-[var(--brand-secondary-200)]",
);

const ASSET_TYPE_BADGE_CLASS_NAME = cn(
  "max-w-full truncate border-[var(--brand-accent)]/40 bg-[var(--brand-accent)]/10",
  "text-[var(--brand-accent-700)] dark:border-[var(--brand-accent)]/45 dark:bg-[var(--brand-accent)]/15 dark:text-[var(--brand-accent-200)]",
);

const RECATEGORISATION_BADGE_CLASS_NAME = cn(
  "max-w-full truncate border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-200",
);

type MediaGalleryItemCardProps = {
  item: AccountMediaLibraryItem;
  view: MediaGalleryView;
  categoryConfig: MediaGalleryCategoryConfig;
  readOnly?: boolean;
  onEdit: () => void;
  onDelete: () => void;
};

export function MediaGalleryItemCard({
  item,
  view,
  categoryConfig,
  readOnly = false,
  onEdit,
  onDelete,
}: MediaGalleryItemCardProps) {
  const [viewOpen, setViewOpen] = useState(false);
  const showAssetTypeBadges = view === "category" || view === "pool";
  const showCategoryBadge = view === "asset" || view === "pool";
  const categoryLabels = formatCategoryAssignmentLabels(item, categoryConfig);
  const needsRecategorisation = itemNeedsRecategorisation(item);

  return (
    <>
      <Card className="h-full gap-0 overflow-hidden rounded-lg py-0 shadow-sm ring-1">
        <div className="relative">
          <MediaGalleryThumbnail src={item.image.url} alt={item.title} />
          <Button
            type="button"
            size="xs"
            variant="secondary"
            className="absolute top-2 left-2 z-10 shadow-sm"
            aria-label="View image"
            title="View image"
            onClick={() => setViewOpen(true)}
          >
            <Eye className="size-3.5" aria-hidden />
          </Button>
          <Badge
            className="absolute top-2 right-2 z-10 shadow-sm"
            variant={item.isActive ? "default" : "secondary"}
          >
            {item.isActive ? "Available" : "Unavailable"}
          </Badge>
        </div>

        <CardContent className="flex flex-1 flex-col gap-3 px-4 py-3 text-sm">
          {showAssetTypeBadges || showCategoryBadge || needsRecategorisation ? (
            <div className="flex flex-wrap gap-1.5">
              {needsRecategorisation ? (
                <Badge variant="outline" className={RECATEGORISATION_BADGE_CLASS_NAME}>
                  Needs recategorisation
                </Badge>
              ) : null}
              {showAssetTypeBadges
                ? [...new Set(item.assetTypes)].map((assetType) => (
                    <Badge
                      key={assetType}
                      variant="outline"
                      className={ASSET_TYPE_BADGE_CLASS_NAME}
                    >
                      {assetType}
                    </Badge>
                  ))
                : null}
              {showCategoryBadge && !needsRecategorisation
                ? categoryLabels.map((label) => (
                    <Badge key={label} variant="outline" className={CATEGORY_BADGE_CLASS_NAME}>
                      {label}
                    </Badge>
                  ))
                : null}
            </div>
          ) : null}
          {SHOW_MEDIA_LIBRARY_TAGS_UI && item.tags.length > 0 ? (
            <div className="text-muted-foreground flex flex-wrap gap-x-2 text-xs">
              <span className="font-medium">Tags</span>
              <span>{item.tags.join(", ")}</span>
            </div>
          ) : null}
          <p className="text-muted-foreground truncate text-xs" title={item.title}>
            {item.title}
          </p>
        </CardContent>

        {!readOnly ? (
          <CardFooter className="border-primary/10 bg-primary/5 mt-auto flex-wrap justify-center gap-2 border-t px-4 py-2.5 pt-2.5">
            <Button type="button" size="xs" variant="brandPrimaryOutline" onClick={onEdit}>
              Edit
            </Button>
            <Button type="button" size="xs" variant="destructive" onClick={onDelete}>
              Delete
            </Button>
          </CardFooter>
        ) : null}
      </Card>

      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto p-1 sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>View image</DialogTitle>
            <DialogDescription className="truncate">{item.title}</DialogDescription>
          </DialogHeader>
          <div className="bg-muted overflow-hidden rounded-lg">
            <img
              src={item.image.url}
              alt={item.title}
              className="mx-auto max-h-[70vh] w-auto max-w-full object-contain"
              decoding="async"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
