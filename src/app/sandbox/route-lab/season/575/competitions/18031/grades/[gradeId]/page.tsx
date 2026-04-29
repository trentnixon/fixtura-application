"use client";

import { Calendar, Loader2, RefreshCw, Search, Users, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";

import { resolveCompetitionTitle } from "@/app/(members)/o/[accountId]/season/_components/_utils/season-competition";
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
import { Surface } from "@/components/ui/container";
import { Input } from "@/components/ui/input";
import { SectionBlock, SectionDivider } from "@/components/ui/section";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSeasonHubGrade, useSeasonHubGradeFixtures } from "@/lib/api/hooks/season-hub";
import { accountScopedRoutes } from "@/lib/config/account-routes";
import { ROUTES } from "@/lib/config/routes";
import { cn } from "@/lib/utils";

import {
  SeasonRouteLabFrame,
  SeasonRouteLabPayloadCard,
  SeasonRouteLabStatus,
} from "../../../../_components/season-route-lab-frame";

import type { UnknownRecord } from "@/app/(members)/o/[accountId]/season/_components/_types";

const ACCOUNT_ID = "575";
const COMPETITION_ID = "18031";

const COMPETITION_LAB_PATH = `/sandbox/route-lab/season/${ACCOUNT_ID}/competitions/${COMPETITION_ID}`;

const FILTER_ALL = "all";
/** Select value for fixtures with no status string. */
const FILTER_STATUS_EMPTY = "__status_empty__";

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

