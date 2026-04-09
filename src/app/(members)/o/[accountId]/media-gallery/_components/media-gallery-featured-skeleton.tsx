export function MediaGalleryFeaturedSkeleton() {
  return (
    <div className="border-border bg-card animate-pulse rounded-lg border shadow-sm">
      <div className="bg-muted aspect-video w-full rounded-t-lg" />
      <div className="space-y-2 p-4">
        <div className="bg-muted h-4 w-2/3 rounded" />
        <div className="bg-muted h-3 w-1/2 rounded" />
      </div>
    </div>
  );
}
