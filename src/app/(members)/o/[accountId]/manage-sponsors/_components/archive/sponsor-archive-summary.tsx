import { TypographyH4, TypographyMuted } from "@/components/typography";
import { Badge } from "@/components/ui/badge";

export function SponsorArchiveSummary({ archivedSponsorCount }: { archivedSponsorCount: number }) {
  return (
    <div className="bg-card text-card-foreground ring-border rounded-xl p-5 shadow-sm ring-1">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <TypographyH4 className="text-sm font-semibold">Archive summary</TypographyH4>
          <TypographyMuted className="text-xs">
            Restore sponsors to the pool or permanently delete archived records.
          </TypographyMuted>
        </div>
        <Badge variant="secondary">
          {archivedSponsorCount} archived sponsor
          {archivedSponsorCount === 1 ? "" : "s"}
        </Badge>
      </div>
    </div>
  );
}
