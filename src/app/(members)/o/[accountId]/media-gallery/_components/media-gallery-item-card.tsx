import type { AccountMediaLibraryItem } from "@/types/api/account";
import type { ElementType } from "react";

type MediaGalleryItemCardProps = {
  item: AccountMediaLibraryItem;
  /** Root element for grid (`div`) vs featured (`article`). */
  as?: ElementType;
};

export function MediaGalleryItemCard({ item, as: Tag = "div" }: MediaGalleryItemCardProps) {
  return (
    <Tag className="border-border bg-card text-card-foreground overflow-hidden rounded-lg border shadow-sm">
      <div className="bg-muted aspect-video w-full overflow-hidden">
        {item.image?.url ? (
          <img
            src={item.image.url}
            alt={item.image.alternativeText ?? item.title ?? "Gallery item"}
            className="size-full object-cover"
          />
        ) : (
          <div className="text-muted-foreground flex size-full items-center justify-center text-xs">
            No image
          </div>
        )}
      </div>
      <div className="grid gap-2 p-4 text-sm">
        <p className="leading-snug font-medium">{item.title ?? `Item ${item.id}`}</p>
        <dl className="text-muted-foreground grid gap-1 text-xs">
          {item.assetType ? (
            <div className="flex flex-wrap gap-x-2">
              <dt className="font-medium">Type</dt>
              <dd>{item.assetType}</dd>
            </div>
          ) : null}
          {item.ageGroup ? (
            <div className="flex flex-wrap gap-x-2">
              <dt className="font-medium">Age</dt>
              <dd>{item.ageGroup}</dd>
            </div>
          ) : null}
          {item.isActive !== null && item.isActive !== undefined ? (
            <div className="flex flex-wrap gap-x-2">
              <dt className="font-medium">Active</dt>
              <dd>{item.isActive ? "Yes" : "No"}</dd>
            </div>
          ) : null}
        </dl>
      </div>
    </Tag>
  );
}
