"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { ManageSponsorsWorkspaceSponsor } from "../../_types/manage-sponsors";

function SponsorPreviewChip({ sponsor }: { sponsor: ManageSponsorsWorkspaceSponsor | null }) {
  if (!sponsor) {
    return (
      <div className="text-muted-foreground flex h-16 items-center rounded-xl border border-dashed px-4 text-sm">
        No sponsor assigned
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border px-3 py-3">
      <div className="bg-muted flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg">
        {sponsor.logoUrl ? (
          <img
            src={sponsor.logoUrl}
            alt={sponsor.logoAlt ?? sponsor.name}
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          <span className="text-muted-foreground text-[10px] font-medium uppercase">No logo</span>
        )}
      </div>
      <div className="min-w-0">
        <p className="truncate font-medium">{sponsor.name}</p>
        <p className="text-muted-foreground text-xs">{sponsor.placementLabel}</p>
      </div>
    </div>
  );
}

function buildEligibleSponsors(sponsors: ManageSponsorsWorkspaceSponsor[]) {
  return sponsors.filter((sponsor) => sponsor.isActive && sponsor.hasLogo);
}

export function SponsorPlacementPanel({
  sponsors,
  onSetPrimarySponsor,
  onClearPrimarySponsor,
  onAssignRank,
  onRemoveRank,
  onMoveRank,
}: {
  sponsors: ManageSponsorsWorkspaceSponsor[];
  onSetPrimarySponsor: (sponsorId: number | string) => void;
  onClearPrimarySponsor: () => void;
  onAssignRank: (sponsorId: number | string, rank: number) => boolean;
  onRemoveRank: (sponsorId: number | string) => void;
  onMoveRank: (sponsorId: number | string, direction: "up" | "down") => boolean;
}) {
  const [primarySelection, setPrimarySelection] = useState<string>("");
  const [rankSelection, setRankSelection] = useState<string>("");
  const [rankInput, setRankInput] = useState("");

  const eligibleSponsors = useMemo(() => buildEligibleSponsors(sponsors), [sponsors]);
  const currentPrimary = useMemo(() => sponsors.find((item) => item.isPrimary) ?? null, [sponsors]);
  const selectedPrimarySponsor = useMemo(
    () => eligibleSponsors.find((item) => String(item.id) === primarySelection) ?? null,
    [eligibleSponsors, primarySelection],
  );
  const selectedRankSponsor = useMemo(
    () => eligibleSponsors.find((item) => String(item.id) === rankSelection) ?? null,
    [eligibleSponsors, rankSelection],
  );
  const rankedSponsors = useMemo(
    () =>
      sponsors
        .filter((item) => item.rank != null)
        .sort((a, b) => (a.rank ?? Number.MAX_SAFE_INTEGER) - (b.rank ?? Number.MAX_SAFE_INTEGER)),
    [sponsors],
  );

  function handleAssignPrimary() {
    if (!selectedPrimarySponsor) {
      toast.error("Choose an eligible sponsor for the primary position.");
      return;
    }
    onSetPrimarySponsor(selectedPrimarySponsor.id);
    toast.success(`${selectedPrimarySponsor.name} is now the primary sponsor.`);
  }

  function handleAssignRank() {
    if (!selectedRankSponsor) {
      toast.error("Choose an eligible sponsor for the ranked position.");
      return;
    }

    const parsed = Number(rankInput);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 30) {
      toast.error("Enter a rank between 1 and 30.");
      return;
    }

    const didAssign = onAssignRank(selectedRankSponsor.id, parsed);
    if (!didAssign) {
      toast.error("That sponsor cannot be assigned to this rank.");
      return;
    }

    setRankInput("");
    toast.success(`Assigned ${selectedRankSponsor.name} to rank ${parsed}.`);
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Assign sponsors to asset positions</CardTitle>
        <CardDescription>
          This is the only place we assign sponsors to output positions. Choose the sponsor next to
          the position, then confirm the assignment.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 text-sm">
        <div className="grid gap-4 rounded-xl border p-4">
          <div className="grid gap-1">
            <p className="font-medium">Primary position 1</p>
            <p className="text-muted-foreground">
              Select the sponsor for the primary account-wide position.
            </p>
          </div>
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,14rem)] lg:items-start">
            <SponsorPreviewChip sponsor={currentPrimary} />
            <div className="grid gap-2">
              <Select value={primarySelection} onValueChange={setPrimarySelection}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select sponsor" />
                </SelectTrigger>
                <SelectContent>
                  {eligibleSponsors.map((sponsor) => (
                    <SelectItem key={sponsor.id} value={String(sponsor.id)}>
                      {sponsor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                disabled={!selectedPrimarySponsor}
                onClick={handleAssignPrimary}
              >
                Assign primary
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={!currentPrimary}
                onClick={onClearPrimarySponsor}
              >
                Clear primary
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-4 rounded-xl border p-4">
          <div className="grid gap-1">
            <p className="font-medium">Ranked positions</p>
            <p className="text-muted-foreground">
              Select a sponsor, choose a ranked slot, and assign it. Ranked positions are unique and
              support up to 30 sponsors.
            </p>
          </div>
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_8rem_9rem]">
            <Select value={rankSelection} onValueChange={setRankSelection}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select sponsor" />
              </SelectTrigger>
              <SelectContent>
                {eligibleSponsors.map((sponsor) => (
                  <SelectItem key={sponsor.id} value={String(sponsor.id)}>
                    {sponsor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              min={1}
              max={30}
              value={rankInput}
              onChange={(event) => setRankInput(event.target.value)}
              placeholder="Rank"
            />
            <Button type="button" disabled={!selectedRankSponsor} onClick={handleAssignRank}>
              Assign
            </Button>
          </div>
          {selectedRankSponsor ? <SponsorPreviewChip sponsor={selectedRankSponsor} /> : null}
          <div className="grid gap-2">
            <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Current ranked sponsors
            </p>
            {rankedSponsors.length > 0 ? (
              <ul className="grid gap-2">
                {rankedSponsors.map((item) => (
                  <li
                    key={item.id}
                    className="grid gap-3 rounded-xl border p-3 sm:grid-cols-[minmax(0,1fr)_auto]"
                  >
                    <div className="grid gap-2">
                      <SponsorPreviewChip sponsor={item} />
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                      <Badge variant="outline">Rank {item.rank}</Badge>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={(item.rank ?? 1) <= 1}
                        onClick={() => {
                          const moved = onMoveRank(item.id, "up");
                          if (!moved) toast.error("Rank cannot move any higher.");
                        }}
                      >
                        Move up
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={(item.rank ?? 30) >= 30}
                        onClick={() => {
                          const moved = onMoveRank(item.id, "down");
                          if (!moved) toast.error("Rank cannot move any lower.");
                        }}
                      >
                        Move down
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onRemoveRank(item.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-sm">No ranked sponsors assigned yet.</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
