"use client";

import * as React from "react";

import { TypographyH2, TypographyMuted } from "@/components/typography";
import { Section, Surface } from "@/components/ui/container";
import { Label } from "@/components/ui/label";
import {
  DependentSecondTrigger,
  SearchableCombobox,
  type SearchableComboboxOption,
} from "@/components/ui/searchable-combobox";

function noop(_value: string) {}

/** Static list for standalone onboarding-style association search (sandbox only). */
const ASSOCIATION_OPTIONS: SearchableComboboxOption[] = [
  { value: "assoc-nsw-cricket", label: "Cricket NSW — Community" },
  { value: "assoc-vic-football", label: "Football Victoria" },
  { value: "assoc-qld-netball", label: "Netball Queensland" },
  { value: "assoc-sa-basketball", label: "Basketball SA — Metro" },
  { value: "assoc-wa-hockey", label: "Hockey WA" },
  { value: "assoc-tas-afl", label: "AFL Tasmania — Regional" },
];

const SPORT_OPTIONS: SearchableComboboxOption[] = [
  { value: "cricket", label: "Cricket" },
  { value: "afl", label: "Australian football" },
  { value: "netball", label: "Netball" },
];

const CLUBS_BY_SPORT: Record<string, SearchableComboboxOption[]> = {
  cricket: [
    { value: "c-east-hills", label: "East Hills Cricket Club" },
    { value: "c-north-sydney", label: "North Sydney District CC" },
    { value: "c-parramatta", label: "Parramatta City Cricket Club" },
  ],
  afl: [
    { value: "a-williamstown", label: "Williamstown CYMS" },
    { value: "a-oakleigh", label: "Oakleigh Krushers" },
    { value: "a-st-kilda-city", label: "St Kilda City FC" },
  ],
  netball: [
    { value: "n-melbourne-uni", label: "Melbourne University NC" },
    { value: "n-geelong", label: "Geelong Cougars" },
    { value: "n-sandringham", label: "Sandringham Zebras" },
  ],
};

function StandaloneAssociationSection() {
  const [associationId, setAssociationId] = React.useState<string | null>(null);

  return (
    <Section spacing="none">
      <div className="mb-6">
        <TypographyH2 className="text-xl font-semibold">
          Onboarding — association search
        </TypographyH2>
        <TypographyMuted className="mt-1">
          Searchable combobox with static test data. Use for linking an account to a governing body
          or regional association.
        </TypographyMuted>
      </div>
      <Surface className="max-w-md space-y-3">
        <Label htmlFor="ks-assoc-combo">Regional association</Label>
        <SearchableCombobox
          id="ks-assoc-combo"
          options={ASSOCIATION_OPTIONS}
          value={associationId}
          onChange={setAssociationId}
          placeholder="Search associations…"
          emptyText="No association matches."
        />
        <TypographyMuted className="text-[10px] leading-relaxed">
          Selected value (debug): <span className="font-mono">{associationId ?? "—"}</span>
        </TypographyMuted>
      </Surface>
    </Section>
  );
}

function DependentSportClubSection() {
  const [sportId, setSportId] = React.useState<string | null>(null);
  const [clubId, setClubId] = React.useState<string | null>(null);
  const [secondPhase, setSecondPhase] = React.useState<"idle" | "loading" | "ready">("idle");
  const [clubOptions, setClubOptions] = React.useState<SearchableComboboxOption[]>([]);

  React.useEffect(() => {
    if (!sportId) {
      setClubId(null);
      setSecondPhase("idle");
      setClubOptions([]);
      return;
    }

    setClubId(null);
    setSecondPhase("loading");
    const handle = window.setTimeout(() => {
      setClubOptions(CLUBS_BY_SPORT[sportId] ?? []);
      setSecondPhase("ready");
    }, 850);

    return () => window.clearTimeout(handle);
  }, [sportId]);

  return (
    <Section spacing="none">
      <div className="mb-6">
        <TypographyH2 className="text-xl font-semibold">
          Onboarding — dependent club lookup
        </TypographyH2>
        <TypographyMuted className="mt-1">
          After choosing a sport, the club field waits, simulates a fetch, then offers options
          scoped to that sport (test data only).
        </TypographyMuted>
      </div>
      <Surface className="max-w-md space-y-6">
        <div className="space-y-3">
          <Label htmlFor="ks-sport-combo">Sport</Label>
          <SearchableCombobox
            id="ks-sport-combo"
            options={SPORT_OPTIONS}
            value={sportId}
            onChange={setSportId}
            placeholder="Select sport…"
            emptyText="No sport matches."
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="ks-club-combo">Club</Label>
          {secondPhase === "idle" && (
            <DependentSecondTrigger id="ks-club-combo" message="Select a sport first" />
          )}
          {secondPhase === "loading" && (
            <SearchableCombobox
              id="ks-club-combo"
              options={[]}
              value={null}
              onChange={noop}
              placeholder=""
              loading
              loadingMessage="Fetching clubs…"
            />
          )}
          {secondPhase === "ready" && (
            <SearchableCombobox
              id="ks-club-combo"
              options={clubOptions}
              value={clubId}
              onChange={setClubId}
              placeholder="Search clubs…"
              emptyText="No clubs for this sport."
            />
          )}
        </div>

        <TypographyMuted className="text-[10px] leading-relaxed">
          State: <span className="font-mono">{secondPhase}</span>
          {" · "}
          sport <span className="font-mono">{sportId ?? "—"}</span>
          {" · "}
          club <span className="font-mono">{clubId ?? "—"}</span>
        </TypographyMuted>
      </Surface>
    </Section>
  );
}

export function OnboardingAutocompleteSection() {
  return (
    <div className="space-y-24">
      <StandaloneAssociationSection />
      <DependentSportClubSection />
    </div>
  );
}