function parseCounts(record: UnknownRecord | undefined): { teams: number; fixtures: number } {
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

export default function RouteLabSeasonGradeCanonicalDynamicPage() {
  const params = useParams<{ gradeId: string }>();
  const gradeId = String(params.gradeId ?? "");

  const grade = useSeasonHubGrade(ACCOUNT_ID, gradeId, {
    competitionId: COMPETITION_ID,
    enabled: Boolean(gradeId),
  });
  const fixtures = useSeasonHubGradeFixtures(ACCOUNT_ID, gradeId, {
    competitionId: COMPETITION_ID,
    enabled: Boolean(gradeId),
  });

  const isPending = grade.isPending || fixtures.isPending;
  const isFetching = grade.isFetching || fixtures.isFetching;
  const isError = grade.isError || fixtures.isError;
  const firstError = grade.error ?? fixtures.error;
  const fixtureRows = useMemo(() => fixtures.data?.data ?? [], [fixtures.data?.data]);
  /** Same rows as the link list, reversed for route-lab debugging (last API row shown first). */
  const fixturesReversed = useMemo(() => [...fixtureRows].reverse(), [fixtureRows]);

  const gradeRaw = useMemo((): UnknownRecord | undefined => {
    const data = grade.data?.data;
    if (data && typeof data === "object" && !Array.isArray(data)) {
      return data as UnknownRecord;
    }
    return undefined;
  }, [grade.data?.data]);

  const gradeModel = useMemo(() => {
    const topLine = gradeRaw ? asRecord(gradeRaw["topLineData"]) : undefined;
    const competitionData = gradeRaw ? asRecord(gradeRaw["competitionData"]) : undefined;
    const meta = gradeRaw ? asRecord(gradeRaw["meta"]) : undefined;
    const competitionNested = gradeRaw ? asRecord(gradeRaw["competition"]) : undefined;
    const association = gradeRaw ? asRecord(gradeRaw["association"]) : undefined;
    const associationFromCompetition = competitionData
      ? asRecord(competitionData["association"])
      : undefined;

    const competitionBreadcrumbLabel =
      (competitionData ? pickString(competitionData, ["competitionName"]) : undefined) ??
      resolveCompetitionTitle(gradeRaw, COMPETITION_ID);

    const displayName =
      (topLine ? pickString(topLine, ["gradeName"]) : undefined) ??
      (gradeRaw ? pickString(gradeRaw, ["name"]) : undefined) ??
      `Grade ${gradeId}`;

    const status =
      (competitionData ? pickString(competitionData, ["status"]) : undefined) ??
      (competitionNested ? pickString(competitionNested, ["status"]) : undefined) ??
      (meta ? pickString(meta, ["status"]) : undefined) ??
      "Unknown status";

    const { teams: teamsFromPayload, fixtures: fixturesFromPayload } = parseCounts(gradeRaw);
    const teamCount = teamsFromPayload;
    const fixtureCountListed = fixtureRows.length;
    const fixtureCount = fixturesFromPayload > 0 ? fixturesFromPayload : fixtureCountListed;

    const season =
      (competitionData ? pickString(competitionData, ["season"]) : undefined) ??
      (meta ? pickString(meta, ["season"]) : undefined);
    const associationName =
      (associationFromCompetition ? pickString(associationFromCompetition, ["name"]) : undefined) ??
      (association ? pickString(association, ["name"]) : undefined);
    const headerContextParts = [season, associationName].filter((p): p is string =>
      Boolean(p && p.length > 0),
    );
    const headerContextLine = headerContextParts.length > 0 ? headerContextParts.join(" - ") : null;

    const headerGradeMetaParts = [
      topLine ? pickString(topLine, ["gender"]) : undefined,
      topLine ? pickString(topLine, ["ageGroup"]) : undefined,
      topLine ? pickString(topLine, ["daysPlayed"]) : undefined,
    ].filter((p): p is string => Boolean(p && p.length > 0));
    const headerGradeMetaLine =
      headerGradeMetaParts.length > 0 ? headerGradeMetaParts.join(" - ") : null;

    const competitionIsActive = competitionData?.["isActive"];
    const gradeHeaderActive =
      typeof competitionIsActive === "boolean" ? competitionIsActive : /\bactive\b/i.test(status);

    return {
      competitionBreadcrumbLabel,
      displayName,
      status,
      teamCount,
      fixtureCount,
      headerContextLine,
      headerGradeMetaLine,
      gradeHeaderActive,
    };
  }, [gradeRaw, gradeId, fixtureRows.length]);

  const [fixtureSearchQuery, setFixtureSearchQuery] = useState("");
  const normalizedFixtureSearch = fixtureSearchQuery.trim().toLocaleLowerCase();
  const [filterTeam, setFilterTeam] = useState<string>(FILTER_ALL);
  const [filterVenue, setFilterVenue] = useState<string>(FILTER_ALL);
  const [filterDate, setFilterDate] = useState<string>(FILTER_ALL);
  const [filterStatus, setFilterStatus] = useState<string>(FILTER_ALL);

  const fixtureFilterOptions = useMemo(() => {
    const teamSet = new Set<string>();
    const venueSet = new Set<string>();
    const dateSet = new Set<string>();
    const statusEntries = new Map<string, string>();

    for (const f of fixtureRows) {
      const h = f.teams.home?.trim();
      const a = f.teams.away?.trim();
      if (h) {
        teamSet.add(h);
      }
      if (a) {
        teamSet.add(a);
      }
      const v = f.venue.ground?.trim();
      if (v) {
        venueSet.add(v);
      }
      const d = f.date?.trim();
      if (d) {
        dateSet.add(d);
      }
      const st = f.status?.trim() ?? "";
      if (st.length > 0) {
        statusEntries.set(st, st);
      } else {
        statusEntries.set(FILTER_STATUS_EMPTY, "No status");
      }
    }

    const sortLocale = (x: string, y: string) =>
      x.localeCompare(y, undefined, { sensitivity: "base" });

    const sortedTeams = [...teamSet].sort(sortLocale);
    const sortedVenues = [...venueSet].sort(sortLocale);
    const sortedDates = [...dateSet].sort((x, y) => {
      const tx = new Date(x).getTime();
      const ty = new Date(y).getTime();
      if (!Number.isNaN(tx) && !Number.isNaN(ty) && tx !== ty) {
        return tx - ty;
      }
      return sortLocale(x, y);
    });
    const sortedStatuses = [...statusEntries.entries()].sort((a, b) =>
      a[1].localeCompare(b[1], undefined, { sensitivity: "base" }),
    );

    return {
      teams: sortedTeams,
      venues: sortedVenues,
      dates: sortedDates,
      statuses: sortedStatuses,
    };
  }, [fixtureRows]);

  const filteredFixtureRows = useMemo(() => {
    return fixtureRows.filter((fixture) => {
      if (normalizedFixtureSearch.length > 0) {
        const searchable = [
          fixture.teams.home ?? "",
          fixture.teams.away ?? "",
          fixture.round ?? "",
          fixture.date ?? "",
          fixture.status ?? "",
          fixture.type ?? "",
          fixture.venue.ground ?? "",
          String(fixture.id),
        ]
          .join(" ")
          .toLocaleLowerCase();
        if (!searchable.includes(normalizedFixtureSearch)) {
          return false;
        }
      }

      if (filterTeam !== FILTER_ALL) {
        const home = fixture.teams.home?.trim() ?? "";
        const away = fixture.teams.away?.trim() ?? "";
        if (home !== filterTeam && away !== filterTeam) {
          return false;
        }
      }

      if (filterVenue !== FILTER_ALL) {
        const ground = fixture.venue.ground?.trim() ?? "";
        if (ground !== filterVenue) {
          return false;
        }
      }

      if (filterDate !== FILTER_ALL) {
        const raw = fixture.date?.trim() ?? "";
        if (raw !== filterDate) {
          return false;
        }
      }

      if (filterStatus !== FILTER_ALL) {
        const st = fixture.status?.trim() ?? "";
        if (filterStatus === FILTER_STATUS_EMPTY) {
          if (st.length > 0) {
            return false;
          }
        } else if (st !== filterStatus) {
          return false;
        }
      }

      return true;
    });
  }, [fixtureRows, normalizedFixtureSearch, filterTeam, filterVenue, filterDate, filterStatus]);

  const hasActiveFixtureFilters =
    filterTeam !== FILTER_ALL ||
    filterVenue !== FILTER_ALL ||
    filterDate !== FILTER_ALL ||
    filterStatus !== FILTER_ALL ||
    normalizedFixtureSearch.length > 0;

  const clearFixtureFilters = () => {
    setFixtureSearchQuery("");
    setFilterTeam(FILTER_ALL);
    setFilterVenue(FILTER_ALL);
    setFilterDate(FILTER_ALL);
    setFilterStatus(FILTER_ALL);
  };

  const frameTitle = gradeRaw
    ? gradeModel.displayName
    : `Season - Grade (canonical) #${gradeId || "?"}`;

  return (
    <SeasonRouteLabFrame
      title={frameTitle}
      description="Canonical grade detail and fixture listing under competition context."
      productionRoute={`${accountScopedRoutes.season(ACCOUNT_ID)}/competitions/${COMPETITION_ID}/grades/${gradeId || ":gradeId"}`}
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
                      {gradeModel.competitionBreadcrumbLabel}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="max-w-[min(100%,28rem)] truncate">
                    {gradeId ? gradeModel.displayName : "Grade"}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 space-y-2">
                <div className="flex flex-wrap items-start gap-3">
                  <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
                    {gradeModel.displayName}
                  </h1>
                  {!isPending && gradeRaw && gradeModel.status !== "Unknown status" ? (
                    <Badge
                      className={cn(
                        "shrink-0 border-transparent text-white hover:opacity-90",
                        gradeModel.gradeHeaderActive ? "bg-success-600" : "bg-error-600",
                      )}
                    >
                      {gradeModel.status}
                    </Badge>
                  ) : null}
                </div>
                {gradeModel.headerContextLine ? (
                  <p className="text-muted-foreground max-w-3xl text-sm">
                    {gradeModel.headerContextLine}
                  </p>
                ) : null}
                {gradeModel.headerGradeMetaLine ? (
                  <p className="text-muted-foreground max-w-3xl text-sm">
                    {gradeModel.headerGradeMetaLine}
                  </p>
                ) : null}
              </div>
              <div className="flex flex-col gap-2 sm:shrink-0 sm:flex-row sm:items-center">
                <Button variant="outline" asChild>
                  <Link href={COMPETITION_LAB_PATH}>Back</Link>
                </Button>
                <Button
                  variant="accent"
                  disabled={isFetching}
                  onClick={() => {
                    void grade.refetch();
                    void fixtures.refetch();
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
        `GET /api/season-hub/575/competitions/18031/grades/${gradeId || ":gradeId"}`,
        `GET /api/season-hub/575/competitions/18031/grades/${gradeId || ":gradeId"}/fixtures`,
      ]}
      onRefetch={() => {
        void grade.refetch();
        void fixtures.refetch();
      }}
      isFetching={isFetching}
    >
      <SeasonRouteLabStatus
        isPending={isPending}
        isError={isError}
        errorMessage={firstError instanceof Error ? firstError.message : "Request failed"}
        pendingLabel="Loading grade data..."
      />

      {!isPending && !isError ? (
        <div className="grid gap-6">
          <SectionDivider variant="labeled" label="Coverage summary" />
          <SectionBlock variant="inset" spacing="sm">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {(
                [
                  [gradeModel.teamCount, "Teams", Users],
                  [gradeModel.fixtureCount, "Fixtures", Calendar],
                ] as Array<[number, string, LucideIcon]>
              ).map(([value, label, Icon]) => (
                <Surface
                  key={label}
                  className="flex min-h-16 items-center justify-between gap-3 py-3 shadow-none"
                >
                  <div className="flex min-w-0 items-baseline gap-3">
                    <span className="text-2xl leading-none font-bold tabular-nums">{value}</span>
                    <span className="text-muted-foreground truncate text-sm font-semibold tracking-tight uppercase">
                      {label}
                    </span>
                  </div>
                  <Icon className="text-primary size-4 shrink-0" aria-hidden />
                </Surface>
              ))}
            </div>
          </SectionBlock>

          <SectionDivider variant="labeled" label="Fixtures" />
          <SectionBlock variant="inset" spacing="sm">
            <div>
              <p className="text-sm font-semibold">Fixtures</p>
              <p className="text-muted-foreground mt-1 text-xs">
                Filter fixtures in the toolbar, then open a row for fixture-level drill-down data.
              </p>
            </div>
            <div className="bg-background border-primary/10 overflow-hidden rounded-lg border">
              <div className="bg-muted/35 flex flex-col gap-4 border-b px-4 py-3">
                <div className="flex flex-col items-stretch justify-between gap-4 sm:flex-row sm:items-center">
                  <div className="relative w-full sm:max-w-80">
                    <Search
                      className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4"
                      aria-hidden
                    />
                    <Input
                      value={fixtureSearchQuery}
                      onChange={(event) => setFixtureSearchQuery(event.target.value)}
                      placeholder="Search fixtures..."
                      className="h-9 rounded-lg pl-10"
                      aria-label="Search fixtures"
                    />
                  </div>
                  <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-end">
                    {hasActiveFixtureFilters ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-9 shrink-0"
                        onClick={clearFixtureFilters}
                      >
                        Clear filters
                      </Button>
                    ) : null}
                    <p className="text-muted-foreground text-sm sm:text-right">
                      Showing {filteredFixtureRows.length} of {fixtureRows.length} fixtures
                    </p>
                  </div>
                </div>
                {fixtureRows.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-1.5">
                      <p className="text-muted-foreground text-xs font-medium">Team</p>
                      <Select value={filterTeam} onValueChange={setFilterTeam}>
                        <SelectTrigger className="h-9 w-full" aria-label="Filter by team">
                          <SelectValue placeholder="All teams" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={FILTER_ALL}>All teams</SelectItem>
                          {fixtureFilterOptions.teams.map((name) => (
                            <SelectItem key={name} value={name}>
                              {name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-muted-foreground text-xs font-medium">Venue</p>
                      <Select value={filterVenue} onValueChange={setFilterVenue}>
                        <SelectTrigger className="h-9 w-full" aria-label="Filter by venue">
                          <SelectValue placeholder="All venues" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={FILTER_ALL}>All venues</SelectItem>
                          {fixtureFilterOptions.venues.map((name) => (
                            <SelectItem key={name} value={name}>
                              {name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-muted-foreground text-xs font-medium">Date</p>
                      <Select value={filterDate} onValueChange={setFilterDate}>
                        <SelectTrigger className="h-9 w-full" aria-label="Filter by date">
                          <SelectValue placeholder="All dates" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={FILTER_ALL}>All dates</SelectItem>
                          {fixtureFilterOptions.dates.map((raw) => (
                            <SelectItem key={raw} value={raw}>
                              {formatFixtureDateDisplay(raw)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-muted-foreground text-xs font-medium">Status</p>
                      <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="h-9 w-full" aria-label="Filter by status">
                          <SelectValue placeholder="All statuses" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={FILTER_ALL}>All statuses</SelectItem>
                          {fixtureFilterOptions.statuses.map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ) : null}
              </div>
              {fixtureRows.length === 0 ? (
                <div className="px-4 py-8">
                  <p className="text-muted-foreground text-sm">
                    No fixtures returned for this grade.
                  </p>
                </div>
              ) : filteredFixtureRows.length === 0 ? (
                <div className="px-4 py-8">
                  <p className="text-muted-foreground text-sm">
                    No fixtures match the current filter.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-primary-950 hover:bg-primary-950 border-b border-white/15">
                      <TableHead className="min-w-36 text-white/90">Date &amp; round</TableHead>
                      <TableHead className="text-white/90">Type</TableHead>
                      <TableHead className="text-white/90">Home</TableHead>
                      <TableHead className="text-white/90">Away</TableHead>
                      <TableHead className="text-white/90">Venue</TableHead>
                      <TableHead className="text-white/90">Status</TableHead>
                      <TableHead className="text-right text-white/90">View Fixture</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFixtureRows.map((fixture) => {
                      const home = fixture.teams.home ?? "—";
                      const away = fixture.teams.away ?? "—";
                      const dateLabel = formatFixtureDateDisplay(fixture.date);
                      const typeLabel =
                        fixture.type != null && String(fixture.type).trim() !== ""
                          ? fixture.type
                          : "—";
                      const statusRaw = fixture.status ?? "";
                      const fixtureHref = `/sandbox/route-lab/season/575/competitions/18031/grades/${gradeId}/fixtures/${fixture.id}`;

                      return (
                        <TableRow
                          key={fixture.id}
                          className="hover:bg-primary/5 cursor-pointer transition-colors"
                        >
                          <TableCell className="align-top">
                            <div className="flex max-w-52 flex-col gap-0.5">
                              <span className="text-muted-foreground truncate text-xs leading-snug">
                                {fixture.round != null && String(fixture.round).trim() !== ""
                                  ? fixture.round
                                  : "—"}
                              </span>
                              <span className="text-sm leading-snug font-medium">{dateLabel}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground max-w-36 truncate text-sm">
                            {typeLabel}
                          </TableCell>
                          <TableCell className="max-w-40 truncate text-sm font-medium">
                            {home}
                          </TableCell>
                          <TableCell className="max-w-40 truncate text-sm font-medium">
                            {away}
                          </TableCell>
                          <TableCell className="text-muted-foreground max-w-48 truncate text-sm">
                            {fixture.venue.ground ?? "—"}
                          </TableCell>
                          <TableCell>
                            {statusRaw.length === 0 ? (
                              <span className="text-muted-foreground text-sm">—</span>
                            ) : (
                              <Badge
                                className={cn(
                                  "border-transparent text-white hover:opacity-90",
                                  fixtureStatusBadgeClass(statusRaw),
                                )}
                              >
                                {statusRaw}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="compact" asChild>
                              <Link href={fixtureHref}>View Fixture</Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </div>
          </SectionBlock>

          <SeasonRouteLabPayloadCard
            title="Debugging: grade payload"
            payload={grade.data?.data ?? null}
          />
          <SeasonRouteLabPayloadCard
            title={`Fixtures debug (reversed: ${fixturesReversed.length} rows, bottom of list → top)`}
            payload={fixturesReversed}
          />
        </div>
      ) : null}
    </SeasonRouteLabFrame>
  );
}
