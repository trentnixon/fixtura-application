"use client";

import {
  Calendar,
  Layers,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import {
  extractCompetitionTitle,
  resolveCompetitionTitle,
} from "@/app/(members)/o/[accountId]/season/_components/_utils/season-competition";
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
import { Card, CardAction, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Surface } from "@/components/ui/container";
import { Input } from "@/components/ui/input";
import { SectionBlock, SectionDivider } from "@/components/ui/section";
import { useSeasonHubCompetition, useSeasonHubCompetitionGrades } from "@/lib/api/hooks/season-hub";
import { ROUTES } from "@/lib/config/routes";
import { cn } from "@/lib/utils";

import {
  SeasonRouteLabFrame,
  SeasonRouteLabPayloadCard,
  SeasonRouteLabRowLink,
  SeasonRouteLabStatus,
} from "../../_components/season-route-lab-frame";

import type { UnknownRecord } from "@/app/(members)/o/[accountId]/season/_components/_types";

const ACCOUNT_ID = "575";
const COMPETITION_ID = "18031";

function asRecord(value: unknown): UnknownRecord | undefined {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as UnknownRecord;
  }
  return undefined;
}

/** `YYYY-MM-DD` from season-hub -> readable local date (e.g. 31 Mar 2026). */
function formatSeasonHubDate(isoDate: string | undefined): string | undefined {
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

type CompetitionData = {
  name?: string;
  season?: string;
  status?: string;
  association?: { name?: string };
  meta?: UnknownRecord;
  counts?: { grades?: number; teams?: number; fixtures?: number };
};

export default function RouteLabSeasonCompetitionPage() {
  const competition = useSeasonHubCompetition(ACCOUNT_ID, COMPETITION_ID, { enabled: true });
  const grades = useSeasonHubCompetitionGrades(ACCOUNT_ID, COMPETITION_ID, { enabled: true });

  const isPending = competition.isPending || grades.isPending;
  const isFetching = competition.isFetching || grades.isFetching;
  const isError = competition.isError || grades.isError;
  const firstError = competition.error ?? grades.error;
  const competitionData = (competition.data?.data ?? null) as CompetitionData | null;
  const competitionRaw: UnknownRecord | undefined =
    competitionData && typeof competitionData === "object"
      ? (competitionData as UnknownRecord)
      : undefined;
  const metaRecord = asRecord(competitionRaw?.["meta"]);
  const competitionStatus =
    (metaRecord ? pickString(metaRecord, ["status"]) : undefined) ??
    competitionData?.status ??
    "Unknown status";
  const gradeCount = competitionData?.counts?.grades ?? 0;
  const teamCount = competitionData?.counts?.teams ?? 0;
  const fixtureCount = competitionData?.counts?.fixtures ?? 0;

  const gradeRows = (grades.data?.data ?? []).map((row, index) => {
    const parsed = row as {
      id?: number | string;
      name?: string;
      gender?: string;
      ageGroup?: string;
      counts?: { teams?: number; fixtures?: number };
      competition?: { status?: string; name?: string };
    };
    return {
      id: String(parsed.id ?? `unknown-${index}`),
      name: parsed.name ?? "Unnamed grade",
      gender: parsed.gender ?? "Unknown gender",
      ageGroup: parsed.ageGroup ?? "Unknown age group",
      teamCount: parsed.counts?.teams ?? 0,
      fixtureCount: parsed.counts?.fixtures ?? 0,
      status: parsed.competition?.status ?? competitionStatus,
      competitionName:
        typeof parsed.competition?.name === "string" && parsed.competition.name.trim().length > 0
          ? parsed.competition.name.trim()
          : undefined,
    };
  });
  const gradeCountFromRows = gradeRows.length;
  const teamCountFromRows = gradeRows.reduce((total, grade) => total + grade.teamCount, 0);
  const fixtureCountFromRows = gradeRows.reduce((total, grade) => total + grade.fixtureCount, 0);
  const statGradeCount = gradeCountFromRows || gradeCount;
  const statTeamCount = teamCountFromRows || teamCount;
  const statFixtureCount = fixtureCountFromRows || fixtureCount;
  const [gradeSearchQuery, setGradeSearchQuery] = useState("");
  const normalizedGradeSearch = gradeSearchQuery.trim().toLocaleLowerCase();
  const filteredGradeRows = useMemo(() => {
    if (normalizedGradeSearch.length === 0) {
      return gradeRows;
    }
    return gradeRows.filter((grade) => {
      const searchable = [grade.name, grade.gender, grade.ageGroup, String(grade.status)]
        .join(" ")
        .toLocaleLowerCase();
      return searchable.includes(normalizedGradeSearch);
    });
  }, [gradeRows, normalizedGradeSearch]);

  const competitionPageTitle =
    extractCompetitionTitle(competitionRaw) ??
    gradeRows.find((g) => g.competitionName)?.competitionName ??
    resolveCompetitionTitle(competitionRaw, COMPETITION_ID);

  const competitionMeta = useMemo(() => {
    if (!competitionRaw) {
      return null;
    }
    const meta = asRecord(competitionRaw["meta"]);
    const association = asRecord(competitionRaw["association"]);
    const timeframe = meta ? asRecord(meta["timeframe"]) : undefined;
    if (!meta && !association) {
      return null;
    }
    return {
      season: meta ? pickString(meta, ["season"]) : undefined,
      status: meta ? pickString(meta, ["status"]) : undefined,
      isActive: typeof meta?.["isActive"] === "boolean" ? meta["isActive"] : undefined,
      timeframeStart: timeframe ? pickString(timeframe, ["start"]) : undefined,
      timeframeEnd: timeframe ? pickString(timeframe, ["end"]) : undefined,
      associationName: association ? pickString(association, ["name"]) : undefined,
    };
  }, [competitionRaw]);

  const headerContextLine = useMemo(() => {
    const parts = [competitionMeta?.season, competitionMeta?.associationName].filter(
      (p): p is string => Boolean(p && p.length > 0),
    );
    return parts.length > 0 ? parts.join(" - ") : null;
  }, [competitionMeta?.associationName, competitionMeta?.season]);

  const timeframeLine = useMemo(() => {
    const { timeframeStart: start, timeframeEnd: end } = competitionMeta ?? {};
    const startLabel = formatSeasonHubDate(start);
    const endLabel = formatSeasonHubDate(end);
    if (startLabel && endLabel) {
      return `${startLabel} - ${endLabel}`;
    }
    if (startLabel) {
      return `From ${startLabel}`;
    }
    if (endLabel) {
      return `Until ${endLabel}`;
    }
    return null;
  }, [competitionMeta]);

  const competitionHeaderActive =
    typeof competitionMeta?.isActive === "boolean"
      ? competitionMeta.isActive
      : /\bactive\b/i.test(competitionStatus);

  return (
    <SeasonRouteLabFrame
      title={competitionPageTitle}
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
                    <Link href="/sandbox/route-lab/season/575/overview">Season overview</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="max-w-[min(100%,28rem)] truncate">
                    {competitionPageTitle}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            {/* page.header.actions.trailing @see sandbox/kitchen-sink/page-headers/_sections/actions.tsx */}
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 space-y-2">
                <div className="flex flex-wrap items-start gap-3">
                  <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
                    {competitionPageTitle}
                  </h1>
                  {competitionMeta &&
                  (competitionMeta.status || typeof competitionMeta.isActive === "boolean") ? (
                    <Badge
                      className={cn(
                        "shrink-0 border-transparent text-white hover:opacity-90",
                        competitionHeaderActive ? "bg-success-600" : "bg-error-600",
                      )}
                    >
                      {competitionMeta.status ??
                        (competitionMeta.isActive === true
                          ? "Active"
                          : competitionMeta.isActive === false
                            ? "Inactive"
                            : competitionStatus)}
                    </Badge>
                  ) : null}
                </div>
                {headerContextLine ? (
                  <p className="text-muted-foreground max-w-3xl text-sm">{headerContextLine}</p>
                ) : null}
                {timeframeLine ? (
                  <p className="text-muted-foreground max-w-3xl text-sm">
                    <span className="text-foreground font-medium">Season dates: </span>
                    {timeframeLine}
                  </p>
                ) : null}
              </div>
              <div className="flex flex-col gap-2 sm:shrink-0 sm:flex-row sm:items-center">
                <Button variant="outline" asChild>
                  <Link href="/sandbox/route-lab/season/575/overview">Back</Link>
                </Button>
                <Button
                  variant="accent"
                  disabled={isFetching}
                  onClick={() => {
                    void competition.refetch();
                    void grades.refetch();
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
        "GET /api/season-hub/575/competitions/18031",
        "GET /api/season-hub/575/competitions/18031/grades",
      ]}
      onRefetch={() => {
        void competition.refetch();
        void grades.refetch();
      }}
      isFetching={isFetching}
    >
      <SeasonRouteLabStatus
        isPending={isPending}
        isError={isError}
        errorMessage={firstError instanceof Error ? firstError.message : "Request failed"}
        pendingLabel="Loading competition data..."
      />

      {!isPending && !isError ? (
        <div className="grid gap-6">
          <SectionDivider variant="labeled" label="Coverage summary" />
          <SectionBlock variant="inset" spacing="sm">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {(
                [
                  [statGradeCount, "Grades", Layers],
                  [statTeamCount, "Teams", Users],
                  [statFixtureCount, "Fixtures", Calendar],
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

          <SectionDivider variant="labeled" label="Tracked grades" />
          <SectionBlock variant="inset" spacing="sm">
            <div>
              <p className="text-sm font-semibold">Tracked grades</p>
              <p className="text-muted-foreground mt-1 text-xs">
                Open a grade to confirm teams, fixtures, and fixture-level drill-downs for this
                competition.
              </p>
            </div>
            <div className="flex justify-end">
              <p className="text-muted-foreground text-xs">
                Showing {filteredGradeRows.length} of {gradeRows.length} grades
              </p>
            </div>
            <Input
              value={gradeSearchQuery}
              onChange={(event) => setGradeSearchQuery(event.target.value)}
              placeholder="Search by name, gender, age group, status"
              aria-label="Search grades"
            />
            {gradeRows.length === 0 ? (
              <div>
                <p className="text-muted-foreground text-sm">
                  No grades returned for this competition.
                </p>
              </div>
            ) : filteredGradeRows.length === 0 ? (
              <div>
                <p className="text-muted-foreground text-sm">No grades match the current search.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {filteredGradeRows.map((grade) => {
                  const gradeIsActive = /\bactive\b/i.test(String(grade.status));
                  return (
                    <Card key={`summary-${grade.id}`} className="gap-0 overflow-hidden p-0">
                      <CardHeader className="bg-primary-950 border-b border-white/15 pt-6 pb-6 text-white">
                        <CardAction>
                          <ShieldCheck className="size-5 text-white" aria-hidden />
                        </CardAction>
                        <p className="text-xl leading-none font-semibold text-white">
                          {grade.name}
                        </p>
                        <p className="text-sm text-white/80">
                          Grade #{grade.id} - {grade.gender} - {grade.ageGroup}
                        </p>
                      </CardHeader>
                      <CardContent className="space-y-5 py-6">
                        <div className="flex justify-end">
                          <Badge
                            className={cn(
                              "border-transparent text-white hover:opacity-90",
                              gradeIsActive ? "bg-success-600" : "bg-error-600",
                            )}
                          >
                            {grade.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          {(
                            [
                              [grade.teamCount, "Teams", Users],
                              [grade.fixtureCount, "Fixtures", Calendar],
                            ] as Array<[string | number, string, LucideIcon]>
                          ).map(([value, label, Icon]) => (
                            <Surface
                              key={`${grade.id}-${label}`}
                              className="bg-primary/5 ring-primary/10 flex min-h-16 items-center justify-between gap-4 py-3 shadow-none ring-1"
                            >
                              <div className="flex min-w-0 items-baseline gap-3">
                                <span className="text-primary text-2xl leading-none font-bold tabular-nums">
                                  {value}
                                </span>
                                <span className="text-muted-foreground truncate text-sm font-semibold tracking-tight uppercase">
                                  {label}
                                </span>
                              </div>
                              <Icon className="text-primary size-4 shrink-0" aria-hidden />
                            </Surface>
                          ))}
                        </div>
                      </CardContent>
                      <CardFooter className="flex w-full min-w-0 flex-col items-stretch gap-0 border-t pt-6 pb-6">
                        <SeasonRouteLabRowLink
                          href={`/sandbox/route-lab/season/575/competitions/18031/grades/${grade.id}`}
                          title="Open grade"
                          subtitle={`Continue route for ${grade.name}.`}
                        />
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            )}
          </SectionBlock>

          <SeasonRouteLabPayloadCard
            title="Debugging: competition payload"
            payload={competitionData ?? null}
          />
        </div>
      ) : null}
    </SeasonRouteLabFrame>
  );
}
