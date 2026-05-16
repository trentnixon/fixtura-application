import type { ManageSponsorsWorkspaceSponsor } from "../../../_types/manage-sponsors";

export function PrimarySponsorLogoPreview({
  sponsor,
}: {
  sponsor: ManageSponsorsWorkspaceSponsor;
}) {
  const src = sponsor.logoUrl;

  return (
    <div
      className="flex h-11 w-14 min-w-0 shrink-0 items-center justify-center overflow-hidden rounded bg-white/15"
      title={sponsor.name}
    >
      {src ? (
        <img src={src} alt="" className="size-full max-h-full max-w-full object-contain p-1" />
      ) : null}
    </div>
  );
}
