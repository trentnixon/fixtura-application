import { SPONSOR_SELECT_OPTION_LABEL_NO_LOGO_TEXT } from "./_constants/sponsor-select-option-label";
import { getSponsorSelectOptionLogoAlt } from "./_utils/sponsor-select-option-label";

import type { SponsorSelectOptionLabelProps } from "./_types/sponsor-select-option-label";

/**
 * Compact logo + name for Radix Select items (ItemText shows this in the trigger and list).
 */
export function SponsorSelectOptionLabel({
  name,
  logoUrl,
  logoAlt,
}: SponsorSelectOptionLabelProps) {
  return (
    <span className="inline-flex max-w-full min-w-0 items-center gap-2">
      <span className="border-border/60 flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-white">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={getSponsorSelectOptionLogoAlt(name, logoAlt)}
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          <span className="text-muted-foreground text-[9px] leading-none font-medium uppercase">
            {SPONSOR_SELECT_OPTION_LABEL_NO_LOGO_TEXT}
          </span>
        )}
      </span>
      <span className="truncate font-medium">{name}</span>
    </span>
  );
}
