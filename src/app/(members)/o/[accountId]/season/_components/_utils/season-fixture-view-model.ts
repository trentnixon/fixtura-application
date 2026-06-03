import { resolveCompetitionTitle } from "./season-competition";
import {
  extractFixtureRecord,
  fixtureTeamSideLabel,
  resolveFixtureHeadline,
  unwrapSeasonHubFixturePayload,
} from "./season-fixture";
import { buildSeasonFixtureDetailDisplay } from "./season-fixture-detail-model";
import { formatFixtureDateDisplay } from "./season-fixture-display";
import { pickString } from "./season-record";

import type {
  SeasonFixtureDownloadEntry,
  SeasonFixtureTeamSide,
  SeasonFixtureViewModel,
  UnknownRecord,
} from "../_types";

function asRecord(value: unknown): UnknownRecord | undefined {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as UnknownRecord;
  }
  return undefined;
}

function parseTeamSide(
  rec: UnknownRecord | undefined,
  fallbackName: string,
): SeasonFixtureTeamSide | null {
  if (!rec) {
    return null;
  }
  const name =
    pickString(rec, ["name", "teamName", "title", "label", "clubName"])?.trim() || fallbackName;
  const subtitle = pickString(rec, ["id", "teamId", "shortName"]);
  const playersRaw = rec["players"];
  const playerLines: string[] = [];
  if (Array.isArray(playersRaw)) {
    for (const p of playersRaw) {
      if (typeof p === "string" && p.trim()) {
        playerLines.push(p.trim());
      } else if (p && typeof p === "object") {
        const pl = p as UnknownRecord;
        const num = pl["number"];
        const numPart =
          typeof num === "number" || typeof num === "string" ? String(num) : undefined;
        const nm =
          pickString(pl, ["name", "fullName", "displayName"]) ??
          (numPart ? `Player ${numPart}` : undefined);
        if (nm) {
          playerLines.push(numPart ? `${nm} (${numPart})` : nm);
        }
      }
    }
  }
  if (subtitle) {
    return { name, subtitle: String(subtitle), playerLines };
  }
  return { name, playerLines };
}

function extractTeamSides(
  teamsData: UnknownRecord | undefined,
): { home: SeasonFixtureTeamSide; away: SeasonFixtureTeamSide } | null {
  if (!teamsData) {
    return null;
  }

  let homeRec = asRecord(teamsData["home"]);
  let awayRec = asRecord(teamsData["away"]);
  if (!homeRec || !awayRec) {
    const teams = asRecord(teamsData["teams"]);
    if (teams) {
      homeRec = asRecord(teams["home"]);
      awayRec = asRecord(teams["away"]);
    }
  }

  if (!homeRec || !awayRec) {
    return null;
  }

  const home = parseTeamSide(homeRec, "Home team");
  const away = parseTeamSide(awayRec, "Away team");
  if (!home || !away) {
    return null;
  }
  return { home, away };
}

function pickGameId(rec: UnknownRecord | undefined): string | undefined {
  if (!rec) {
    return undefined;
  }
  const gid = rec["gameId"] ?? rec["gameID"];
  if (typeof gid === "string" && gid.length > 0) {
    return gid;
  }
  if (typeof gid === "number" && Number.isFinite(gid)) {
    return String(gid);
  }
  return undefined;
}

function formatTeamScoreLine(sideRec: UnknownRecord | undefined): string | undefined {
  const scores = sideRec ? asRecord(sideRec["scores"]) : undefined;
  if (!scores) {
    return undefined;
  }
  const total = pickString(scores, ["total"]);
  const overs = pickString(scores, ["overs"]);
  if (total && overs) {
    return `${total} ${overs}`;
  }
  return total ?? overs;
}

function extractDownloadEntries(downloads: unknown): SeasonFixtureDownloadEntry[] {
  const out: SeasonFixtureDownloadEntry[] = [];
  if (!downloads) {
    return out;
  }
  if (Array.isArray(downloads)) {
    for (const item of downloads) {
      if (typeof item === "string") {
        const href = /^https?:\/\//i.test(item) ? item : undefined;
        out.push(href !== undefined ? { label: item, href } : { label: item });
      } else if (item && typeof item === "object") {
        const rec = item as UnknownRecord;
        const url = pickString(rec, ["url", "href", "link", "src"]);
        const label = pickString(rec, ["name", "label", "title", "type"]) ?? url ?? "Download";
        out.push(url !== undefined ? { label, href: url } : { label });
      }
    }
    return out;
  }
  const rec = asRecord(downloads);
  if (rec) {
    const items = rec["items"];
    if (Array.isArray(items)) {
      return extractDownloadEntries(items);
    }
    for (const [k, v] of Object.entries(rec)) {
      if (typeof v === "string" && /^https?:\/\//i.test(v)) {
        out.push({ label: k || "Link", href: v });
      }
    }
  }
  return out;
}

export type BuildSeasonFixtureViewModelParams = {
  gradeId: string;
  fixtureId: string;
  competitionId: string;
};

