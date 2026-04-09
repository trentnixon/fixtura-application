import { MediaGalleryItemCard } from "./media-gallery-item-card";

import type { AccountMediaLibraryItem } from "@/types/api/account";

type MediaGalleryGridProps = {
  items: AccountMediaLibraryItem[];
};

export function MediaGalleryGrid({ items }: MediaGalleryGridProps) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <li key={item.id}>
          <MediaGalleryItemCard item={item} />
        </li>
      ))}
    </ul>
  );
}
