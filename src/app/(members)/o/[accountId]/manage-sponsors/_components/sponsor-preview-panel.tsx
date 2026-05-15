import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import type { ManageSponsorsWorkspaceSponsor } from "../_types/manage-sponsors";

export function SponsorPreviewPanel({
  sponsor,
}: {
  sponsor: ManageSponsorsWorkspaceSponsor | null;
}) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Sponsor preview</CardTitle>
        <CardDescription>Review how this sponsor may appear in sponsor placements.</CardDescription>
      </CardHeader>
      <CardContent>
        {sponsor ? (
          <div className="grid gap-4">
            <div className="flex min-h-40 items-center justify-center rounded-xl border bg-white">
              {sponsor.logoUrl ? (
                <img
                  src={sponsor.logoUrl}
                  alt={sponsor.logoAlt ?? sponsor.name}
                  className="max-h-24 max-w-[12rem] object-contain"
                />
              ) : (
                <span className="text-muted-foreground text-sm">No logo uploaded</span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge>{sponsor.placementLabel}</Badge>
              {sponsor.usageLabel.trim().length > 0 ? (
                <Badge variant="outline">{sponsor.usageLabel}</Badge>
              ) : null}
              {!sponsor.isActive ? <Badge variant="outline">Archived</Badge> : null}
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">
            Select a sponsor from the pool to preview it.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