export function buildSeasonFixtureViewModel(
  payload: unknown,
  { gradeId, fixtureId, competitionId }: BuildSeasonFixtureViewModelParams,
): SeasonFixtureViewModel {
  const payloadRecord = unwrapSeasonHubFixturePayload(payload);
  const fixtureRecord = extractFixtureRecord(payload);
  const gradeContext = payloadRecord ? asRecord(payloadRecord["grade"]) : undefined;
  const rawTeams = payloadRecord?.["teamsData"];
  const teamsData =
    asRecord(rawTeams) ??
    (Array.isArray(rawTeams) && rawTeams.length >= 2
      ? ({
          home: rawTeams[0],
          away: rawTeams[1],
        } as UnknownRecord)
      : undefined);
  const downloadsRaw = payloadRecord?.["downloads"];
  const renderStatus = payloadRecord ? asRecord(payloadRecord["renderStatus"]) : undefined;
  const meta = payloadRecord ? asRecord(payloadRecord["meta"]) : undefined;
  const context = payloadRecord ? asRecord(payloadRecord["context"]) : undefined;

  const headline = resolveFixtureHeadline(fixtureRecord as UnknownRecord | undefined, fixtureId);

  const teamsNested = fixtureRecord ? asRecord(fixtureRecord["teams"]) : undefined;
  const homeSideRec = teamsNested ? asRecord(teamsNested["home"]) : undefined;
  const awaySideRec = teamsNested ? asRecord(teamsNested["away"]) : undefined;
  const homeTeam = teamsNested ? fixtureTeamSideLabel(teamsNested["home"]) : "—";
  const awayTeam = teamsNested ? fixtureTeamSideLabel(teamsNested["away"]) : "—";

  const datesRec = fixtureRecord ? asRecord(fixtureRecord["dates"]) : undefined;
  const dateHuman = datesRec ? pickString(datesRec, ["date"]) : undefined;
  const dateIso =
    datesRec && typeof datesRec["finalDaysPlay"] === "string"
      ? (datesRec["finalDaysPlay"] as string)
      : datesRec && typeof datesRec["dayOne"] === "string"
        ? (datesRec["dayOne"] as string)
        : fixtureRecord && typeof fixtureRecord["date"] === "string"
          ? (fixtureRecord["date"] as string)
          : undefined;
  const dateLabel =
    dateHuman && dateHuman.trim().length > 0 ? dateHuman.trim() : formatFixtureDateDisplay(dateIso);
  const dateRaw = dateIso;
  const timeLabel = datesRec ? pickString(datesRec, ["time"]) : undefined;
  const round =
    fixtureRecord && typeof fixtureRecord["round"] === "string"
      ? (fixtureRecord["round"] as string)
      : undefined;
  const type =
    fixtureRecord && typeof fixtureRecord["type"] === "string"
      ? (fixtureRecord["type"] as string)
      : undefined;
  const status =
    fixtureRecord && typeof fixtureRecord["status"] === "string"
      ? (fixtureRecord["status"] as string)
      : undefined;
  const gameId = pickGameId(fixtureRecord as UnknownRecord | undefined);

  const venueRec = fixtureRecord ? asRecord(fixtureRecord["venue"]) : undefined;
  const venueGround = venueRec ? pickString(venueRec, ["ground", "name", "label"]) : undefined;

  const gradeName =
    pickString(gradeContext ?? {}, ["name", "gradeName", "title"]) ?? `Grade ${gradeId}`;
  const gradeGender = pickString(gradeContext ?? {}, ["gender"]);
  const gradeAgeGroup = pickString(gradeContext ?? {}, ["ageGroup", "age_group"]);
  const competitionNested = gradeContext ? asRecord(gradeContext["competition"]) : undefined;
  const competitionName =
    pickString(competitionNested ?? {}, ["name"]) ??
    pickString(gradeContext ?? {}, ["competitionName"]) ??
    resolveCompetitionTitle(gradeContext, competitionId);
  const associationNested = gradeContext ? asRecord(gradeContext["association"]) : undefined;
  const associationName = pickString(associationNested ?? {}, ["name"]);

  const competitionBreadcrumbLabel = resolveCompetitionTitle(gradeContext, competitionId);

  const teamSides = extractTeamSides(teamsData);
  const downloadEntries = extractDownloadEntries(downloadsRaw);

  const upcomingRenders = renderStatus?.["upcomingGamesRenders"];
  const resultsRenders = renderStatus?.["gameResultsRenders"];
  const renderStatusLine =
    pickString(renderStatus ?? {}, ["state", "status", "phase"]) ??
    (Array.isArray(upcomingRenders) && Array.isArray(resultsRenders)
      ? `${upcomingRenders.length} upcoming render(s), ${resultsRenders.length} result render(s)`
      : renderStatus && Object.keys(renderStatus).length > 0
        ? "See outputs"
        : undefined);
  const renderLastRun =
    pickString(renderStatus ?? {}, ["lastRunAt", "updatedAt", "completedAt"]) ?? undefined;

  const contextMetaRows: SeasonFixtureViewModel["contextMetaRows"] = [];
  const pushIf = (label: string, value: string | undefined) => {
    if (value && value.trim()) {
      contextMetaRows.push({ label, value: value.trim() });
    }
  };
  pushIf("Source", pickString(meta ?? {}, ["source", "origin"]));
  pushIf("Assembled", pickString(meta ?? {}, ["assembledAt", "builtAt", "generatedAt"]));
  pushIf("Generated", pickString(meta ?? {}, ["generatedAt"]));
  pushIf("Version", pickString(meta ?? {}, ["version", "schemaVersion"]));
  pushIf("Scope", pickString(context ?? {}, ["scope", "accountScope"]));
  const clubRaw = payloadRecord?.["club"];
  if (Array.isArray(clubRaw) && clubRaw.length > 0) {
    const names = clubRaw
      .map((c) =>
        c && typeof c === "object" && !Array.isArray(c) && typeof c.name === "string"
          ? c.name.trim()
          : undefined,
      )
      .filter((n): n is string => Boolean(n && n.trim()));
    if (names.length > 0) {
      pushIf("Clubs", names.join(", "));
    }
  } else {
    const clubRec = asRecord(clubRaw);
    pushIf("Club", pickString(clubRec ?? {}, ["name", "title"]));
  }
  const adminCtx = context ? asRecord(context["admin"]) : undefined;
  pushIf("Published", pickString(adminCtx ?? {}, ["publishedAt"]));
  pushIf("Updated", pickString(adminCtx ?? {}, ["updatedAt"]));
  const detailDisplay = buildSeasonFixtureDetailDisplay(payloadRecord ?? undefined, fixtureRecord);
  const validationSummary = detailDisplay.validationSummary;
  if (validationSummary?.overallScore != null && validationSummary.status) {
    pushIf("Data quality", `${validationSummary.overallScore} — ${validationSummary.status}`);
  } else if (validationSummary?.status) {
    pushIf("Data quality", validationSummary.status);
  } else {
    const validationRec = meta ? asRecord(meta["validation"]) : undefined;
    pushIf("Data quality", pickString(validationRec ?? {}, ["status"]));
  }

  const hasOutputs =
    detailDisplay.renderEntries.length > 0 ||
    downloadEntries.length > 0 ||
    Boolean(renderStatus && Object.keys(renderStatus).length > 0);

  const headerContextParts = [
    round,
    dateLabel !== "—" ? dateLabel : undefined,
    timeLabel,
    type,
  ].filter((p): p is string => Boolean(p && String(p).trim().length > 0 && p !== "—"));
  const headerContextLine = headerContextParts.length > 0 ? headerContextParts.join(" - ") : null;

  const homeScoreLine = formatTeamScoreLine(homeSideRec);
  const awayScoreLine = formatTeamScoreLine(awaySideRec);
  const matchDetailsRec = fixtureRecord ? asRecord(fixtureRecord["matchDetails"]) : undefined;
  const scorecardUrl = matchDetailsRec
    ? pickString(matchDetailsRec, ["urlToScoreCard", "url"])
    : undefined;

  return {
    fixtureRecord: fixtureRecord as UnknownRecord | undefined,
    gradeContext,
    teamsData,
    teamSides,
    downloadEntries,
    renderStatus,
    meta,
    context,
    headline,
    homeTeam,
    awayTeam,
    homeScoreLine,
    awayScoreLine,
    scorecardUrl,
    dateRaw,
    dateLabel,
    timeLabel,
    round,
    type,
    status,
    gameId,
    venueGround,
    gradeName,
    gradeGender,
    gradeAgeGroup,
    competitionName,
    associationName,
    competitionBreadcrumbLabel,
    renderStatusLine,
    renderLastRun,
    contextMetaRows,
    hasOutputs,
    headerContextLine,
    isFinished: detailDisplay.isFinished,
    ...(detailDisplay.matchResult.resultStatement
      ? { resultStatement: detailDisplay.matchResult.resultStatement }
      : {}),
    ...(detailDisplay.matchResult.tossLine ? { tossLine: detailDisplay.matchResult.tossLine } : {}),
    inningsScorecards: detailDisplay.inningsScorecards,
    ...(detailDisplay.validationSummary
      ? { validationSummary: detailDisplay.validationSummary }
      : {}),
    renderEntries: detailDisplay.renderEntries,
    ...(detailDisplay.homeLogoUrl !== undefined ? { homeLogoUrl: detailDisplay.homeLogoUrl } : {}),
    ...(detailDisplay.awayLogoUrl !== undefined ? { awayLogoUrl: detailDisplay.awayLogoUrl } : {}),
    ...(detailDisplay.associationLogoUrl !== undefined
      ? { associationLogoUrl: detailDisplay.associationLogoUrl }
      : {}),
    hasScorecardTables: detailDisplay.hasScorecardTables,
    showScorecardSection:
      detailDisplay.hasScorecardTables ||
      Boolean(detailDisplay.matchResult.resultStatement?.trim()),
    ...(detailDisplay.contentNote ? { contentNote: detailDisplay.contentNote } : {}),
  };
}
