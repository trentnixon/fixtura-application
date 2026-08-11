import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import {
  TEAM_OF_THE_WEEK_PLANS,
  TEAM_OF_THE_WEEK_POOL_ID,
  generateTeamOfTheWeekRows,
  PRESERVED_TEAM_OF_THE_WEEK_FRAMES,
  PRESERVED_TEAM_OF_THE_WEEK_TIMINGS,
} from "./generate-team-of-the-week-dataset";
import { loadCricketHistoricalDemoManifest } from "./index";

import type { buildSanitisedTeamOfTheWeekDataset } from "./generate-team-of-the-week-dataset";

const FILE_PATH = path.join(
  process.cwd(),
  "public/dummyAssetData/Cricket/Cricket_TeamOfTheWeek.json",
);
const FLAGS_DIR = path.join(process.cwd(), "public/dummyAssetData/flags");

describe("generate-team-of-the-week-dataset", () => {
  it("builds the 12-player Demo XI with required role distribution", () => {
    const manifest = loadCricketHistoricalDemoManifest();
    const pool = manifest.playerPools.find((item) => item.id === TEAM_OF_THE_WEEK_POOL_ID);
    const rows = generateTeamOfTheWeekRows(manifest);

    expect(rows).toHaveLength(12);
    expect(rows.map((row) => row.player)).toEqual(pool!.players.map((player) => player.name));
    expect(rows.filter((row) => row.category === "Batter")).toHaveLength(5);
    expect(rows.filter((row) => row.category === "All-Rounder")).toHaveLength(2);
    expect(rows.filter((row) => row.category === "Bowler")).toHaveLength(4);
    expect(rows.filter((row) => row.category === "Twelfth Man")).toHaveLength(1);

    for (let i = 0; i < rows.length; i += 1) {
      const row = rows[i]!;
      const plan = TEAM_OF_THE_WEEK_PLANS[i]!;
      expect(row.rank).toBe(plan.rank);
      expect(row.categoryDetail.position).toBe(plan.position);
      expect(row.primaryTeam).toBe(row.club.name);
      expect(row.club.logo.url.startsWith("/dummyAssetData/flags/")).toBe(true);
      expect(row.prompt).toContain("fictional demonstration selection");
      expect(row.prompt).toContain(row.primaryTeam);

      if (row.category === "All-Rounder") {
        expect(row.batting).toBeTruthy();
        expect(row.bowling).toBeTruthy();
        expect(row.allRounder?.score).toBe(row.batting!.runs * row.bowling!.wickets);
      }
      if (row.batting) {
        expect(row.batting.team).toBe(row.primaryTeam);
        expect(row.batting.fours * 4 + row.batting.sixes * 6).toBeLessThanOrEqual(row.batting.runs);
      }
      if (row.bowling) {
        expect(row.bowling.team).toBe(row.primaryTeam);
        expect(row.bowling.wickets).toBeGreaterThanOrEqual(1);
        expect(row.bowling.wickets).toBeLessThanOrEqual(5);
        expect(row.bowling.overs).toBeLessThanOrEqual(4);
      }
    }

    const nations = new Set(TEAM_OF_THE_WEEK_PLANS.map((plan) => plan.nationId));
    expect(nations.size).toBe(12);
  });
});

describe("sanitised Cricket_TeamOfTheWeek.json", () => {
  it("preserves contract and removes local/production identities", () => {
    const raw = readFileSync(FILE_PATH, "utf8");
    const dataset = JSON.parse(raw) as ReturnType<typeof buildSanitisedTeamOfTheWeekDataset>;

    expect(dataset.data).toHaveLength(12);
    expect(dataset.frames).toEqual([...PRESERVED_TEAM_OF_THE_WEEK_FRAMES]);
    expect(dataset.timings).toEqual(PRESERVED_TEAM_OF_THE_WEEK_TIMINGS);
    expect(dataset.account.accountId).toBe(0);

    for (const row of dataset.data) {
      expect(existsSync(path.join(FLAGS_DIR, path.basename(row.club.logo.url)))).toBe(true);
    }

    expect(raw).not.toMatch(/Runaway Bay|joshua foenander|fixtura\.s3|thomas gossett/i);
    expect(raw).not.toContain('"accountId": 430');
    expect(raw).not.toContain("Demo Recreation");
  });
});
