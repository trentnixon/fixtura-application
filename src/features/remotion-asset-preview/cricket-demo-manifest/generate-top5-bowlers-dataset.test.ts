import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import {
  TOP5_BOWLERS_COMPETITION,
  TOP5_BOWLERS_GRADE,
  TOP5_BOWLERS_SPELLS,
  generateTop5BowlerRows,
  PRESERVED_TOP5_BOWLERS_FRAMES,
  PRESERVED_TOP5_BOWLERS_TIMINGS,
} from "./generate-top5-bowlers-dataset";
import { loadCricketHistoricalDemoManifest } from "./index";

import type { buildSanitisedTop5BowlersDataset } from "./generate-top5-bowlers-dataset";

const FILE_PATH = path.join(
  process.cwd(),
  "public/dummyAssetData/Cricket/Cricket_Top5Bowlers.json",
);
const FLAGS_DIR = path.join(process.cwd(), "public/dummyAssetData/flags");

describe("generate-top5-bowlers-dataset", () => {
  it("maps KnockOut 2000 bowlers to countries with string overs", () => {
    const manifest = loadCricketHistoricalDemoManifest();
    const rows = generateTop5BowlerRows(manifest);
    expect(rows).toHaveLength(5);
    expect(rows.map((row) => row.name)).toEqual(TOP5_BOWLERS_SPELLS.map((row) => row.player));

    for (let i = 0; i < rows.length; i += 1) {
      const row = rows[i]!;
      const expected = TOP5_BOWLERS_SPELLS[i]!;
      expect(row.wickets).toBe(expected.wickets);
      expect(row.runs).toBe(expected.runs);
      expect(row.overs).toBe(expected.overs);
      expect(typeof row.overs).toBe("string");
      expect(row.prompt).toContain("fictional demonstration performance");
      expect(row.assignSponsors.competition.name).toBe(TOP5_BOWLERS_COMPETITION);
      expect(row.assignSponsors.grade.name).toBe(TOP5_BOWLERS_GRADE);
      expect(row.playedFor).toBe(row.assignSponsors.Team.name);
      expect(row.teamLogo.url.startsWith("/dummyAssetData/flags/")).toBe(true);
    }
  });
});

describe("sanitised Cricket_Top5Bowlers.json", () => {
  it("preserves contract and removes local/production identities", () => {
    const raw = readFileSync(FILE_PATH, "utf8");
    const dataset = JSON.parse(raw) as ReturnType<typeof buildSanitisedTop5BowlersDataset>;

    expect(dataset.data).toHaveLength(5);
    expect(dataset.frames).toEqual([...PRESERVED_TOP5_BOWLERS_FRAMES]);
    expect(dataset.timings).toEqual(PRESERVED_TOP5_BOWLERS_TIMINGS);
    expect(dataset.account.accountId).toBe(0);
    expect(typeof dataset.asset.assetsLinkID).toBe("string");

    for (const row of dataset.data) {
      const flagFile = path.join(FLAGS_DIR, path.basename(row.teamLogo.url));
      expect(existsSync(flagFile), `missing ${flagFile}`).toBe(true);
      expect(typeof row.overs).toBe("string");
    }

    expect(raw).not.toMatch(
      /Mt Pritchard|Lindfield|Lane Cove|Sydney Shires|fixtura\.s3|Balmain|Epping/i,
    );
    expect(raw).not.toContain('"accountId": 439');
    expect(raw).not.toContain("Demo Recreation");
  });
});
