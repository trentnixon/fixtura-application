import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import type { ManageSponsorsWorkspaceSponsor } from "../../_types/manage-sponsors";

export function SponsorTargetingPanel({
  sponsor,
}: {
  sponsor: ManageSponsorsWorkspaceSponsor | null;
}) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Targeting</CardTitle>
        <CardDescription>
          Club accounts will target teams. Association accounts will target competitions or grades
          based on grouping mode.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 text-sm">
        <div className="grid gap-2 rounded-xl border border-dashed p-4">
          <p className="font-medium">Assignment mode</p>
          <p className="text-muted-foreground">
            Sponsors can remain in the pool without targeting. Placement is what makes a sponsor
            available for output use.
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">Global</Badge>
            <Badge variant="outline">Specific entities</Badge>
          </div>
        </div>
        <div className="grid gap-2 rounded-xl border border-dashed p-4">
          <p className="font-medium">Current shell state</p>
          <p className="text-muted-foreground">
            {sponsor
              ? `${sponsor.name} is ready for org-aware targeting once Phase 5 wiring lands.`
              : "Select a sponsor to prepare targeting controls."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
