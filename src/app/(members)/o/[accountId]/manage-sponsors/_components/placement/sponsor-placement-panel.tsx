import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import type { ManageSponsorsWorkspaceSponsor } from "../../_types/manage-sponsors";

export function SponsorPlacementPanel({
  sponsor,
}: {
  sponsor: ManageSponsorsWorkspaceSponsor | null;
}) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Placement</CardTitle>
        <CardDescription>
          Placement is global for the account in v1. This Phase 1 card establishes the structure for
          primary and ranked sponsor controls.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 text-sm">
        <div className="grid gap-2 rounded-xl border border-dashed p-4">
          <p className="font-medium">Primary sponsor</p>
          <p className="text-muted-foreground">
            One sponsor can be primary, but the account may also have no primary sponsor.
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant={sponsor?.isPrimary ? "default" : "outline"}>
              {sponsor?.isPrimary ? `${sponsor.name} is primary` : "No primary selected in shell"}
            </Badge>
          </div>
        </div>
        <div className="grid gap-2 rounded-xl border border-dashed p-4">
          <p className="font-medium">Ranked sponsor slots</p>
          <p className="text-muted-foreground">
            Ranked end-screen positions are dynamic up to 30 slots. UI wiring lands in Phase 4.
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">
              {sponsor?.rank != null ? `Rank ${sponsor.rank}` : "Unassigned"}
            </Badge>
            <Badge variant="secondary">30 slot capacity</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
