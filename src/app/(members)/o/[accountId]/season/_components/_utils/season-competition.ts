import type { UnknownRecord } from "../_types";

export function resolveCompetitionTitle(
  raw: UnknownRecord | undefined,
  competitionId: string,
): string {
  if (raw && typeof raw["name"] === "string" && raw["name"].length > 0) {
    return raw["name"];
  }

  if (raw && typeof raw["title"] === "string" && raw["title"].length > 0) {
    return raw["title"];
  }

  return `Competition ${competitionId}`;
}

export function getGradesCountFromCompetition(raw: UnknownRecord | undefined): number | undefined {
  if (!raw || typeof raw["counts"] !== "object" || raw["counts"] === null) {
    return undefined;
  }

  const grades = (raw["counts"] as UnknownRecord)["grades"];
  return typeof grades === "number" && Number.isFinite(grades) ? grades : undefined;
}
