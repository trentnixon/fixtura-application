"use client";

import type { SponsorEditorCurrentLogoBannerProps } from "../../../_types/sponsor-editor";

export function SponsorEditorCurrentLogoBanner({
  sponsor,
  savedLogoUrl,
}: SponsorEditorCurrentLogoBannerProps) {
  return (
    <div className="bg-muted/35 flex flex-wrap items-center justify-between gap-3 rounded-lg border px-4 py-3">
      <div className="flex min-w-0 items-center gap-2">
        <span className="truncate text-sm font-medium">Current logo</span>
      </div>
      <img
        src={savedLogoUrl}
        alt={sponsor.logoAlt?.trim() || sponsor.name}
        className="h-auto max-h-14 w-auto max-w-24 shrink-0 object-contain"
      />
    </div>
  );
}
