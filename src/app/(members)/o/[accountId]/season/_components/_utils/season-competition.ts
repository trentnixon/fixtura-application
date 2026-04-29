import type { UnknownRecord } from "../_types";

function pickNonEmptyString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function titleFromRecord(record: UnknownRecord | undefined): string | undefined {
  if (!record) {
    return undefined;
  }
  return (
    pickNonEmptyString(record["name"]) ??
    pickNonEmptyString(record["title"]) ??
    pickNonEmptyString(record["label"])
  );
}

/**
 * Best-effort competition display name from season-hub competition detail (or similar) payload.
 * Handles a few nested shapes the API may use.
 */
export function extractCompetitionTitle(raw: UnknownRecord | undefined): string | undefined {
  const direct = titleFromRecord(raw);
  if (direct) {
    return direct;
  }

  if (!raw) {
    return undefined;
  }

  const meta = raw["meta"];
  if (meta && typeof meta === "object" && meta !== null) {
    const fromMeta = titleFromRecord(meta as UnknownRecord);
    if (fromMeta) {
      return fromMeta;
    }
  }

  const nestedCompetition = raw["competition"];
  if (nestedCompetition && typeof nestedCompetition === "object" && nestedCompetition !== null) {
    const fromNested = titleFromRecord(nestedCompetition as UnknownRecord);
    if (fromNested) {
      return fromNested;
    }
  }

  const attributes = raw["attributes"];
  if (attributes && typeof attributes === "object" && attributes !== null) {
    const fromAttributes = titleFromRecord(attributes as UnknownRecord);
    if (fromAttributes) {
      return fromAttributes;
    }
  }

  const details = raw["details"];
  if (details && typeof details === "object" && details !== null) {
    return titleFromRecord(details as UnknownRecord);
  }

  return undefined;
}

export function resolveCompetitionTitle(
  raw: UnknownRecord | undefined,
  competitionId: string,
): string {
  return extractCompetitionTitle(raw) ?? `Competition ${competitionId}`;
}

/** `YYYY-MM-DD` from season-hub -> readable local date (e.g. 31 Mar 2026). */
export function formatSeasonHubDate(isoDate: string | undefined): string | undefined {
  if (!isoDate || typeof isoDate !== "string") {
    return undefined;
  }
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate.trim());
  if (!match) {
    return isoDate;
  }
  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const date = new Date(year, month, day);
  if (Number.isNaN(date.getTime())) {
    return isoDate;
  }
  return date.toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function getGradesCountFromCompetition(raw: UnknownRecord | undefined): number | undefined {
  if (!raw || typeof raw["counts"] !== "object" || raw["counts"] === null) {
    return undefined;
  }

  const grades = (raw["counts"] as UnknownRecord)["grades"];
  return typeof grades === "number" && Number.isFinite(grades) ? grades : undefined;
}
