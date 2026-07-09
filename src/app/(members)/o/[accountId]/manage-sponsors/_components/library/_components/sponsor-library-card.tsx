"use client";

import { TypographyCardDescription } from "@/components/typography";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { SponsorLibraryCardPreview } from "./sponsor-library-card-preview";
import { getSponsorLibraryStatusBadges } from "../_utils/sponsor-library-card-display";

import type { SponsorLibraryCardProps } from "../_types/sponsor-library";

export function SponsorLibraryCard({
  sponsor,
  disabled = false,
  onEditSponsor,
}: SponsorLibraryCardProps) {
  const statusBadges = getSponsorLibraryStatusBadges(sponsor);

  function openEditor() {
    if (!disabled) onEditSponsor?.(sponsor.id);
  }

  return (
    <li className="flex h-full min-h-0">
      <Card
        className={cn(
          "ring-border h-full min-h-0 w-full min-w-0 gap-0 overflow-hidden py-0 shadow-xs ring-1 transition-all",
          !disabled &&
            "hover:border-primary/40 focus-within:ring-primary/30 hover:-translate-y-0.5 hover:shadow-md",
          disabled && "pointer-events-none opacity-70",
        )}
      >
        <button
          type="button"
          disabled={disabled}
          onClick={openEditor}
          className="focus-visible:ring-ring flex min-h-0 w-full flex-1 flex-col text-left outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        >
          <SponsorLibraryCardPreview sponsor={sponsor} className="bg-white" />
          <CardContent className="flex min-h-0 flex-1 flex-col gap-2 px-3 pt-3 pb-0">
            <div className="min-w-0 space-y-1">
              <p className="text-foreground line-clamp-2 text-xs leading-snug font-semibold">
                {sponsor.name}
              </p>
              {sponsor.tagline?.trim() ? (
                <TypographyCardDescription
                  as="div"
                  className="line-clamp-2 text-[11px] leading-snug sm:text-[11px] sm:leading-snug"
                >
                  {sponsor.tagline}
                </TypographyCardDescription>
              ) : null}
            </div>
            <div className="mb-3 flex flex-wrap gap-1.5">
              {statusBadges.map((badge) => (
                <Badge
                  key={badge.key}
                  variant={badge.variant}
                  className={cn("text-[10px] font-medium", badge.className)}
                >
                  {badge.label}
                </Badge>
              ))}
            </div>
          </CardContent>
        </button>

        <CardFooter className="bg-muted/20 border-border mt-auto border-t px-3 py-3">
          <Button
            type="button"
            variant="brandOutline"
            size="sm"
            disabled={disabled}
            className="w-full"
            onClick={(event) => {
              event.stopPropagation();
              openEditor();
            }}
          >
            Edit
          </Button>
        </CardFooter>
      </Card>
    </li>
  );
}
