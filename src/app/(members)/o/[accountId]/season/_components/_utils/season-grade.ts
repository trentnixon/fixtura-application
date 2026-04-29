import { asRecord } from "./season-record";

import type { UnknownRecord } from "../_types";

/** Parse `counts` from grade detail payload for coverage tiles. */
export function parseGradePayloadCounts(record: UnknownRecord | undefined): {
  teams: number;
  fixtures: number;
} {
  const counts = asRecord(record?.["counts"]);
  if (!counts) {
    return { teams: 0, fixtures: 0 };
  }
  const teamsRaw = counts["teams"];
  const fixturesRaw = counts["fixtures"];
  const teams =
    typeof teamsRaw === "number"
      ? teamsRaw
      : typeof teamsRaw === "string"
        ? Number(teamsRaw) || 0
        : 0;
  const fixtures =
    typeof fixturesRaw === "number"
      ? fixturesRaw
      : typeof fixturesRaw === "string"
        ? Number(fixturesRaw) || 0
        : 0;
  return { teams, fixtures };
}

export function resolveGradeTitle(grade: unknown, gradeId: string): string {
  if (grade && typeof grade === "object") {
    const row = grade as UnknownRecord;
    if (typeof row["name"] === "string" && row["name"].length > 0) {
      return row["name"];
    }
    if (typeof row["title"] === "string" && row["title"].length > 0) {
      return row["title"];
    }
  }

  return `Grade ${gradeId}`;
}

export function getFixturesCountFromGrade(grade: unknown): number | undefined {
  if (!grade || typeof grade !== "object") {
    return undefined;
  }

  const counts = (grade as { counts?: unknown }).counts;
  if (!counts || typeof counts !== "object") {
    return undefined;
  }

  const fixtures = (counts as UnknownRecord)["fixtures"];
  return typeof fixtures === "number" && Number.isFinite(fixtures) ? fixtures : undefined;
}
