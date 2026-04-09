import { MediaGalleryContent } from "./media-gallery-content";

export default async function Page({ params }: { params: Promise<{ accountId: string }> }) {
  const { accountId } = await params;
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="font-brand text-2xl font-semibold capitalize">Media gallery</h1>
        <p className="text-muted-foreground mt-1">
          Published gallery items from the CMS for this account (read-only).
        </p>
      </div>
      <MediaGalleryContent accountId={accountId} />
    </div>
  );
}
