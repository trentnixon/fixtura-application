import { cn } from "@/lib/utils";

import type { ManageSponsorsWorkspaceSponsor } from "../../../_types/manage-sponsors";

export function SponsorPositionLogoGridCell({
  sponsor,
}: {
  sponsor: ManageSponsorsWorkspaceSponsor | null;
}) {
  const src = sponsor?.logoUrl;

  return (
    <div
      className={cn(
        "flex h-full min-h-0 w-full min-w-0 items-center justify-center overflow-hidden rounded-md",
        !src && "border border-dashed border-white/35 bg-white/15",
      )}
    >
      {src ? (
        <img src={src} alt="" className="size-full max-h-full max-w-full object-contain p-1" />
      ) : null}
    </div>
  );
}
