"use client";

import { useState } from "react";

import {
  TypographyEyebrow,
  TypographyMetricLabel,
  TypographyMetricValue,
  TypographyMuted,
} from "@/components/typography";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Container, PageHeader } from "@/components/ui/container";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

import { FixtureCalendar } from "./fixture-calendar";
import { FixtureDetailDialog } from "./fixture-detail-dialog";
import { SelectedDateFixtures } from "./selected-date-fixtures";
import { fixtureEvents } from "../_data/fixture-events";

import type {
  CalendarDisplayEvent,
  CalendarEventStatus,
  CalendarEventType,
} from "../_types/fixture-calendar.types";

const eventTypeOrder: CalendarEventType[] = ["fixture", "bundle-production"];
const statusOrder: CalendarEventStatus[] = [
  "scheduled",
  "completed",
  "postponed",
  "abandoned",
  "pending",
  "processing",
  "complete",
];

function groupFixturesByGrade(events: CalendarDisplayEvent[]) {
  const grouped = new Map<string, number>();

  for (const event of events) {
    if (event.eventType !== "fixture") {
      continue;
    }

    grouped.set(event.extendedProps.grade, (grouped.get(event.extendedProps.grade) ?? 0) + 1);
  }

  return [...grouped.entries()].map(([grade, count]) => ({ grade, count }));
}

function eventOccursOnDate(event: CalendarDisplayEvent, selectedDate: string) {
  const selectedStart = new Date(`${selectedDate}T00:00:00`);
  const selectedEnd = new Date(`${selectedDate}T23:59:59`);
  const eventStart = new Date(event.start ?? `${event.date}T00:00:00`);
  const eventEnd = new Date(event.end ?? event.start ?? `${event.date}T23:59:59`);

  return eventStart <= selectedEnd && eventEnd >= selectedStart;
}

export function CalendarDisplayLab() {
  const [selectedFixture, setSelectedFixture] = useState<CalendarDisplayEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [activeEventType, setActiveEventType] = useState<CalendarEventType | "all">("all");

  const visibleEvents =
    activeEventType === "all"
      ? fixtureEvents
      : fixtureEvents.filter((event) => event.eventType === activeEventType);

  const selectedDateFixtures = selectedDate
    ? visibleEvents.filter((event) => eventOccursOnDate(event, selectedDate))
    : [];

  const typeCounts = eventTypeOrder.map((eventType) => ({
    eventType,
    count: fixtureEvents.filter((event) => event.eventType === eventType).length,
  }));
  const selectedDateFixtureGradeCounts = groupFixturesByGrade(selectedDateFixtures);

  const statusCounts = statusOrder
    .map((status) => ({
      status,
      count: visibleEvents.filter((event) => event.extendedProps.status === status).length,
    }))
    .filter(({ count }) => count > 0);

  return (
    <Container className="space-y-8 py-8">
      <PageHeader
        title="Calendar Display Lab"
        description="Testing FullCalendar as a hardcoded weekend schedule display for Fixtura. This second pass mixes weekend fixtures with bundle production dates so we can test match and content operations in the same calendar without connecting to any account data yet."
      >
        <TypographyEyebrow as="span">Schedule display</TypographyEyebrow>
      </PageHeader>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <div className="space-y-4">
            <ToggleGroup
              type="single"
              value={activeEventType}
              onValueChange={(value) => {
                if (value) {
                  setActiveEventType(value as CalendarEventType | "all");
                }
              }}
              variant="outline"
              size="sm"
              className="flex flex-wrap"
            >
              <ToggleGroupItem value="all" aria-label="Show all events">
                All events
              </ToggleGroupItem>
              <ToggleGroupItem value="fixture" aria-label="Show fixtures">
                Fixtures
              </ToggleGroupItem>
              <ToggleGroupItem value="bundle-production" aria-label="Show bundle productions">
                Bundle productions
              </ToggleGroupItem>
            </ToggleGroup>
            <FixtureCalendar
              events={visibleEvents}
              onDateSelect={setSelectedDate}
              onFixtureSelect={setSelectedFixture}
            />
          </div>

          <Card>
            <CardHeader className="border-b">
              <CardTitle>Test Areas</CardTitle>
              <CardDescription>
                Scope for the current hardcoded lab pass. No API, account linkage, persistence, or
                editing flows are included.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">dayGridMonth</Badge>
                <Badge variant="secondary">listMonth</Badge>
                <Badge variant="secondary">multiMonthYear</Badge>
                <Badge variant="outline">Event types</Badge>
                <Badge variant="outline">Detail dialog</Badge>
                <Badge variant="outline">Selected date list</Badge>
              </div>
              <ul className="text-muted-foreground list-inside list-disc space-y-2 text-sm leading-relaxed">
                <li>Month view density and event overflow</li>
                <li>Weekend fixture clustering against nearby production dates</li>
                <li>Mixed event families: fixtures and bundle productions</li>
                <li>Month and year views show one fixture summary per day (total game count)</li>
                <li>Custom pills with event-type labeling and status color</li>
                <li>Event click behavior into a read-only detail dialog</li>
                <li>Date click behavior for companion daily event inspection</li>
                <li>How viable the multi-month year overview feels for season scanning</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Lab Metrics</CardTitle>
              <CardDescription>
                Hardcoded data distribution used to stress the calendar with weekend fixtures and
                production activity.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <div className="rounded-xl border p-4">
                  <TypographyMetricLabel as="div">Visible event count</TypographyMetricLabel>
                  <TypographyMetricValue as="div" className="mt-2 text-2xl">
                    {visibleEvents.length}
                  </TypographyMetricValue>
                </div>
                <div className="rounded-xl border p-4">
                  <TypographyMetricLabel as="div">Selected date</TypographyMetricLabel>
                  <TypographyMuted className="text-foreground mt-2 text-sm font-medium">
                    {selectedDate ?? "No date selected"}
                  </TypographyMuted>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {typeCounts.map(({ eventType, count }) => (
                  <Badge key={eventType} variant="secondary">
                    {eventType === "fixture" ? "fixtures" : "bundle productions"}: {count}
                  </Badge>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {statusCounts.map(({ status, count }) => (
                  <Badge key={status} variant="outline">
                    {status}: {count}
                  </Badge>
                ))}
              </div>
              {selectedDate && selectedDateFixtureGradeCounts.length > 0 ? (
                <div className="space-y-2">
                  <div className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                    Selected date fixture groups
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedDateFixtureGradeCounts.map(({ grade, count }) => (
                      <Badge key={grade} variant="default">
                        {grade}: {count}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <SelectedDateFixtures
            selectedDate={selectedDate}
            fixtures={selectedDateFixtures}
            onFixtureSelect={setSelectedFixture}
          />
        </div>
      </div>

      <FixtureDetailDialog
        fixture={selectedFixture}
        open={selectedFixture !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedFixture(null);
          }
        }}
      />
    </Container>
  );
}
