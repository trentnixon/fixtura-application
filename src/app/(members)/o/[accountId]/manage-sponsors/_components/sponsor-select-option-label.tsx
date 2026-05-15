type SponsorSelectOptionLabelProps = {
  name: string;
  logoUrl: string | null;
  logoAlt: string | null;
};

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
            alt={logoAlt ?? name}
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          <span className="text-muted-foreground text-[9px] leading-none font-medium uppercase">
            No logo
          </span>
        )}
      </span>
      <span className="truncate font-medium">{name}</span>
    </span>
  );
}
