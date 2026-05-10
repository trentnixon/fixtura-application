import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { formatSponsorDateLabel } from "../../_utils/sponsor-display";

import type { ManageSponsorsWorkspaceSponsor } from "../../_types/manage-sponsors";

export function SponsorEditorSheet({
  sponsor,
}: {
  sponsor: ManageSponsorsWorkspaceSponsor | null;
}) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Selected sponsor</CardTitle>
        <CardDescription>
          Phase 1 establishes the editor shell. Full editing and save workflows land in the next
          phases.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sponsor ? (
          <div className="grid gap-6">
            <section className="grid gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-brand text-xl font-semibold">{sponsor.name}</h2>
                {sponsor.isDraft ? <Badge variant="secondary">Draft sponsor</Badge> : null}
                {sponsor.isActive ? (
                  <Badge variant="secondary">Active</Badge>
                ) : (
                  <Badge variant="outline">Inactive</Badge>
                )}
                <Badge variant="outline">{sponsor.placementLabel}</Badge>
              </div>
              <div className="grid gap-2 text-sm">
                <p>
                  <span className="text-muted-foreground">Pool state:</span>{" "}
                  {sponsor.isDraft
                    ? "Draft sponsor created locally in the pool"
                    : "Published sponsor from the current account feed"}
                </p>
                <p>
                  <span className="text-muted-foreground">Tagline:</span>{" "}
                  {sponsor.tagline || "No tagline yet"}
                </p>
                <p>
                  <span className="text-muted-foreground">URL:</span> {sponsor.url || "No URL yet"}
                </p>
                <p>
                  <span className="text-muted-foreground">Dates:</span>{" "}
                  {formatSponsorDateLabel(sponsor.startDate)} -{" "}
                  {formatSponsorDateLabel(sponsor.endDate)}
                </p>
                <p className="leading-relaxed">
                  <span className="text-muted-foreground">Description:</span>{" "}
                  {sponsor.description || "No description yet"}
                </p>
              </div>
            </section>

            <section className="grid gap-3 rounded-xl border border-dashed p-4">
              <div>
                <p className="font-medium">Logo workspace</p>
                <p className="text-muted-foreground text-sm">
                  Phase 3 will plug the existing cropper into this card for sponsor logo uploads and
                  replacements.
                </p>
              </div>
              <div className="bg-muted flex min-h-32 items-center justify-center rounded-xl">
                {sponsor.logoUrl ? (
                  <img
                    src={sponsor.logoUrl}
                    alt={sponsor.logoAlt ?? sponsor.name}
                    className="max-h-20 max-w-[11rem] object-contain"
                  />
                ) : (
                  <span className="text-muted-foreground text-sm">No logo uploaded</span>
                )}
              </div>
            </section>
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">
            Select a sponsor from the pool to inspect it.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
