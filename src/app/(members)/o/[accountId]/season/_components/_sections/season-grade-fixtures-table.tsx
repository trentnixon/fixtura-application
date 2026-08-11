"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

import {
  buildSeasonFixtureHref,
  buildSeasonFixtureListDisplayRow,
  fixtureStatusBadgeClass,
} from "../_utils";

import type { SeasonGradeFixturesTableProps } from "../_types";

export function SeasonGradeFixturesTable({
  accountId,
  competitionId,
  gradeId,
  filteredRows,
}: SeasonGradeFixturesTableProps) {
  return (
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
        {filteredRows.map((fixture) => {
          const { home, away, dateLabel, roundLabel, typeLabel, statusRaw, venueLabel } =
            buildSeasonFixtureListDisplayRow(fixture);
          const fixtureHref = buildSeasonFixtureHref(accountId, competitionId, gradeId, fixture.id);

          return (
            <TableRow
              key={fixture.id}
              className="hover:bg-primary/5 cursor-pointer transition-colors"
            >
              <TableCell className="align-top">
                <div className="flex max-w-52 flex-col gap-0.5">
                  <span className="text-muted-foreground truncate text-xs leading-snug">
                    {roundLabel}
                  </span>
                  <span className="text-sm leading-snug font-medium">{dateLabel}</span>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground max-w-36 truncate text-sm">
                {typeLabel}
              </TableCell>
              <TableCell className="max-w-40 truncate text-sm font-medium">{home}</TableCell>
              <TableCell className="max-w-40 truncate text-sm font-medium">{away}</TableCell>
              <TableCell className="text-muted-foreground max-w-48 truncate text-sm">
                {venueLabel}
              </TableCell>
              <TableCell>
                {statusRaw.length === 0 ? (
                  <span className="text-muted-foreground text-sm">-</span>
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
  );
}
