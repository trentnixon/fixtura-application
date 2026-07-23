import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import {
  UPCOMING_FIXTURE_IDS_IN_ORDER,
  UPCOMING_GRADE_NAME,
  generateUpcomingRows,
  PRESERVED_UPCOMING_FRAMES,
  PRESERVED_UPCOMING_TIMINGS,
} from "./generate-upcoming-dataset";
import { loadCricketHistoricalDemoManifest } from "./index";

import type { buildSanitisedUpcomingDataset } from "./generate-upcoming-dataset";

const UPCOMING_PATH = path.join(
  process.cwd(),
  "public/dummyAssetData/Cricket/Cricket_upcoming.json",
);
const FLAGS_DIR = path.join(process.cwd(), "public/dummyAssetData/flags");

describe("generate-upcoming-dataset", () => {
  it("builds six 2019 World Cup archive fixtures in canonical order", () => {
    const manifest = loadCricketHistoricalDemoManifest();
    const rows = generateUpcomingRows(manifest);
    expect(rows).toHaveLength(6);
    expect(UPCOMING_FIXTURE_IDS_IN_ORDER).toHaveLength(6);

    expect(rows[0]?.teamHome).toBe("England");
    expect(rows[0]?.teamAway).toBe("South Africa");
    expect(rows[0]?.ground).toBe("The Oval");
    expect(rows[0]?.date).toBe("Thu, 30 May");

    expect(rows[1]?.teamHome).toBe("West Indies");
    expect(rows[1]?.teamAway).toBe("Pakistan");

    for (const row of rows) {
      expect(row.type).toBe("One Day");
      expect(row.gender).toBe("Men");
      expect(row.ageGroup).toBe("Senior");
      expect(row.gradeName).toBe(UPCOMING_GRADE_NAME);
      expect(row.round).toBe(UPCOMING_GRADE_NAME);
      expect(row.gradeName).not.toContain("Demo Recreation");
      expect(row.prompt).toContain(row.teamHome);
      expect(row.prompt).toContain(row.teamAway);
      expect(row.prompt).toContain(row.ground);
      expect(row.teamHomeLogo.url.startsWith("/dummyAssetData/flags/")).toBe(true);
      expect(row.teamAwayLogo.url.startsWith("/dummyAssetData/flags/")).toBe(true);
      expect(row.gameID).toMatch(/^[a-f0-9]{8}$/);
    }
  });
});

describe("sanitised Cricket_upcoming.json", () => {
  it("preserves contract and removes local/production identities", () => {
    const raw = readFileSync(UPCOMING_PATH, "utf8");
    const dataset = JSON.parse(raw) as ReturnType<typeof buildSanitisedUpcomingDataset>;

    expect(dataset.data).toHaveLength(6);
    expect(dataset.frames).toEqual([...PRESERVED_UPCOMING_FRAMES]);
    expect(dataset.timings).toEqual(PRESERVED_UPCOMING_TIMINGS);
    expect(dataset.account.accountId).toBe(0);
    expect(dataset.render.schedulerId).toBe(0);
    expect(dataset.render.renderId).toBe(0);

    for (const row of dataset.data) {
      for (const logo of [row.teamHomeLogo, row.teamAwayLogo]) {
        const flagFile = path.join(FLAGS_DIR, path.basename(logo.url));
        expect(existsSync(flagFile), `missing ${flagFile}`).toBe(true);
      }
    }

    expect(raw).not.toMatch(/Goulburn|MadBulls|SJCC|Marulan|fixtura\.s3|cricket-australia\/org/i);
    expect(raw).not.toContain('"accountId": 1097');
    expect(raw).not.toContain("Demo Recreation");
  });
});
