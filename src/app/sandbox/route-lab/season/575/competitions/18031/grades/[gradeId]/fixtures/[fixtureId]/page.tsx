"use client";

import {
  Calendar,
  Clock,
  ExternalLink,
  Hash,
  Loader2,
  MapPin,
  RefreshCw,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, type ReactNode } from "react";

import { resolveCompetitionTitle } from "@/app/(members)/o/[accountId]/season/_components/_utils/season-competition";
import {
  extractFixtureRecord,
  fixtureTeamSideLabel,
  resolveFixtureHeadline,
  unwrapSeasonHubFixturePayload,
} from "@/app/(members)/o/[accountId]/season/_components/_utils/season-fixture";
import { pickString } from "@/app/(members)/o/[accountId]/season/_components/_utils/season-record";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader } from "@/components/ui/card";
import { Surface } from "@/components/ui/container";
import { SectionBlock, SectionDivider } from "@/components/ui/section";
import { useSeasonHubFixture, useSeasonHubGradeFixtures } from "@/lib/api/hooks/season-hub";
import { accountScopedRoutes } from "@/lib/config/account-routes";
import { ROUTES } from "@/lib/config/routes";
import { cn } from "@/lib/utils";

import {
  SeasonRouteLabFrame,
  SeasonRouteLabPayloadCard,
  SeasonRouteLabStatus,
} from "../../../../../../_components/season-route-lab-frame";

import type { UnknownRecord } from "@/app/(members)/o/[accountId]/season/_components/_types";

const ACCOUNT_ID = "575";
const COMPETITION_ID = "18031";

const COMPETITION_LAB_PATH = `/sandbox/route-lab/season/${ACCOUNT_ID}/competitions/${COMPETITION_ID}`;

function asRecord(value: unknown): UnknownRecord | undefined {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as UnknownRecord;
  }
  return undefined;
}

