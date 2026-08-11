import type { SeasonHubScorecardRow } from "@/types/api/season-hub";

/** PlayHQ bowling export: full name, short name, then O/M/R/W/E/WD/NB. */
const PLAYHQ_BOWLING_EXTRA_COLUMNS = 1;

export const PLAYHQ_BATTING_DISPLAY_HEADERS = [
  "Name",
  "How out",
  "R",
  "B",
  "4S",
  "6s",
  "SR",
] as const;

function fixDismissalSpacing(text: string): string {
  return text
    .replace(/(\S)(b:)/gi, "$1 b:")
    .replace(/\s+/g, " ")
    .trim();
}

function pickDismissal(primary?: string, secondary?: string): string {
  const left = primary?.trim() ?? "";
  const right = secondary?.trim() ?? "";
  if (!left) {
    return fixDismissalSpacing(right);
  }
  if (!right) {
    return fixDismissalSpacing(left);
  }
  if (left === right) {
    return fixDismissalSpacing(left);
  }
  const normalizedLeft = fixDismissalSpacing(left);
  const normalizedRight = fixDismissalSpacing(right);
  return normalizedLeft.length >= normalizedRight.length ? normalizedLeft : normalizedRight;
}

function formatHowOut(dismissal: string): string {
  const trimmed = fixDismissalSpacing(dismissal);
  return trimmed.length > 0 ? trimmed : "—";
}

function isBattingHeaderSet(headers: string[]): boolean {
  return headers.length === 6 && /^batters?$/i.test(headers[0]?.trim() ?? "");
}

function isBowlingHeaderSet(headers: string[]): boolean {
  return headers.length === 8 && /^bowlers?$/i.test(headers[0]?.trim() ?? "");
}

function isPlayHqBattingRow(row: SeasonHubScorecardRow): boolean {
  return row.length >= 9;
}

function normalizePlayHqBattingRow(row: SeasonHubScorecardRow): string[] {
  const name = (row[0] ?? "").trim();
  const howOut = formatHowOut(pickDismissal(row[2], row[3]));
  const statsStart = row.length - 5;
  const stats = row.slice(statsStart, statsStart + 5);
  return [name, howOut, ...stats];
}

function normalizePlayHqBowlingRow(row: SeasonHubScorecardRow): string[] {
  const name = row[0] ?? "";
  const statsStart = row.length - 7;
  const stats = row.slice(statsStart, statsStart + 7);
  return [name.trim(), ...stats];
}

export function normalizeBattingScorecard(
  headers: string[],
  rows: SeasonHubScorecardRow[],
): { headers: string[]; rows: string[][] } {
  const usePlayHqSplit = isBattingHeaderSet(headers) && rows.some((row) => isPlayHqBattingRow(row));

  if (usePlayHqSplit) {
    return {
      headers: [...PLAYHQ_BATTING_DISPLAY_HEADERS],
      rows: rows.map((row) => (isPlayHqBattingRow(row) ? normalizePlayHqBattingRow(row) : row)),
    };
  }

  return {
    headers,
    rows: rows.map((row) => normalizeScorecardRow(headers, row)),
  };
}

export function normalizeBowlingScorecard(
  headers: string[],
  rows: SeasonHubScorecardRow[],
): { headers: string[]; rows: string[][] } {
  return {
    headers,
    rows: rows.map((row) => normalizeScorecardRow(headers, row)),
  };
}

export function normalizeScorecardRow(headers: string[], row: SeasonHubScorecardRow): string[] {
  if (row.length <= headers.length) {
    return row;
  }

  if (isBattingHeaderSet(headers) && isPlayHqBattingRow(row)) {
    return normalizePlayHqBattingRow(row);
  }

  if (isBowlingHeaderSet(headers) && row.length >= headers.length + PLAYHQ_BOWLING_EXTRA_COLUMNS) {
    return normalizePlayHqBowlingRow(row);
  }

  const statCount = headers.length - 1;
  if (statCount > 0 && row.length > headers.length) {
    const stats = row.slice(row.length - statCount);
    const label = row
      .slice(0, row.length - statCount)
      .map((cell) => cell?.trim())
      .filter(Boolean)
      .join(" ");
    return [label, ...stats];
  }

  return row.slice(0, headers.length);
}

export function normalizeScorecardRows(
  headers: string[],
  rows: SeasonHubScorecardRow[],
): string[][] {
  return rows.map((row) => normalizeScorecardRow(headers, row));
}
