import { ARCHIVED_SPONSOR_LOGO_EMPTY_LABEL } from "./_constants/archived-sponsor-logo";
import { getArchivedSponsorLogoAlt } from "./_utils/get-archived-sponsor-logo-alt";

import type { ArchivedSponsorLogoProps } from "./_types/archived-sponsor-logo";

export function ArchivedSponsorLogo({ sponsor }: ArchivedSponsorLogoProps) {
  return (
    <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-white">
      {sponsor.logoUrl ? (
        <img
          src={sponsor.logoUrl}
          alt={getArchivedSponsorLogoAlt(sponsor)}
          className="max-h-full max-w-full object-contain"
        />
      ) : (
        <span className="text-muted-foreground text-[10px] font-medium uppercase">
          {ARCHIVED_SPONSOR_LOGO_EMPTY_LABEL}
        </span>
      )}
    </div>
  );
}
