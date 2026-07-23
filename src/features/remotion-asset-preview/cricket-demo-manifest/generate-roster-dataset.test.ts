import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import {
  ROSTER_FIXTURE_PLANS,
  ROSTER_GRADE_NAME,
  ROSTER_POOL_ID,
  ROSTER_SQUADS,
  encodeRosterPlayerName,
  generateRosterRows,
  PRESERVED_ROSTER_FRAMES,
  PRESERVED_ROSTER_TIMINGS,
} from "./generate-roster-dataset";
import { loadCricketHistoricalDemoManifest } from "./index";

import type { buildSanitisedRosterDataset } from "./generate-roster-dataset";

const FILE_PATH = path.join(process.cwd(), "public/dummyAssetData/Cricket/Cricket_Roster.json");
const FLAGS_DIR = path.join(process.cwd(), "public/dummyAssetData/flags");

describe("generate-roster-dataset", () => {
  it("builds 11 fixture cards with 11-player XIs and correct roster side", () => {
    expect(encodeRosterPlayerName("Aaron Finch", "c")).toBe("Aaron Finch\nc");

    const manifest = loadCricketHistoricalDemoManifest();
    const pool = manifest.playerPools.find((item) => item.id === ROSTER_POOL_ID);
    expect(pool).toBeTruthy();

    const rows = generateRosterRows(manifest);
    expect(rows).toHaveLength(11);
    expect(ROSTER_FIXTURE_PLANS).toHaveLength(11);

    for (let i = 0; i < rows.length; i += 1) {
      const row = rows[i]!;
      const plan = ROSTER_FIXTURE_PLANS[i]!;
      expect(row.teamRoster).toHaveLength(11);
      expect(row.teamRoster).toEqual([...ROSTER_SQUADS[plan.rosterNationId]!]);
      expect(row.teamRoster.some((name) => name.includes("\nc"))).toBe(true);
      expect(row.isHomeTeam).toBe(plan.isHomeTeam);
      expect(row.gradeName).toBe(ROSTER_GRADE_NAME);
      expect(row.type).toBe("T20");
      expect(row.sponsors).toEqual([]);
      expect(typeof row.teamHomeLogo).toBe("string");
      expect(typeof row.teamAwayLogo).toBe("string");
      expect(row.teamHomeLogo.startsWith("/dummyAssetData/flags/")).toBe(true);
      expect(row.teamAwayLogo.startsWith("/dummyAssetData/flags/")).toBe(true);
      expect(row.teamRoster).not.toContain("No players allocated to line-up");

      const rosterSideName = plan.isHomeTeam ? row.teamHome : row.teamAway;
      const rosterNation = manifest.nations.find((nation) => nation.id === plan.rosterNationId);
      expect(rosterSideName).toBe(rosterNation?.displayName);
    }

    // Pool anchors appear somewhere across the generated XIs.
    const allNames = rows.flatMap((row) => row.teamRoster.map((name) => name.split("\n")[0]!));
    for (const anchor of ["Rashid Khan", "Aaron Finch", "Virat Kohli", "Babar Azam"]) {
      expect(allNames).toContain(anchor);
    }
  });
});

describe("sanitised Cricket_Roster.json", () => {
  it("preserves contract and removes local/production identities", () => {
    const raw = readFileSync(FILE_PATH, "utf8");
    const dataset = JSON.parse(raw) as ReturnType<typeof buildSanitisedRosterDataset>;

    expect(dataset.data).toHaveLength(11);
    expect(dataset.frames).toEqual([...PRESERVED_ROSTER_FRAMES]);
    expect(dataset.timings).toEqual(PRESERVED_ROSTER_TIMINGS);
    expect(dataset.account.accountId).toBe(0);
    expect(typeof dataset.asset.assetsLinkID).toBe("string");

    for (const row of dataset.data) {
      const homeFlag = path.join(FLAGS_DIR, path.basename(row.teamHomeLogo));
      const awayFlag = path.join(FLAGS_DIR, path.basename(row.teamAwayLogo));
      expect(existsSync(homeFlag), `missing ${homeFlag}`).toBe(true);
      expect(existsSync(awayFlag), `missing ${awayFlag}`).toBe(true);
      expect(row.teamRoster).toHaveLength(11);
    }

    expect(raw).not.toMatch(
      /Western Suburbs|WSCC|FMPCC|Harlequins|Kreative|Canacord|fixtura\.s3|cloudinary/i,
    );
    expect(raw).not.toContain('"accountId": 470');
    expect(raw).not.toContain("Demo Recreation");
    expect(raw).not.toContain("No players allocated to line-up");
  });
});
