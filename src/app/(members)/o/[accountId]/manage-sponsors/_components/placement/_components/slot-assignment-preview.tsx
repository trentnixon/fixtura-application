import { cn } from "@/lib/utils";

import type { ManageSponsorsWorkspaceSponsor } from "../../../_types/manage-sponsors";

export function SlotAssignmentPreview({
  sponsor,
  size = "default",
}: {
  sponsor: ManageSponsorsWorkspaceSponsor | null;
  size?: "default" | "compact";
}) {
  const box = size === "compact" ? "size-10 rounded-md text-[10px]" : "size-12 rounded-lg text-xs";

  if (!sponsor) {
    return (
      <div
        className={cn(
          "text-muted-foreground border-border flex shrink-0 items-center justify-center border border-dashed bg-white font-medium",
          box,
        )}
        role="img"
        aria-label="No sponsor assigned"
      >
        -
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden border bg-white",
        box,
      )}
    >
      {sponsor.logoUrl ? (
        <img
          src={sponsor.logoUrl}
          alt={sponsor.logoAlt ?? sponsor.name}
          className="max-h-full max-w-full object-contain"
        />
      ) : (
        <span className="text-muted-foreground text-[9px] font-medium uppercase">No logo</span>
      )}
    </div>
  );
}
