"use client";

import { format } from "date-fns";

import { TypographyMuted } from "@/components/typography";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import type { CalendarDisplayEvent } from "../_types/fixture-calendar.types";

type SelectedDateFixturesProps = {
  selectedDate: string | null;
  fixtures: CalendarDisplayEvent[];
  onFixtureSelect: (fixture: CalendarDisplayEvent) => void;
};

function formatTimeLabel(fixture: CalendarDisplayEvent) {
  if (!fixture.start) {
    return "All day";
  }

  return format(new Date(fixture.start), "h:mm a");
}

function groupFixturesByGrade(fixtures: CalendarDisplayEvent[]) {
  const grouped = new Map<string, number>();

  for (const fixture of fixtures) {
    if (fixture.eventType !== "fixture") {
      continue;
    }

    grouped.set(fixture.extendedProps.grade, (grouped.get(fixture.extendedProps.grade) ?? 0) + 1);
  }

  return [...grouped.entries()].map(([grade, count]) => ({ grade, count }));
}

function SelectedDateEventRow({
  fixture,
  onSelect,
}: {
  fixture: CalendarDisplayEvent;
  onSelect: (fixture: CalendarDisplayEvent) => void;
}) {
  const title = fixture.eventType === "fixture" ? fixture.extendedProps.grade : "Bundle created";
  const description =
    fixture.eventType === "fixture"
      ? `${fixture.extendedProps.homeTeam} vs ${fixture.extendedProps.awayTeam}`
      : fixture.extendedProps.bundleName;

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={() => onSelect(fixture)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(fixture);
        }
      }}
      className="focus-visible:ring-ring/50 cursor-pointer gap-0 py-0 transition hover:-translate-y-px hover:shadow-2xl focus-visible:ring-2 focus-visible:outline-none"
    >
      <CardContent className="space-y-3 p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="space-y-1">
            <div className="font-medium">{title}</div>
            <TypographyMuted className="text-foreground/80 text-sm">{description}</TypographyMuted>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">
              {fixture.eventType === "fixture" ? "Fixture" : "Production"}
            </Badge>
          </div>
        </div>
        <div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-xs">
          <span>{formatTimeLabel(fixture)}</span>
          {fixture.eventType === "fixture" ? (
            <>
              {fixture.extendedProps.venue ? <span>{fixture.extendedProps.venue}</span> : null}
              {fixture.extendedProps.round ? <span>{fixture.extendedProps.round}</span> : null}
            </>
          ) : (
            <>
              {fixture.extendedProps.channel ? <span>{fixture.extendedProps.channel}</span> : null}
              {fixture.extendedProps.productionWindow ? (
                <span>{fixture.extendedProps.productionWindow}</span>
              ) : null}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function SelectedDateFixtures({
  selectedDate,
  fixtures,
  onFixtureSelect,
}: SelectedDateFixturesProps) {
  const formattedDate = selectedDate ? format(new Date(selectedDate), "EEEE, d MMMM yyyy") : null;
  const groupedFixtureCounts = groupFixturesByGrade(fixtures);

  return (
    <Card className="h-full">
      <CardHeader className="border-b">
        <CardTitle>Selected Date Events</CardTitle>
        <CardDescription>
          {formattedDate
            ? `Companion list for ${formattedDate}.`
            : "Click a date in the calendar to inspect that day's fixtures and production events."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 pt-6">
        {selectedDate && groupedFixtureCounts.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {groupedFixtureCounts.map(({ grade, count }) => (
              <Badge key={grade} variant="default">
                {grade}: {count}
              </Badge>
            ))}
          </div>
        ) : null}
        {selectedDate ? (
          fixtures.length > 0 ? (
            fixtures.map((fixture) => (
              <SelectedDateEventRow key={fixture.id} fixture={fixture} onSelect={onFixtureSelect} />
            ))
          ) : (
            <div className="text-muted-foreground rounded-xl border border-dashed p-4 text-sm">
              No fixture or production events on this date in the current hardcoded dataset.
            </div>
          )
        ) : (
          <div className="text-muted-foreground rounded-xl border border-dashed p-4 text-sm">
            Use the month, list, week, or multi-month views to explore fixtures and bundle
            productions in different densities, then click a date to populate this panel.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
