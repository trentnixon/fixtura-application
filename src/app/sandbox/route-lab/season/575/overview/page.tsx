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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useSeasonHubCompetitions,
  useSeasonHubRecon,
  useSeasonHubStats,
} from "@/lib/api/hooks/season-hub";
import { ROUTES } from "@/lib/config/routes";
import { cn } from "@/lib/utils";

import {
  SeasonRouteLabFrame,
  SeasonRouteLabRowLink,
  SeasonRouteLabStatus,
} from "../_components/season-route-lab-frame";

const ACCOUNT_ID = "575";

export default function RouteLabSeasonOverviewPage() {
  const recon = useSeasonHubRecon(ACCOUNT_ID);
  const stats = useSeasonHubStats(ACCOUNT_ID);
  const competitions = useSeasonHubCompetitions(ACCOUNT_ID, { page: 1, pageSize: 25 });

  const isPending = recon.isPending || stats.isPending || competitions.isPending;
  const isFetching = recon.isFetching || stats.isFetching || competitions.isFetching;
  const isError = recon.isError || stats.isError || competitions.isError;
  const firstError = recon.error ?? stats.error ?? competitions.error;
  const statsData = stats.data?.data;
  const sortedCompetitionRows = useMemo(
    () =>
      [...(competitions.data?.data ?? [])].sort((a, b) =>
        (a.name ?? "").localeCompare(b.name ?? "", undefined, { sensitivity: "base" }),
      ),
    [competitions.data?.data],
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const statusOptions = useMemo(() => {
    const statusSet = new Set<string>();

    for (const competition of sortedCompetitionRows) {
      statusSet.add(competition.status ?? "Unknown");
    }

    const sortLabels = (a: string, b: string) =>
      a.localeCompare(b, undefined, { sensitivity: "base" });

    return [...statusSet].sort(sortLabels);
  }, [sortedCompetitionRows]);

  const normalizedSearch = searchQuery.trim().toLocaleLowerCase();

  const filteredCompetitionRows = useMemo(() => {
    return sortedCompetitionRows.filter((competition) => {
      const statusLabel = competition.status ?? "Unknown";
      const seasonLabel = competition.season ?? "No season";
      const associationLabel = competition.association.name ?? "Association";

      const searchable = [competition.name ?? "", seasonLabel, associationLabel, statusLabel]
        .join(" ")
        .toLocaleLowerCase();

      const matchesSearch = normalizedSearch.length === 0 || searchable.includes(normalizedSearch);
      const matchesStatus = statusFilter === "all" || statusLabel === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [normalizedSearch, sortedCompetitionRows, statusFilter]);

  const hasActiveFilters = searchQuery.trim().length > 0 || statusFilter !== "all";

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
  };

  return (
    <SeasonRouteLabFrame
      title="Season - Overview"
      header={
        <header className="border-border border-b pb-6">
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
                  <BreadcrumbPage>Season · 575 · Overview</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            {/* page.header.actions.trailing @see sandbox/kitchen-sink/page-headers/_sections/actions.tsx */}
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
                  Season overview
                </h1>
                <p className="text-muted-foreground max-w-3xl text-sm">
                  Review everything Fixtura is currently tracking for this season, confirm your
                  competitions/grades/teams/fixtures coverage, and prepare to request fixture,
                  competition, or grade lookups.
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Button
                  variant="outline"
                  onClick={() => {
                    void recon.refetch();
                    void stats.refetch();
                    void competitions.refetch();
                  }}
                >
                  <RefreshCw className="size-4" aria-hidden />
                  Refresh
                </Button>
                <Button
                  variant="accent"
                  disabled={isFetching}
                  onClick={() => {
                    void recon.refetch();
                    void stats.refetch();
                    void competitions.refetch();
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
        "GET /api/season-hub/575/recon",
        "GET /api/season-hub/575/stats",
        "GET /api/season-hub/575/competitions?page=1&pageSize=25",
      ]}
      onRefetch={() => {
        void recon.refetch();
        void stats.refetch();
        void competitions.refetch();
      }}
      isFetching={isFetching}
    >
      <SeasonRouteLabStatus
        isPending={isPending}
        isError={isError}
        errorMessage={firstError instanceof Error ? firstError.message : "Request failed"}
        pendingLabel="Loading tracked season coverage..."
      />

      {!isPending && !isError ? (
        <div className="grid gap-6">
          <SectionDivider variant="labeled" label="Season summary" />

          <SectionBlock variant="inset" spacing="sm">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Surface className="flex min-h-16 items-center gap-3 py-3 shadow-none">
                <span className="text-2xl leading-none font-bold tabular-nums">
                  {recon.data?.data.counts.competitions ?? 0}
                </span>
                <span className="text-muted-foreground truncate text-sm font-semibold tracking-tight uppercase">
                  Competitions
                </span>
              </Surface>

              <Surface className="flex min-h-16 items-center gap-3 py-3 shadow-none">
                <span className="text-2xl leading-none font-bold tabular-nums">
                  {recon.data?.data.counts.grades ?? 0}
                </span>
                <span className="text-muted-foreground truncate text-sm font-semibold tracking-tight uppercase">
                  Grades
                </span>
              </Surface>

              <Surface className="flex min-h-16 items-center gap-3 py-3 shadow-none">
                <span className="text-2xl leading-none font-bold tabular-nums">
                  {statsData?.summary.teams ?? 0}
                </span>
                <span className="text-muted-foreground truncate text-sm font-semibold tracking-tight uppercase">
                  Teams
                </span>
              </Surface>

              <Surface className="flex min-h-16 items-center gap-3 py-3 shadow-none">
                <span className="text-2xl leading-none font-bold tabular-nums">
                  {statsData?.summary.fixtures ?? 0}
                </span>
                <span className="text-muted-foreground truncate text-sm font-semibold tracking-tight uppercase">
                  Fixtures
                </span>
              </Surface>
            </div>
          </SectionBlock>
          <SectionDivider variant="labeled" label="Tracked Competitions" />

          <SectionBlock variant="inset" spacing="sm">
            <div>
              <p className="text-sm font-semibold">Tracked Competitions</p>
              <p className="text-muted-foreground mt-1 text-xs">
                Use this section to verify Fixtura has the competitions and grade structure you need
                before raising lookup requests.
              </p>
            </div>
            <div className="flex justify-end">
              <p className="text-muted-foreground text-xs">
                Showing {filteredCompetitionRows.length} of {sortedCompetitionRows.length}{" "}
                competitions
              </p>
            </div>
            <div className="grid gap-3 lg:grid-cols-[minmax(220px,1fr)_auto]">
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by name, season, association, status"
                aria-label="Search competitions"
              />
              <div className="flex items-center gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {hasActiveFilters ? (
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    Clear filters
                  </Button>
                ) : null}
              </div>
            </div>
            {sortedCompetitionRows.length === 0 ? (
              <div>
                <p className="text-muted-foreground text-sm">
                  No competitions are currently being tracked for account 575.
                </p>
              </div>
            ) : filteredCompetitionRows.length === 0 ? (
              <div className="space-y-3">
                <p className="text-muted-foreground text-sm">
                  No competitions match the current filters.
                </p>
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {filteredCompetitionRows.map((competition) => {
                  const statusLabel = competition.status ?? "Unknown";
                  const isActive = /\bactive\b/i.test(statusLabel);
                  return (
                    <Card key={`summary-${competition.id}`} className="gap-0 overflow-hidden p-0">
                      <CardHeader className="bg-primary-950 border-b border-white/15 pt-6 pb-6 text-white">
                        <CardAction>
                          <ShieldCheck className="size-5 text-white" aria-hidden />
                        </CardAction>
                        <p className="text-xl leading-none font-semibold text-white">
                          {competition.name}
                        </p>
                        <p className="text-sm text-white/80">
                          {competition.season ?? "No season"} ·{" "}
                          {competition.association.name ?? "Association"}
                        </p>
                      </CardHeader>
                      <CardContent className="space-y-5 py-6">
                        <div className="flex justify-end">
                          <Badge
                            className={cn(
                              "border-transparent text-white hover:opacity-90",
                              isActive ? "bg-success-600" : "bg-error-600",
                            )}
                          >
                            {statusLabel}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                          {(
                            [
                              [competition.counts.grades, "Grades", Layers],
                              [competition.counts.teams, "Teams", Users],
                              [competition.counts.fixtures, "Fixtures", Calendar],
                            ] as Array<[number, string, LucideIcon]>
                          ).map(([value, label, Icon]) => (
                            <Surface
                              key={`${competition.id}-${label}`}
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
                          href="/sandbox/route-lab/season/575/competitions/18031"
                          title="Review competition coverage"
                          subtitle="Open this competition to confirm tracked grades, teams, and fixtures."
                        />
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            )}
          </SectionBlock>
        </div>
      ) : null}
    </SeasonRouteLabFrame>
  );
}
