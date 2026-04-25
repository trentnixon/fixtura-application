import type { UnknownRecord } from "../_types";

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
