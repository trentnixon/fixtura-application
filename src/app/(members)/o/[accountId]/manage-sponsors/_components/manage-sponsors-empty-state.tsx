import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function ManageSponsorsEmptyState() {
  return (
    <Card className="border-border border-dashed shadow-none">
      <CardHeader>
        <CardTitle>No sponsors in the pool yet</CardTitle>
        <CardDescription>
          This workspace is ready for the sponsor pool model, but there are no published sponsors on
          this account yet.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-muted-foreground text-sm leading-relaxed">
        Phase 1 sets up the structure for sponsor management, archive, placement, and targeting.
        Sponsor creation and editing flows land in later phases.
      </CardContent>
    </Card>
  );
}
