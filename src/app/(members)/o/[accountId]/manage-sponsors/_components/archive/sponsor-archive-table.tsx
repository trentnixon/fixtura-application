import { ArchiveRestore, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { ArchivedSponsorLogo } from "./archived-sponsor-logo";

import type { ManageSponsorsWorkspaceSponsor } from "../../_types/manage-sponsors";

export function SponsorArchiveTable({
  sponsors,
  restoringSponsorId,
  isDeleting,
  onRestoreSponsor,
  onSelectDeleteTarget,
}: {
  sponsors: ManageSponsorsWorkspaceSponsor[];
  restoringSponsorId: ManageSponsorsWorkspaceSponsor["id"] | null;
  isDeleting: boolean;
  onRestoreSponsor: (sponsor: ManageSponsorsWorkspaceSponsor) => void;
  onSelectDeleteTarget: (sponsor: ManageSponsorsWorkspaceSponsor) => void;
}) {
  return (
    <div className="bg-background overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30">
            <TableHead>Sponsor</TableHead>
            <TableHead>Details</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sponsors.map((sponsor) => {
            const isRestoring = restoringSponsorId === sponsor.id;

            return (
              <TableRow key={sponsor.id}>
                <TableCell>
                  <div className="flex min-w-64 items-center gap-3">
                    <ArchivedSponsorLogo sponsor={sponsor} />
                    <div className="min-w-0">
                      <p className="truncate font-medium">{sponsor.name}</p>
                      <p className="text-muted-foreground mt-1 line-clamp-1 max-w-80 text-xs">
                        {sponsor.tagline ?? sponsor.description ?? "No sponsor description."}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-muted-foreground grid gap-1 text-xs">
                    <span>
                      {sponsor.allocationCount} placement
                      {sponsor.allocationCount === 1 ? "" : "s"}
                    </span>
                    <span>{sponsor.logoUrl ? "Logo attached" : "No logo"}</span>
                    {sponsor.url ? <span className="max-w-72 truncate">{sponsor.url}</span> : null}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">Archived</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="brandPrimaryOutline"
                      size="sm"
                      className="h-8"
                      disabled={isRestoring || isDeleting}
                      onClick={() => onRestoreSponsor(sponsor)}
                    >
                      <ArchiveRestore className="size-4" aria-hidden />
                      {isRestoring ? "Restoring" : "Restore"}
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="h-8"
                      disabled={isRestoring || isDeleting}
                      onClick={() => onSelectDeleteTarget(sponsor)}
                    >
                      <Trash2 className="size-4" aria-hidden />
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
