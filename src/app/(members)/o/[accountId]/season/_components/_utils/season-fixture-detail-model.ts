import {
  normalizeBattingScorecard,
  normalizeBowlingScorecard,
} from "./season-fixture-scorecard-rows";

import type {
  SeasonFixtureContentNote,
  SeasonFixtureInningsDisplay,
  SeasonFixtureMatchResultDisplay,
  SeasonFixtureRenderEntry,
  SeasonFixtureValidationDisplay,
} from "../_types";
import type {
  SeasonHubFixtureDetailBody,
  SeasonHubFixtureDetailFixture,
  SeasonHubFixtureDetailMeta,
  SeasonHubFixtureDetailTeamRef,
  SeasonHubFixtureDetailTeamsData,
  SeasonHubFixtureInningsScorecard,
  SeasonHubFixtureMatchDetails,
  SeasonHubFixtureRenderStatus,
  SeasonHubScorecardRow,
} from "@/types/api/season-hub";

const INNINGS_ORDER = ["innings1", "innings2"] as const;

function normalizeName(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

function hasScorecardTableData(innings: SeasonFixtureInningsDisplay): boolean {
  return innings.battingRows.length > 0 || innings.bowlingRows.length > 0;
}

function mapInnings(
  key: string,
  innings: SeasonHubFixtureInningsScorecard,
): SeasonFixtureInningsDisplay {
  const batting = normalizeBattingScorecard(
    innings.Battingheaders ?? [],
    innings.battingRows ?? [],
  );
  const bowling = normalizeBowlingScorecard(
    innings.Bowlingheaders ?? [],
    innings.bowlingRows ?? [],
  );
  const battingHeaders = batting.headers;
  const battingRows = batting.rows;
  const bowlingHeaders = bowling.headers;
  const bowlingRows = bowling.rows;

  return {
    key,
    battingTitle: innings.BattinginningsName?.trim() || "Batting",
    bowlingTitle: innings.BowlinginningsName?.trim() || "Bowling",
    battingHeaders,
    battingRows,
    bowlingHeaders,
    bowlingRows,
    hasFallOfWickets: Array.isArray(innings.FOW) && innings.FOW.length > 0,
  };
}

export function buildMatchResultDisplay(
  fixture: SeasonHubFixtureDetailFixture | undefined,
): SeasonFixtureMatchResultDisplay {
  const matchDetails = fixture?.matchDetails;
  const resultStatement = matchDetails?.resultStatement?.trim() || undefined;
  const tossWinner = matchDetails?.tossWinner?.trim();
  const tossResult = matchDetails?.tossResult?.trim();
  let tossLine: string | undefined;
  if (tossWinner && tossResult) {
    tossLine = `${tossWinner} won the toss and elected to ${tossResult}`;
  } else if (tossWinner) {
    tossLine = `${tossWinner} won the toss`;
  }
  return {
    ...(resultStatement ? { resultStatement } : {}),
    ...(tossLine ? { tossLine } : {}),
  };
}

export function buildInningsScorecards(
  scorecards: SeasonHubFixtureMatchDetails["scorecards"] | undefined,
): SeasonFixtureInningsDisplay[] {
  if (!scorecards || typeof scorecards !== "object") {
    return [];
  }
  const ordered: SeasonFixtureInningsDisplay[] = [];
  const seen = new Set<string>();

  for (const key of INNINGS_ORDER) {
    const innings = scorecards[key];
    if (innings) {
      ordered.push(mapInnings(key, innings));
      seen.add(key);
    }
  }

  for (const [key, innings] of Object.entries(scorecards)) {
    if (seen.has(key) || !innings) {
      continue;
    }
    ordered.push(mapInnings(key, innings));
  }

  return ordered;
}

export function buildValidationDisplay(
  meta: SeasonHubFixtureDetailMeta | undefined,
): SeasonFixtureValidationDisplay | undefined {
  const validation = meta?.validation;
  if (!validation) {
    return undefined;
  }
  const breakdown = validation.breakdown
    ? Object.entries(validation.breakdown).map(([key, value]) => ({
        key,
        label: key.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (c) => c.toUpperCase()),
        value,
      }))
    : [];
  if (validation.overallScore == null && !validation.status && breakdown.length === 0) {
    return undefined;
  }
  return {
    ...(validation.overallScore != null ? { overallScore: validation.overallScore } : {}),
    ...(validation.status ? { status: validation.status } : {}),
    breakdown,
  };
}

function mapRenderEntry(
  entry: { id: number; status: string; processedAt?: string | null },
  kind: SeasonFixtureRenderEntry["kind"],
): SeasonFixtureRenderEntry {
  return {
    id: entry.id,
    status: entry.status,
    kind,
    ...(entry.processedAt ? { processedAt: entry.processedAt } : {}),
  };
}

export function buildRenderEntries(
  renderStatus: SeasonHubFixtureRenderStatus | undefined,
): SeasonFixtureRenderEntry[] {
  if (!renderStatus) {
    return [];
  }
  const out: SeasonFixtureRenderEntry[] = [];
  for (const entry of renderStatus.upcomingGamesRenders ?? []) {
    out.push(mapRenderEntry(entry, "upcoming"));
  }
  for (const entry of renderStatus.gameResultsRenders ?? []) {
    out.push(mapRenderEntry(entry, "result"));
  }
  return out;
}

