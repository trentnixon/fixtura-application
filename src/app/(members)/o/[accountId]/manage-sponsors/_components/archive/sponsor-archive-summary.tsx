import { Archive } from "lucide-react";

import { Badge } from "@/components/ui/badge";

import {
  MANAGE_SPONSORS_CONTAINER_HEADER_CLASS_NAME,
  ManageSponsorsContainerHeaderTitle,
} from "../shared/manage-sponsors-container-header-title";

export function SponsorArchiveSummary({ archivedSponsorCount }: { archivedSponsorCount: number }) {
  return (
    <div className="bg-card text-card-foreground ring-border overflow-hidden rounded-2xl border-none shadow-xl ring-1">
      <div className={MANAGE_SPONSORS_CONTAINER_HEADER_CLASS_NAME}>
        <ManageSponsorsContainerHeaderTitle
          icon={<Archive className="size-5" aria-hidden />}
          title="Archive summary"
          description="Restore sponsors to the pool or permanently delete archived records."
        />
      </div>
      <div className="flex flex-wrap items-start justify-between gap-3 p-5">
        <div className="min-w-0" />
        <Badge variant="secondary">
          {archivedSponsorCount} archived sponsor
          {archivedSponsorCount === 1 ? "" : "s"}
        </Badge>
      </div>
    </div>
  );
}
