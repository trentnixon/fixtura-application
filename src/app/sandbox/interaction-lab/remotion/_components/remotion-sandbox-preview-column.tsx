"use client";

import { RemotionVideoPreview } from "@/components/remotion";
import { TypographyH3, TypographyMuted } from "@/components/typography";

import { RemotionSandboxFallbackNote } from "./remotion-sandbox-fallback-note";

import type { FixturaDataset } from "@/vendor/fixtura-remotion-assets/preview";

type RemotionSandboxPreviewColumnProps = {
  /** When set, shows the fallback note for this category slug. */
  fallbackNoteSlug: string | null;
  template?: string;
  compositionId?: string;
  data: FixturaDataset | null;
  durationInFrames: number;
  loadError: string | null;
};

export function RemotionSandboxPreviewColumn({
  fallbackNoteSlug,
  template,
  compositionId,
  data,
  durationInFrames,
  loadError,
}: RemotionSandboxPreviewColumnProps) {
  return (
    <div className="flex min-w-0 flex-1 flex-col p-6 md:p-8">
      <TypographyH3 className="mb-2 text-2xl font-bold">Cricket sandbox sample</TypographyH3>
      <TypographyMuted className="mb-6">
        Preview composition from the vendored Fixtura Remotion bundle using the bundled sandbox
        dataset.
      </TypographyMuted>
      {fallbackNoteSlug !== null ? <RemotionSandboxFallbackNote slug={fallbackNoteSlug} /> : null}
      <div className="flex flex-col gap-8">
        <div className="flex justify-center">
          <RemotionVideoPreview
            className="max-w-none rounded-md border-0"
            {...(template !== undefined ? { template } : {})}
            {...(compositionId !== undefined ? { compositionId } : {})}
            data={data}
            durationInFrames={durationInFrames}
            loadError={loadError}
          />
        </div>
      </div>
    </div>
  );
}
