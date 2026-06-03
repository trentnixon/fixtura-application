import { describe, expect, it } from "vitest";

import { buildSeasonGradeFixtureBuckets } from "./season-grade-view";

import type { SeasonHubFixtureListItem } from "@/types/api/season-hub";

function fixture(id: number, date: string | null): SeasonHubFixtureListItem {
  return {
    id,
    gameId: null,
    date,
    round: null,
    status: null,
    type: null,
    venue: {
      ground: null,
    },
    teams: {
      home: null,
      away: null,
    },
    grade: {
      id: 71338,
      name: null,
    },
    competition: {
      id: 18034,
      name: null,
    },
    association: {
      id: null,
      name: null,
    },
    links: {
      self: "",
      alias: "",
    },
  };
}

describe("buildSeasonGradeFixtureBuckets", () => {
  it("splits fixtures into past 7 days and next 7 days windows", () => {
    const now = new Date(2026, 5, 3, 12);

    const buckets = buildSeasonGradeFixtureBuckets(
      [
        fixture(1, "2026-05-26"),
        fixture(2, "2026-05-27"),
        fixture(3, "2026-06-02"),
        fixture(4, "2026-06-03"),
        fixture(5, "2026-06-10"),
        fixture(6, "2026-06-11"),
        fixture(7, null),
        fixture(8, "date tbc"),
      ],
      now,
    );

    expect(buckets.previousRows.map((row) => row.id)).toEqual([2, 3]);
    expect(buckets.upcomingRows.map((row) => row.id)).toEqual([4, 5]);
  });

  it("keeps all previous and all upcoming rows for expanded tables", () => {
    const now = new Date(2026, 5, 3, 12);

    const buckets = buildSeasonGradeFixtureBuckets(
      [
        fixture(1, "2026-05-19"),
        fixture(2, "2026-05-20"),
        fixture(3, "2026-06-02"),
        fixture(4, "2026-06-03"),
        fixture(5, "2026-06-10"),
        fixture(6, "2026-06-18"),
      ],
      now,
    );

    expect(buckets.allPreviousRows.map((row) => row.id)).toEqual([1, 2, 3]);
    expect(buckets.allUpcomingRows.map((row) => row.id)).toEqual([4, 5, 6]);
  });

  it("excludes fixtures without usable dates from dated tables", () => {
    const now = new Date(2026, 5, 3, 12);

    const buckets = buildSeasonGradeFixtureBuckets([fixture(1, null), fixture(2, "date tbc")], now);

    expect(buckets.previousRows).toEqual([]);
    expect(buckets.upcomingRows).toEqual([]);
    expect(buckets.allPreviousRows).toEqual([]);
    expect(buckets.allUpcomingRows).toEqual([]);
  });
});
