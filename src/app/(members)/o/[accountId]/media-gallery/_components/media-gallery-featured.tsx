import { ErrorState } from "@/components/ui/error-state";
import { AUTH_ERROR_MESSAGES } from "@/lib/auth/auth-errors";

import { MediaGalleryFeaturedSkeleton } from "./media-gallery-featured-skeleton";
import { MediaGalleryItemCard } from "./media-gallery-item-card";

import type { AccountMediaLibraryItem } from "@/types/api/account";

type MediaGalleryFeaturedProps = {
  isPending: boolean;
  isError: boolean;
  error: unknown;
  onRetry: () => void;
  featuredItem: AccountMediaLibraryItem | null;
};

export function MediaGalleryFeatured({
  isPending,
  isError,
  error,
  onRetry,
  featuredItem,
}: MediaGalleryFeaturedProps) {
  return (
    <section className="grid gap-3" aria-labelledby="media-gallery-featured-heading">
      <div>
        <h2 id="media-gallery-featured-heading" className="text-lg font-semibold">
          Featured
        </h2>
        <p className="text-muted-foreground text-sm">
          Loaded with the single-item endpoint for this account.
        </p>
      </div>
      {isPending ? <MediaGalleryFeaturedSkeleton /> : null}
      {isError ? (
        <ErrorState
          title="Could not load featured item"
          description={error instanceof Error ? error.message : AUTH_ERROR_MESSAGES.network}
          onRetry={onRetry}
        />
      ) : null}
      {featuredItem ? <MediaGalleryItemCard item={featuredItem} as="article" /> : null}
    </section>
  );
}
