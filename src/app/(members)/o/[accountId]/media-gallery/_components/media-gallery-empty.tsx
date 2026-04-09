export function MediaGalleryEmpty() {
  return (
    <div
      className="border-border bg-card text-muted-foreground rounded-lg border p-8 text-center text-sm"
      role="status"
    >
      No published media items yet for this account.
    </div>
  );
}
