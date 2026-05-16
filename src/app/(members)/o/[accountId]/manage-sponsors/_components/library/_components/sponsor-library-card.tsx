import { MediaCard } from "@/components/cards";
import { TypographyCardDescription, TypographyCardTitle } from "@/components/typography";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { SponsorLibraryCardProps } from "../_types/sponsor-library";

export function SponsorLibraryCard({
  sponsor,
  disabled = false,
  onEditSponsor,
}: SponsorLibraryCardProps) {
  return (
    <li className="flex h-full min-h-0">
      <div
        className={cn(
          "flex h-full min-h-0 w-full min-w-0 flex-col",
          disabled && "pointer-events-none opacity-70",
        )}
      >
        <MediaCard
          cardContentClassName="px-4"
          cardFooterClassName="px-4"
          mediaWrapperClassName="-mx-4"
          className={cn(
            "h-full min-h-0 flex-1 gap-3 pt-0 pb-4 shadow-sm",
            !disabled && "hover:border-primary/50 hover:bg-accent/20",
          )}
          media={
            <div className="flex aspect-video items-center justify-center bg-white px-0">
              {sponsor.logoUrl ? (
                <img
                  src={sponsor.logoUrl}
                  alt={sponsor.logoAlt ?? sponsor.name}
                  className="max-h-20 max-w-48 object-contain"
                />
              ) : (
                <span className="text-muted-foreground text-[10px] font-medium uppercase">
                  No logo
                </span>
              )}
            </div>
          }
          footer={
            <div className="flex w-full items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {sponsor.isDraft ? <Badge variant="secondary">Draft</Badge> : null}
                {sponsor.isPrimary ? <Badge>Primary</Badge> : null}
              </div>
              <Button
                type="button"
                variant="brandPrimary"
                size="sm"
                disabled={disabled}
                onClick={(event) => {
                  event.stopPropagation();
                  if (!disabled) onEditSponsor?.(sponsor.id);
                }}
              >
                Edit
              </Button>
            </div>
          }
        >
          <div className="flex min-h-0 flex-1 flex-col gap-2">
            <div className="min-w-0 space-y-1">
              <TypographyCardTitle as="div" className="line-clamp-2">
                {sponsor.name}
              </TypographyCardTitle>
              {sponsor.tagline?.trim() ? (
                <TypographyCardDescription as="div" className="line-clamp-2">
                  {sponsor.tagline}
                </TypographyCardDescription>
              ) : null}
            </div>
            <div className="text-muted-foreground grid gap-1 text-xs">
              <p>{sponsor.placementLabel}</p>
              {sponsor.usageLabel.trim().length > 0 ? <p>{sponsor.usageLabel}</p> : null}
            </div>
          </div>
        </MediaCard>
      </div>
    </li>
  );
}
