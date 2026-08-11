"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

import { getSponsorInitials } from "../_utils/sponsor-library-card-display";

import type { ManageSponsorsWorkspaceSponsor } from "../../../_types/manage-sponsors";

export function SponsorLibraryCardPreview({
  sponsor,
  className,
}: {
  sponsor: ManageSponsorsWorkspaceSponsor;
  className?: string;
}) {
  const logoUrl = sponsor.logoUrl?.trim() || null;
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [logoUrl]);

  const showImage = Boolean(logoUrl) && !imageFailed;

  return (
    <div
      className={cn(
        "border-border bg-muted/40 flex h-28 w-full shrink-0 items-center justify-center overflow-hidden border-b",
        className,
      )}
    >
      {showImage ? (
        <img
          src={logoUrl!}
          alt={sponsor.logoAlt?.trim() || sponsor.name}
          className="max-h-full max-w-full object-contain p-3"
          loading="lazy"
          decoding="async"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <div className="bg-primary/10 text-primary flex size-14 items-center justify-center rounded-xl text-sm font-semibold tracking-wide">
          {getSponsorInitials(sponsor.name)}
        </div>
      )}
    </div>
  );
}
