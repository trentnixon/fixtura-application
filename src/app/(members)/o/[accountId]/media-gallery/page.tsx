import { Suspense } from "react";

import { BrandedLoader } from "@/components/ui/branded-loader";
import { PageHeader } from "@/components/ui/container";

import { MediaGalleryContent } from "./media-gallery-content";

export default async function Page({ params }: { params: Promise<{ accountId: string }> }) {
  const { accountId } = await params;
  return (
    <section className="mx-auto grid max-w-[88rem] gap-6 px-4 pb-12 sm:px-6 lg:px-8">
      <PageHeader
        className="mb-2"
        title="Background images"
        description="Upload images to use as backgrounds in your assets. Set an age category and asset type to control where each image can appear."
      />
      <Suspense fallback={<BrandedLoader label="Loading background images" />}>
        <MediaGalleryContent accountId={accountId} />
      </Suspense>
    </section>
  );
}
