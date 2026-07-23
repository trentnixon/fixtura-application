import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import {
  assertLadderStandingsIdentity,
  buildFictionalStandingsForStage,
  generateLadderBlocks,
  playedFromParts,
  pointsFromParts,
  PRESERVED_LADDER_FRAMES,
  PRESERVED_LADDER_TIMINGS,
} from "./generate-ladder-dataset";
import { loadCricketHistoricalDemoManifest } from "./index";

import type { buildSanitisedLadderDataset } from "./generate-ladder-dataset";

const LADDER_PATH = path.join(process.cwd(), "public/dummyAssetData/Cricket/Cricket_Ladder.json");
const FLAGS_DIR = path.join(process.cwd(), "public/dummyAssetData/flags");

describe("generate-ladder-dataset", () => {
  it("keeps played and points identities for fictional rows", () => {
    const rows = buildFictionalStandingsForStage({
      seed: "fixtura-cricket-demo-v1",
      stageId: "test-stage",
      gradeName: "Test Stage",
      nations: [
        { id: "aus", displayName: "Australia", flagPath: "/dummyAssetData/flags/au.svg" },
        { id: "eng", displayName: "England", flagPath: "/dummyAssetData/flags/gb-eng.svg" },
        { id: "ind", displayName: "India", flagPath: "/dummyAssetData/flags/in.svg" },
        { id: "nz", displayName: "New Zealand", flagPath: "/dummyAssetData/flags/nz.svg" },
      ],
    });

    expect(rows).toHaveLength(4);
    for (const row of rows) {
      const w = Number(row.W);
      const l = Number(row.L);
      const tie = Number(row.TIE);
      const nr = Number(row["N/R"]);
      expect(Number(row.P)).toBe(playedFromParts(w, l, tie, nr));
      expect(Number(row.PTS)).toBe(pointsFromParts(w, tie, nr));
      expect(row.BYE).toBe("0");
      expect(row.teamHref).toBe("");
      expect(row.clubLogo.startsWith("/dummyAssetData/flags/")).toBe(true);
    }
    expect(new Set(rows.map((row) => row.position)).size).toBe(4);
  });

  it("builds eight manifest-backed ladder blocks with matching team counts", () => {
    const manifest = loadCricketHistoricalDemoManifest();
    const blocks = generateLadderBlocks(manifest);
    expect(blocks).toHaveLength(8);
    expect(() => assertLadderStandingsIdentity(blocks)).not.toThrow();

    const expectedCounts = [...manifest.stages]
      .sort((a, b) => a.ladderBlockIndex - b.ladderBlockIndex)
      .map((stage) => stage.participantNationIds.length);
    expect(blocks.map((block) => block.League.length)).toEqual(expectedCounts);

    for (const block of blocks) {
      expect(block.gradeName.length).toBeGreaterThan(0);
      expect(block.gradeName).not.toContain("Fictional Standings");
      expect(block.prompt.teams).toHaveLength(block.League.length);
      expect(block.ID).toBe(0);
    }
  });
});

describe("sanitised Cricket_Ladder.json", () => {
  it("preserves contract and removes local/production identities", async () => {
    const { readFileSync } = await import("node:fs");
    const raw = readFileSync(LADDER_PATH, "utf8");
    const dataset = JSON.parse(raw) as ReturnType<typeof buildSanitisedLadderDataset>;
    const manifest = loadCricketHistoricalDemoManifest();

    expect(dataset.data).toHaveLength(8);
    expect(dataset.frames).toEqual([...PRESERVED_LADDER_FRAMES]);
    expect(dataset.timings).toEqual(PRESERVED_LADDER_TIMINGS);
    expect(dataset.account.accountId).toBe(0);
    expect(dataset.render.schedulerId).toBe(0);
    expect(dataset.render.renderId).toBe(0);
    expect(dataset.videoMeta).toMatchObject({
      club: {
        name: "International Cricket Demo Preview",
        IsAccountClub: false,
        logo: { hasLogo: false, url: "" },
      },
    });

    const expectedCounts = [...manifest.stages]
      .sort((a, b) => a.ladderBlockIndex - b.ladderBlockIndex)
      .map((stage) => stage.participantNationIds.length);
    expect(dataset.data.map((block) => block.League.length)).toEqual(expectedCounts);

    for (const block of dataset.data) {
      for (const team of block.League) {
        const w = Number(team.W);
        const l = Number(team.L);
        const tie = Number(team.TIE);
        const nr = Number(team["N/R"]);
        expect(Number(team.P)).toBe(playedFromParts(w, l, tie, nr));
        expect(Number(team.PTS)).toBe(pointsFromParts(w, tie, nr));
        expect(team.clubLogo.startsWith("/dummyAssetData/flags/")).toBe(true);
        expect(team.playHQLogo).toBe(team.clubLogo);
        const flagFile = path.join(FLAGS_DIR, path.basename(team.clubLogo));
        expect(existsSync(flagFile), `missing ${flagFile}`).toBe(true);
      }
    }

    expect(raw).not.toMatch(/Queens|CGC|Runaway Bay|Goulburn|fixtura\.s3|cricket-australia\/org/i);
    expect(raw).not.toContain('"accountId": 430');
    expect(raw).not.toContain('"accountId":430');
  });
});