/** Season-hub date strings (calendar day or ISO) -> readable local label (e.g. Wed, 31 Mar 2026). */
function formatFixtureDateDisplay(value: string | null | undefined): string {
  if (value == null || String(value).trim() === "") {
    return "—";
  }
  const s = String(value).trim();
  const ymd = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (ymd) {
    const year = Number(ymd[1]);
    const month = Number(ymd[2]) - 1;
    const day = Number(ymd[3]);
    const localDay = new Date(year, month, day);
    if (!Number.isNaN(localDay.getTime())) {
      return localDay.toLocaleDateString("en-AU", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }
  }
  const parsed = new Date(s);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toLocaleDateString("en-AU", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }
  return s;
}

/** Map fixture status copy to badge colors (sports-style lifecycle). */
function fixtureStatusBadgeClass(status: string): string {
  const s = status.trim().toLowerCase();
  if (/\b(cancel|abandon|postpone|void|forfeit|wash)\b/.test(s)) {
    return "bg-error-600";
  }
  if (/\b(complete|completed|final|full\s*time|played|closed)\b/.test(s)) {
    return "bg-error-600";
  }
  if (/\bupcoming\b/.test(s)) {
    return "bg-success-600";
  }
  if (/\b(active|live|in\s*progress|playing)\b/.test(s)) {
    return "bg-success-600";
  }
  if (/\b(scheduled|pending|tbc|drawn)\b/.test(s)) {
    return "bg-warning-600";
  }
  return "bg-muted-foreground";
}

type TeamSideModel = {
  name: string;
  subtitle?: string;
  playerLines: string[];
};

function parseTeamSide(rec: UnknownRecord | undefined, fallbackName: string): TeamSideModel | null {
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
  return { name, subtitle: subtitle ? String(subtitle) : undefined, playerLines };
}

function extractTeamSides(
  teamsData: UnknownRecord | undefined,
): { home: TeamSideModel; away: TeamSideModel } | null {
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

type DownloadEntry = { label: string; href?: string };

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

function extractDownloadEntries(downloads: unknown): DownloadEntry[] {
  const out: DownloadEntry[] = [];
  if (!downloads) {
    return out;
  }
  if (Array.isArray(downloads)) {
    for (const item of downloads) {
      if (typeof item === "string") {
        const href = /^https?:\/\//i.test(item) ? item : undefined;
        out.push({ label: item, href });
      } else if (item && typeof item === "object") {
        const rec = item as UnknownRecord;
        const url = pickString(rec, ["url", "href", "link", "src"]);
        const label = pickString(rec, ["name", "label", "title", "type"]) ?? url ?? "Download";
        out.push({ label, href: url });
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

function tileSurface(value: ReactNode, label: string, Icon: LucideIcon, valueClassName?: string) {
  return (
    <Surface
      key={label}
      className="bg-primary/5 ring-primary/10 flex min-h-16 items-center justify-between gap-4 py-3 shadow-none ring-1"
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-3">
        <span
          className={cn(
            "text-primary leading-snug font-bold",
            valueClassName ?? "text-2xl leading-none tabular-nums",
          )}
        >
          {value}
        </span>
        <span className="text-muted-foreground truncate text-sm font-semibold tracking-tight uppercase">
          {label}
        </span>
      </div>
      <Icon className="text-primary size-4 shrink-0" aria-hidden />
    </Surface>
  );
}

export default function RouteLabSeasonFixtureCanonicalDynamicPage() {
  const params = useParams<{ gradeId: string; fixtureId: string }>();
  const gradeId = String(params.gradeId ?? "");
  const fixtureId = String(params.fixtureId ?? "");

  const fixture = useSeasonHubFixture(
    {
      accountId: ACCOUNT_ID,
      competitionId: COMPETITION_ID,
      gradeId,
      fixtureId,
    },
    { enabled: Boolean(gradeId && fixtureId) },
  );
  const gradeFixtures = useSeasonHubGradeFixtures(ACCOUNT_ID, gradeId, {
    competitionId: COMPETITION_ID,
    enabled: Boolean(gradeId),
  });
  const fixtureRows = gradeFixtures.data?.data ?? [];
  const fixturesReversed = [...fixtureRows].reverse();

  const isFetching = fixture.isFetching || gradeFixtures.isFetching;

  const fixtureModel = useMemo(() => {
    const payload = fixture.data;
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

    const headline = resolveFixtureHeadline(fixtureRecord, fixtureId);

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
      dateHuman && dateHuman.trim().length > 0
        ? dateHuman.trim()
        : formatFixtureDateDisplay(dateIso);
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
    const gameId = pickGameId(fixtureRecord);

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
      resolveCompetitionTitle(gradeContext, COMPETITION_ID);
    const associationNested = gradeContext ? asRecord(gradeContext["association"]) : undefined;
    const associationName = pickString(associationNested ?? {}, ["name"]);

    const competitionBreadcrumbLabel = resolveCompetitionTitle(gradeContext, COMPETITION_ID);

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

    const contextMetaRows: { label: string; value: string }[] = [];
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
          c && typeof c === "object" && !Array.isArray(c)
            ? pickString(c as UnknownRecord, ["name"])
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
    const validationRec = meta ? asRecord(meta["validation"]) : undefined;
    pushIf("Data quality", pickString(validationRec ?? {}, ["status"]));

    const hasOutputs =
      Boolean(renderStatus && Object.keys(renderStatus).length > 0) || downloadEntries.length > 0;

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
      fixtureRecord,
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
    };
  }, [fixture.data, gradeId, fixtureId]);

  const gradeLabHref = `${COMPETITION_LAB_PATH}/grades/${gradeId || ":gradeId"}`;
  const frameTitle =
    !fixture.isPending && !fixture.isError
      ? fixtureModel.headline
      : `Season - Fixture (canonical) #${fixtureId || "?"}`;

  return (
    <SeasonRouteLabFrame
      title={frameTitle}
      description="Canonical fixture detail endpoint with full drill-down path."
      productionRoute={`${accountScopedRoutes.season(ACCOUNT_ID)}/competitions/${COMPETITION_ID}/grades/${gradeId || ":gradeId"}/fixtures/${fixtureId || ":fixtureId"}`}
      header={
        <header className="border-border border-b pb-8">
          <div className="space-y-4">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href={ROUTES.sandbox}>Sandbox</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href={ROUTES.routeLab}>Route lab</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href={`/sandbox/route-lab/season/${ACCOUNT_ID}/overview`}>
                      Season overview
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href={COMPETITION_LAB_PATH} className="max-w-[min(100%,20rem)] truncate">
                      {fixtureModel.competitionBreadcrumbLabel}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href={gradeLabHref} className="max-w-[min(100%,20rem)] truncate">
                      {gradeId ? fixtureModel.gradeName : "Grade"}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="max-w-[min(100%,28rem)] truncate">
                    {fixtureId ? fixtureModel.headline : "Fixture"}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 space-y-2">
                <div className="flex flex-wrap items-start gap-3">
                  <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
                    {fixtureModel.headline}
                  </h1>
                  {!fixture.isPending &&
                  !fixture.isError &&
                  fixtureModel.status &&
                  fixtureModel.status.trim().length > 0 ? (
                    <Badge
                      className={cn(
                        "shrink-0 border-transparent text-white hover:opacity-90",
                        fixtureStatusBadgeClass(fixtureModel.status),
                      )}
                    >
                      {fixtureModel.status}
                    </Badge>
                  ) : null}
                </div>
                {fixtureModel.headerContextLine ? (
                  <p className="text-muted-foreground max-w-3xl text-sm">
                    {fixtureModel.headerContextLine}
                  </p>
                ) : null}
              </div>
              <div className="flex flex-col gap-2 sm:shrink-0 sm:flex-row sm:items-center">
                <Button variant="outline" asChild>
                  <Link href={gradeLabHref}>Back</Link>
                </Button>
                <Button
                  variant="accent"
                  disabled={isFetching}
                  onClick={() => {
                    void fixture.refetch();
                    void gradeFixtures.refetch();
                  }}
                >
                  {isFetching ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                  ) : (
                    <RefreshCw className="size-4" aria-hidden />
                  )}
                  Sync
                </Button>
              </div>
            </div>
          </div>
        </header>
      }
      endpoints={[
        `GET /api/season-hub/575/competitions/18031/grades/${gradeId || ":gradeId"}/fixtures/${fixtureId || ":fixtureId"}`,
        `GET /api/season-hub/575/competitions/18031/grades/${gradeId || ":gradeId"}/fixtures`,
      ]}
      onRefetch={() => {
        void fixture.refetch();
        void gradeFixtures.refetch();
      }}
      isFetching={isFetching}
    >
      <SeasonRouteLabStatus
        isPending={fixture.isPending}
        isError={fixture.isError}
        errorMessage={fixture.error instanceof Error ? fixture.error.message : "Request failed"}
        pendingLabel="Loading fixture detail..."
      />

      {!fixture.isPending && !fixture.isError ? (
        <div className="grid gap-6">
          <SectionDivider variant="labeled" label="Match summary" />
          <SectionBlock variant="inset" spacing="sm">
            <Card className="gap-0 overflow-hidden p-0">
              <CardHeader className="bg-primary-950 border-b border-white/15 pt-6 pb-6 text-white">
                <CardAction>
                  <Trophy className="size-5 text-white" aria-hidden />
                </CardAction>
                <p className="text-xl leading-snug font-semibold text-white">
                  {fixtureModel.homeTeam} vs {fixtureModel.awayTeam}
                </p>
                {fixtureModel.homeScoreLine || fixtureModel.awayScoreLine ? (
                  <p className="text-base font-medium text-white/95">
                    <span className="text-white/90">{fixtureModel.homeTeam}</span>{" "}
                    {fixtureModel.homeScoreLine ?? "—"}
                    <span className="text-white/60"> · </span>
                    <span className="text-white/90">{fixtureModel.awayTeam}</span>{" "}
                    {fixtureModel.awayScoreLine ?? "—"}
                  </p>
                ) : null}
                <p className="text-sm text-white/80">
                  {fixtureModel.competitionName}
                  {fixtureModel.gradeName ? ` - ${fixtureModel.gradeName}` : ""}
                </p>
              </CardHeader>
              <CardContent className="space-y-5 py-6">
                {fixtureModel.scorecardUrl ? (
                  <div>
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={fixtureModel.scorecardUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2"
                      >
                        <ExternalLink className="size-4" aria-hidden />
                        Scorecard (PlayHQ)
                      </a>
                    </Button>
                  </div>
                ) : null}
                <div className="flex justify-end">
                  {fixtureModel.status && fixtureModel.status.trim().length > 0 ? (
                    <Badge
                      className={cn(
                        "border-transparent text-white hover:opacity-90",
                        fixtureStatusBadgeClass(fixtureModel.status),
                      )}
                    >
                      {fixtureModel.status}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground text-sm">No status</span>
                  )}
                </div>
                <p className="text-muted-foreground text-sm">
                  Canonical fixture detail for this grade. Use Sync to refresh fixture data and the
                  grade fixtures list used for lab debugging.
                </p>
              </CardContent>
            </Card>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {tileSurface(
                fixtureModel.round && fixtureModel.round.trim() ? fixtureModel.round : "—",
                "Round",
                Hash,
              )}
              {tileSurface(
                fixtureModel.dateLabel,
                "Date",
                Calendar,
                "text-base font-semibold sm:text-lg",
              )}
              {tileSurface(
                fixtureModel.type && fixtureModel.type.trim() ? fixtureModel.type : "—",
                "Type",
                Clock,
              )}
              {tileSurface(
                fixtureModel.venueGround && fixtureModel.venueGround.trim()
                  ? fixtureModel.venueGround
                  : "—",
                "Venue",
                MapPin,
                "text-base font-semibold sm:text-lg",
              )}
            </div>
            {fixtureModel.gameId ? (
              <p className="text-muted-foreground mt-4 font-mono text-xs">
                Game ID: {fixtureModel.gameId}
              </p>
            ) : null}
          </SectionBlock>

          <SectionDivider variant="labeled" label="Grade context" />
          <SectionBlock variant="inset" spacing="sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 space-y-2">
                <p className="text-sm font-semibold">Grade context</p>
                <p className="text-muted-foreground text-xs">
                  Competition-scoped grade for this fixture drill-down.
                </p>
                <dl className="text-muted-foreground mt-3 grid gap-2 text-sm">
                  <div>
                    <dt className="text-xs font-medium uppercase">Grade</dt>
                    <dd className="text-foreground font-medium">{fixtureModel.gradeName}</dd>
                  </div>
                  {(fixtureModel.gradeGender || fixtureModel.gradeAgeGroup) && (
                    <div>
                      <dt className="text-xs font-medium uppercase">Profile</dt>
                      <dd>
                        {[fixtureModel.gradeGender, fixtureModel.gradeAgeGroup]
                          .filter(Boolean)
                          .join(" - ")}
                      </dd>
                    </div>
                  )}
                  {fixtureModel.associationName ? (
                    <div>
                      <dt className="text-xs font-medium uppercase">Association</dt>
                      <dd>{fixtureModel.associationName}</dd>
                    </div>
                  ) : null}
                </dl>
              </div>
              <Button variant="outline" asChild className="shrink-0 self-start">
                <Link href={gradeLabHref}>Back to grade</Link>
              </Button>
            </div>
          </SectionBlock>

          <SectionDivider variant="labeled" label="Teams" />
          <SectionBlock variant="inset" spacing="sm">
            {fixtureModel.teamSides ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {(
                  [
                    ["Home", fixtureModel.teamSides.home],
                    ["Away", fixtureModel.teamSides.away],
                  ] as const
                ).map(([label, side]) => (
                  <Card key={label} className="gap-0 overflow-hidden p-0">
                    <CardHeader className="bg-primary-950 border-b border-white/15 pt-6 pb-6 text-white">
                      <CardAction>
                        <Users className="size-5 text-white" aria-hidden />
                      </CardAction>
                      <p className="text-lg leading-none font-semibold text-white">{side.name}</p>
                      <p className="text-sm text-white/80">{label}</p>
                      {side.subtitle ? (
                        <p className="text-xs text-white/70">ID: {side.subtitle}</p>
                      ) : null}
                    </CardHeader>
                    <CardContent className="space-y-3 py-6">
                      {side.playerLines.length > 0 ? (
                        <ul className="text-muted-foreground space-y-1 text-sm">
                          {side.playerLines.slice(0, 24).map((line) => (
                            <li key={line}>{line}</li>
                          ))}
                          {side.playerLines.length > 24 ? (
                            <li className="text-xs">
                              +{side.playerLines.length - 24} more (see debug payload)
                            </li>
                          ) : null}
                        </ul>
                      ) : (
                        <p className="text-muted-foreground text-sm">No player list in payload.</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Surface className="flex min-h-16 items-center gap-3 py-4 shadow-none">
                <p className="text-muted-foreground text-sm">
                  No structured teams data available. Inspect{" "}
                  <span className="font-mono text-xs">teamsData</span> in the debug payload below.
                </p>
              </Surface>
            )}
          </SectionBlock>

          {fixtureModel.hasOutputs ? (
            <>
              <SectionDivider variant="labeled" label="Outputs" />
              <SectionBlock variant="inset" spacing="sm">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  {fixtureModel.renderStatus &&
                  Object.keys(fixtureModel.renderStatus).length > 0 ? (
                    <Surface className="bg-primary/5 ring-primary/10 flex flex-col gap-2 py-4 shadow-none ring-1">
                      <p className="text-sm font-semibold">Render status</p>
                      {fixtureModel.renderStatusLine ? (
                        <p className="text-foreground text-sm">{fixtureModel.renderStatusLine}</p>
                      ) : (
                        <p className="text-muted-foreground text-xs">
                          No primary status field parsed.
                        </p>
                      )}
                      {fixtureModel.renderLastRun ? (
                        <p className="text-muted-foreground text-xs">
                          {fixtureModel.renderLastRun}
                        </p>
                      ) : null}
                    </Surface>
                  ) : null}
                  {fixtureModel.downloadEntries.length > 0 ? (
                    <Surface className="bg-primary/5 ring-primary/10 flex flex-col gap-3 py-4 shadow-none ring-1">
                      <p className="text-sm font-semibold">
                        Downloads ({fixtureModel.downloadEntries.length})
                      </p>
                      <ul className="space-y-2 text-sm">
                        {fixtureModel.downloadEntries.map((d, i) => (
                          <li key={`${d.label}-${i}`}>
                            {d.href ? (
                              <a
                                href={d.href}
                                className="text-primary font-medium underline-offset-4 hover:underline"
                                target="_blank"
                                rel="noreferrer"
                              >
                                {d.label}
                              </a>
                            ) : (
                              <span>{d.label}</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </Surface>
                  ) : null}
                </div>
              </SectionBlock>
            </>
          ) : null}

          {fixtureModel.contextMetaRows.length > 0 ? (
            <SectionBlock variant="inset" spacing="sm">
              <p className="text-muted-foreground mb-3 text-xs font-semibold tracking-wide uppercase">
                Context / meta
              </p>
              <dl className="grid gap-2 text-sm sm:grid-cols-2">
                {fixtureModel.contextMetaRows.map((row) => (
                  <div key={row.label}>
                    <dt className="text-muted-foreground text-xs">{row.label}</dt>
                    <dd className="font-mono text-xs break-all">{row.value}</dd>
                  </div>
                ))}
              </dl>
            </SectionBlock>
          ) : null}

          <SeasonRouteLabPayloadCard
            title="Debugging: fixture payload"
            payload={fixture.data ?? null}
          />
          {gradeFixtures.isPending ? (
            <Surface className="shadow-none">
              <p className="text-muted-foreground text-sm">
                Loading grade fixtures for debug (reversed list)...
              </p>
            </Surface>
          ) : null}
          {gradeFixtures.isError ? (
            <Surface className="shadow-none">
              <p className="text-destructive text-sm">
                Grade fixtures debug request failed:{" "}
                {gradeFixtures.error instanceof Error
                  ? gradeFixtures.error.message
                  : "Unknown error"}
              </p>
            </Surface>
          ) : null}
          {!gradeFixtures.isPending && !gradeFixtures.isError ? (
            <SeasonRouteLabPayloadCard
              title={`Grade fixtures debug (reversed: ${fixturesReversed.length} rows, bottom of list → top)`}
              payload={fixturesReversed}
            />
          ) : null}
        </div>
      ) : null}
    </SeasonRouteLabFrame>
  );
}
