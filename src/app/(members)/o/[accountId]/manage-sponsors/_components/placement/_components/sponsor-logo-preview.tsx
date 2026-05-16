import { cn } from "@/lib/utils";

import type { ManageSponsorsWorkspaceSponsor } from "../../../_types/manage-sponsors";

export function SponsorLogoPreview({
  sponsor,
  className,
  imageClassName,
}: {
  sponsor: ManageSponsorsWorkspaceSponsor | null;
  className?: string;
  imageClassName?: string;
}) {
  const src = sponsor?.logoUrl;

  return (
    <div
      className={cn(
        "flex min-h-0 w-full min-w-0 flex-1 items-center justify-center overflow-hidden rounded-xl",
        !src && "border border-dashed border-white/35 bg-white/15",
        className,
      )}
    >
      {src ? (
        <img
          src={src}
          alt=""
          className={cn("size-full max-h-full max-w-full object-contain p-3", imageClassName)}
        />
      ) : null}
    </div>
  );
}
