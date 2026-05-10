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
        <CardTitle>Preview panel</CardTitle>
        <CardDescription>
          This is the Phase 1 preview shell for how the selected sponsor may appear in output
          contexts.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sponsor ? (
          <div className="grid gap-4">
            <div className="bg-muted flex min-h-40 items-center justify-center rounded-xl border">
              {sponsor.logoUrl ? (
                <img
                  src={sponsor.logoUrl}
                  alt={sponsor.logoAlt ?? sponsor.name}
                  className="max-h-24 max-w-[12rem] object-contain"
                />
              ) : (
                <span className="text-muted-foreground text-sm">Logo preview placeholder</span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge>{sponsor.placementLabel}</Badge>
              <Badge variant="outline">{sponsor.usageLabel}</Badge>
              {sponsor.isActive ? (
                <Badge variant="secondary">Active</Badge>
              ) : (
                <Badge variant="outline">Inactive</Badge>
              )}
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
