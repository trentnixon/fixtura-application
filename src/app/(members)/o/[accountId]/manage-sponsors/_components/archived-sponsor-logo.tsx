import type { ManageSponsorsWorkspaceSponsor } from "../_types/manage-sponsors";

export function ArchivedSponsorLogo({ sponsor }: { sponsor: ManageSponsorsWorkspaceSponsor }) {
  return (
    <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-white">
      {sponsor.logoUrl ? (
        <img
          src={sponsor.logoUrl}
          alt={sponsor.logoAlt ?? sponsor.name}
          className="max-h-full max-w-full object-contain"
        />
      ) : (
        <span className="text-muted-foreground text-[10px] font-medium uppercase">No logo</span>
      )}
    </div>
  );
}
