import { readFileSync } from "node:fs";
import path from "node:path";

import { REMOTION_SANDBOX_CRICKET_DATASET_PATHS } from "@/components/remotion/_constants/remotion-datasets";

import { cricketHistoricalDemoManifestSchema, type CricketHistoricalDemoManifest } from "./schema";

export const CRICKET_HISTORICAL_DEMO_MANIFEST_RELATIVE_PATH =
  "public/dummyAssetData/cricket-historical-demo-manifest.json";

const REQUIRED_FULL_MEMBER_IDS = [
  "afg",
  "aus",
  "ban",
  "eng",
  "ind",
  "ire",
  "nz",
  "pak",
  "sa",
  "sl",
  "wi",
  "zim",
] as const;

const REQUIRED_ASSOCIATE_IDS = ["ken", "ned", "uae", "sco", "nam"] as const;

const REQUIRED_TOURNAMENT_IDS = [
  "cwc-1996",
  "cwc-1999",
  "icc-knockout-2000",
  "cwc-2007",
  "cwc-2015",
  "ct-2017",
  "cwc-2019",
  "t20wc-2022",
] as const;

export function loadCricketHistoricalDemoManifest(
  cwd: string = process.cwd(),
): CricketHistoricalDemoManifest {
  const absolutePath = path.join(cwd, CRICKET_HISTORICAL_DEMO_MANIFEST_RELATIVE_PATH);
  const raw = JSON.parse(readFileSync(absolutePath, "utf8")) as unknown;
  return cricketHistoricalDemoManifestSchema.parse(raw);
}

export function assertManifestReferentialIntegrity(manifest: CricketHistoricalDemoManifest): void {
  const nationIds = new Set(manifest.nations.map((nation) => nation.id));
  const tournamentIds = new Set(manifest.tournaments.map((tournament) => tournament.id));
  const stageIds = new Set(manifest.stages.map((stage) => stage.id));
  const venueIds = new Set(manifest.venues.map((venue) => venue.id));
  const fixtureIds = new Set(manifest.fixtures.map((fixture) => fixture.id));
  const playerPoolIds = new Set(manifest.playerPools.map((pool) => pool.id));

  for (const id of REQUIRED_FULL_MEMBER_IDS) {
    if (!nationIds.has(id)) {
      throw new Error(`Missing required Full Member nation id: ${id}`);
    }
  }
  for (const id of REQUIRED_ASSOCIATE_IDS) {
    if (!nationIds.has(id)) {
      throw new Error(`Missing required Associate nation id: ${id}`);
    }
  }
  for (const id of REQUIRED_TOURNAMENT_IDS) {
    if (!tournamentIds.has(id)) {
      throw new Error(`Missing required tournament id: ${id}`);
    }
  }

  const westIndies = manifest.nations.find((nation) => nation.id === "wi");
  if (!westIndies || westIndies.isIsoCountry !== false || !westIndies.visualAssetException) {
    throw new Error("West Indies must be marked as a non-ISO visual-asset exception.");
  }

  for (const stage of manifest.stages) {
    if (!tournamentIds.has(stage.tournamentId)) {
      throw new Error(`Stage ${stage.id} references unknown tournament ${stage.tournamentId}`);
    }
    for (const nationId of stage.participantNationIds) {
      if (!nationIds.has(nationId)) {
        throw new Error(`Stage ${stage.id} references unknown nation ${nationId}`);
      }
    }
  }

  for (const fixture of manifest.fixtures) {
    if (!tournamentIds.has(fixture.tournamentId)) {
      throw new Error(
        `Fixture ${fixture.id} references unknown tournament ${fixture.tournamentId}`,
      );
    }
    if (!nationIds.has(fixture.homeNationId) || !nationIds.has(fixture.awayNationId)) {
      throw new Error(`Fixture ${fixture.id} references unknown nation ids`);
    }
    if (!venueIds.has(fixture.venueId)) {
      throw new Error(`Fixture ${fixture.id} references unknown venue ${fixture.venueId}`);
    }
  }

  for (const pool of manifest.playerPools) {
    if (!tournamentIds.has(pool.tournamentId)) {
      throw new Error(`Player pool ${pool.id} references unknown tournament ${pool.tournamentId}`);
    }
    for (const player of pool.players) {
      if (!nationIds.has(player.nationId)) {
        throw new Error(`Player ${player.name} references unknown nation ${player.nationId}`);
      }
    }
  }

  for (const binding of manifest.datasetBindings) {
    for (const tournamentId of binding.tournamentIds) {
      if (!tournamentIds.has(tournamentId)) {
        throw new Error(
          `Binding ${binding.compositionId} references unknown tournament ${tournamentId}`,
        );
      }
    }
    for (const stageId of binding.stageIds ?? []) {
      if (!stageIds.has(stageId)) {
        throw new Error(`Binding ${binding.compositionId} references unknown stage ${stageId}`);
      }
    }
    for (const fixtureId of binding.fixtureIds ?? []) {
      if (!fixtureIds.has(fixtureId)) {
        throw new Error(`Binding ${binding.compositionId} references unknown fixture ${fixtureId}`);
      }
    }
    for (const playerPoolId of binding.playerPoolIds ?? []) {
      if (!playerPoolIds.has(playerPoolId)) {
        throw new Error(
          `Binding ${binding.compositionId} references unknown player pool ${playerPoolId}`,
        );
      }
    }
    for (const venueId of binding.venueContextIds ?? []) {
      if (!venueIds.has(venueId)) {
        throw new Error(`Binding ${binding.compositionId} references unknown venue ${venueId}`);
      }
    }

    const mappedPath =
      REMOTION_SANDBOX_CRICKET_DATASET_PATHS[
        binding.compositionId as keyof typeof REMOTION_SANDBOX_CRICKET_DATASET_PATHS
      ];
    if (mappedPath !== binding.publicPath) {
      throw new Error(
        `Binding path mismatch for ${binding.compositionId}: expected ${mappedPath}, got ${binding.publicPath}`,
      );
    }
  }

  if (manifest.syntheticGeneration.isSynthetic !== true) {
    throw new Error("syntheticGeneration.isSynthetic must be true");
  }
  if (manifest.syntheticGeneration.kind !== "synthetic-rules") {
    throw new Error("syntheticGeneration.kind must be synthetic-rules");
  }
}

export type { CricketHistoricalDemoManifest } from "./schema";