function teamRefsFromTeamsData(
  teamsData: SeasonHubFixtureDetailTeamsData | undefined,
): SeasonHubFixtureDetailTeamRef[] {
  if (!teamsData) {
    return [];
  }
  if (Array.isArray(teamsData)) {
    return teamsData;
  }
  const refs: SeasonHubFixtureDetailTeamRef[] = [];
  if (teamsData.home) {
    refs.push(teamsData.home);
  }
  if (teamsData.away) {
    refs.push(teamsData.away);
  }
  const nested = teamsData.teams;
  if (nested?.home) {
    refs.push(nested.home);
  }
  if (nested?.away) {
    refs.push(nested.away);
  }
  return refs;
}

function logoForTeamName(
  name: string | undefined,
  refs: SeasonHubFixtureDetailTeamRef[],
): string | null | undefined {
  if (!name?.trim()) {
    return undefined;
  }
  const target = normalizeName(name);
  const match = refs.find((ref) => normalizeName(ref.name) === target);
  return match?.logoUrl ?? undefined;
}

export function resolveTeamLogos(
  teamsData: SeasonHubFixtureDetailTeamsData | undefined,
  fixture: SeasonHubFixtureDetailFixture | undefined,
): {
  homeLogoUrl?: string | null;
  awayLogoUrl?: string | null;
  associationLogoUrl?: string | null;
} {
  const refs = teamRefsFromTeamsData(teamsData);
  const homeName = fixture?.teams?.home?.name;
  const awayName = fixture?.teams?.away?.name;
  const homeLogoUrl = logoForTeamName(homeName, refs);
  const awayLogoUrl = logoForTeamName(awayName, refs);
  return {
    ...(homeLogoUrl !== undefined ? { homeLogoUrl } : {}),
    ...(awayLogoUrl !== undefined ? { awayLogoUrl } : {}),
  };
}

export function resolveAssociationLogo(
  body: SeasonHubFixtureDetailBody | undefined,
): string | null | undefined {
  return body?.grade?.association?.logo ?? undefined;
}

export function hasScorecardTables(innings: SeasonFixtureInningsDisplay[]): boolean {
  return innings.some(hasScorecardTableData);
}

export function buildContentNote(
  fixture: SeasonHubFixtureDetailFixture | undefined,
): SeasonFixtureContentNote | undefined {
  const content = fixture?.content;
  if (!content) {
    return undefined;
  }
  const lines: string[] = [];
  if (content.gameContext?.trim()) {
    lines.push(content.gameContext.trim());
  }
  if (content.basePromptInformation?.trim()) {
    lines.push(content.basePromptInformation.trim());
  }
  if (content.upcomingFixturePrompt?.trim()) {
    lines.push(content.upcomingFixturePrompt.trim());
  }
  const hasPromptFlags =
    content.hasBasePrompt === true || content.hasUpcomingFixturePrompt === true;
  if (lines.length === 0 && !hasPromptFlags) {
    return undefined;
  }
  return {
    hasBasePrompt: content.hasBasePrompt === true,
    hasUpcomingFixturePrompt: content.hasUpcomingFixturePrompt === true,
    summaryLines: lines,
  };
}

export type SeasonFixtureDetailDisplay = {
  matchResult: SeasonFixtureMatchResultDisplay;
  inningsScorecards: SeasonFixtureInningsDisplay[];
  validationSummary: SeasonFixtureValidationDisplay | undefined;
  renderEntries: SeasonFixtureRenderEntry[];
  homeLogoUrl?: string | null;
  awayLogoUrl?: string | null;
  associationLogoUrl?: string | null;
  hasScorecardTables: boolean;
  contentNote: SeasonFixtureContentNote | undefined;
  isFinished: boolean;
};

export function buildSeasonFixtureDetailDisplay(
  body: SeasonHubFixtureDetailBody | undefined,
  fixture: SeasonHubFixtureDetailFixture | undefined,
): SeasonFixtureDetailDisplay {
  const inningsScorecards = buildInningsScorecards(fixture?.matchDetails?.scorecards);
  const logos = resolveTeamLogos(body?.teamsData, fixture);
  const associationLogoUrl = resolveAssociationLogo(body);
  const contentNote = buildContentNote(fixture);
  const validationSummary = buildValidationDisplay(body?.meta);
  return {
    matchResult: buildMatchResultDisplay(fixture),
    inningsScorecards,
    validationSummary,
    renderEntries: buildRenderEntries(body?.renderStatus),
    ...logos,
    ...(associationLogoUrl !== undefined ? { associationLogoUrl } : {}),
    hasScorecardTables: hasScorecardTables(inningsScorecards),
    contentNote,
    isFinished: fixture?.isFinished === true,
  };
}

/** Exported for tests — ragged row helper */
export function scorecardRowCellCount(rows: SeasonHubScorecardRow[]): number {
  return rows.reduce((sum, row) => sum + row.length, 0);
}
