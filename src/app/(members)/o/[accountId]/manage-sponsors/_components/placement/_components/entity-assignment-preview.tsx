import type { ManageSponsorsWorkspaceSponsor } from "../../../_types/manage-sponsors";

export function EntityAssignmentPreview({
  sponsor,
}: {
  sponsor: ManageSponsorsWorkspaceSponsor | null;
}) {
  if (!sponsor) {
    return (
      <div
        className="text-muted-foreground border-border flex size-12 shrink-0 items-center justify-center rounded-lg border border-dashed bg-white text-xs font-medium"
        role="img"
        aria-label="No sponsor assigned"
      >
        -
      </div>
    );
  }

  return (
    <div
      className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-white"
      title={sponsor.name}
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
