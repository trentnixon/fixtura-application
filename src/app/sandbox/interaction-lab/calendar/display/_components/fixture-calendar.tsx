"use client";

import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin, { type DateClickArg } from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import multiMonthPlugin from "@fullcalendar/multimonth";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

import type { CalendarDisplayEvent, CalendarEventStatus } from "../_types/fixture-calendar.types";
import type { CalendarApi, DatesSetArg, EventClickArg, EventContentArg } from "@fullcalendar/core";

type FixtureCalendarProps = {
  events: CalendarDisplayEvent[];
  onDateSelect: (date: string) => void;
  onFixtureSelect: (event: CalendarDisplayEvent) => void;
};

type CalendarRenderEvent = {
  id: string;
  title: string;
  start: string;
  end?: string;
  allDay?: boolean;
  extendedProps: {
    renderKind: "raw-event" | "fixture-day-total";
    sourceEventId?: string;
    dateKey?: string;
    eventType?: CalendarDisplayEvent["eventType"];
    status?: CalendarEventStatus;
    count?: number;
  };
};

const calendarViews = [
  { value: "dayGridMonth", label: "Month" },
  { value: "multiMonthYear", label: "Year" },
  { value: "listMonth", label: "List" },
  { value: "timeGridWeek", label: "Week" },
] as const;

/** Left accent only; surface stays neutral so event text stays readable in light/dark. */
const statusAccentMap: Record<CalendarEventStatus, string> = {
  scheduled: "border-l-foreground/35",
  completed: "border-l-emerald-600 dark:border-l-emerald-500",
  postponed: "border-l-amber-600 dark:border-l-amber-500",
  abandoned: "border-l-rose-600 dark:border-l-rose-500",
  pending: "border-l-muted-foreground",
  processing: "border-l-violet-600 dark:border-l-violet-500",
  complete: "border-l-emerald-600 dark:border-l-emerald-500",
};

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getFixtureDateKeys(event: CalendarDisplayEvent) {
  const startDate = new Date(event.start ?? `${event.date}T00:00:00`);
  const endDate = new Date(event.end ?? event.start ?? `${event.date}T23:59:59`);
  const cursor = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const endCursor = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
  const dateKeys: string[] = [];

  while (cursor <= endCursor) {
    dateKeys.push(toDateKey(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return dateKeys;
}

function buildGroupedMonthEvents(events: CalendarDisplayEvent[]) {
  const fixtureCountByDate = new Map<string, number>();
  const passthroughEvents: CalendarRenderEvent[] = [];

  for (const event of events) {
    if (event.eventType === "bundle-production") {
      passthroughEvents.push({
        id: event.id,
        title: event.title,
        start: event.start ?? event.date,
        end: event.end,
        allDay: event.allDay,
        extendedProps: {
          renderKind: "raw-event",
          sourceEventId: event.id,
          eventType: event.eventType,
          status: event.extendedProps.status,
        },
      });
      continue;
    }

    for (const dateKey of getFixtureDateKeys(event)) {
      fixtureCountByDate.set(dateKey, (fixtureCountByDate.get(dateKey) ?? 0) + 1);
    }
  }

  const groupedEvents: CalendarRenderEvent[] = [...fixtureCountByDate.entries()]
    .filter(([, count]) => count > 0)
    .map(([dateKey, count]) => ({
      id: `fixtures-day-${dateKey}`,
      title: `${count} ${count === 1 ? "game" : "games"}`,
      start: dateKey,
      allDay: true,
      extendedProps: {
        renderKind: "fixture-day-total",
        dateKey,
        eventType: "fixture",
        count,
      },
    }))
    .sort((left, right) =>
      (left.extendedProps.dateKey ?? "").localeCompare(right.extendedProps.dateKey ?? ""),
    );

  return [...groupedEvents, ...passthroughEvents];
}

export function FixtureCalendar({ events, onDateSelect, onFixtureSelect }: FixtureCalendarProps) {
  const calendarRef = useRef<FullCalendar | null>(null);
  const [currentView, setCurrentView] = useState("dayGridMonth");
  const [currentTitle, setCurrentTitle] = useState("");

  const renderedEvents =
    currentView === "dayGridMonth" || currentView === "multiMonthYear"
      ? buildGroupedMonthEvents(events)
      : events.map((event) => ({
          id: event.id,
          title: event.title,
          start: event.start ?? event.date,
          end: event.end,
          allDay: event.allDay,
          extendedProps: {
            renderKind: "raw-event" as const,
            sourceEventId: event.id,
            eventType: event.eventType,
            status: event.extendedProps.status,
          },
        }));

  function handleEventClick(arg: EventClickArg) {
    const renderKind = arg.event.extendedProps.renderKind as
      | "raw-event"
      | "fixture-day-total"
      | undefined;

    if (renderKind === "fixture-day-total") {
      const dateKey = arg.event.extendedProps.dateKey as string | undefined;

      if (dateKey) {
        onDateSelect(dateKey);
      }
      return;
    }

    const sourceEventId = arg.event.extendedProps.sourceEventId as string | undefined;
    const selectedFixture = events.find((event) => event.id === sourceEventId);

    if (selectedFixture) {
      onFixtureSelect(selectedFixture);
    }
  }

  function handleDateClick(arg: DateClickArg) {
    onDateSelect(arg.dateStr.slice(0, 10));
  }

  function withCalendarApi(callback: (api: CalendarApi) => void) {
    const calendarApi = calendarRef.current?.getApi();

    if (!calendarApi) {
      return;
    }

    callback(calendarApi);
  }

  function renderEventContent(eventInfo: EventContentArg) {
    const renderKind = eventInfo.event.extendedProps.renderKind as
      | "raw-event"
      | "fixture-day-total"
      | undefined;
    const isDenseCalendarView = currentView === "dayGridMonth" || currentView === "multiMonthYear";

    if (renderKind === "fixture-day-total") {
      const count = Number(eventInfo.event.extendedProps.count ?? 0);

      return (
        <Badge className="rounded-md px-2 py-0.5 text-[10px] font-medium shadow-none">
          {count} {count === 1 ? "game" : "games"}
        </Badge>
      );
    }

    const sourceEventId = eventInfo.event.extendedProps.sourceEventId as string | undefined;
    const event = events.find((entry) => entry.id === sourceEventId);

    if (!event) {
      return null;
    }

    const statusClassName = statusAccentMap[event.extendedProps.status];

    if (event.eventType === "bundle-production") {
      if (isDenseCalendarView) {
        return (
          <Badge variant="outline" className="rounded-md px-1.5 py-0.5 text-[9px] shadow-none">
            Bundle
          </Badge>
        );
      }

      return (
        <div
          className={cn(
            "border-border bg-card text-card-foreground ring-border/60 rounded-xl border px-2 py-1.5 text-[11px] leading-tight shadow-sm ring-1",
            "border-l-3 border-l-transparent",
            statusClassName,
          )}
        >
          <div className="flex items-center gap-1.5">
            <Badge variant="outline" className="h-5 rounded-md px-1.5 text-[9px]">
              Bundle
            </Badge>
            <div className="truncate font-semibold">Bundle created</div>
          </div>
        </div>
      );
    }

    return (
      <div
        className={cn(
          "border-border bg-card text-card-foreground ring-border/60 rounded-xl border px-2 py-1.5 text-[11px] leading-tight shadow-sm ring-1",
          isDenseCalendarView && "px-1.5 py-1 shadow-none",
          "border-l-3 border-l-transparent",
          statusClassName,
        )}
      >
        {isDenseCalendarView ? (
          <div className="truncate font-semibold">{event.extendedProps.grade}</div>
        ) : (
          <>
            <div className="flex items-center gap-1.5">
              <Badge variant="secondary" className="h-5 rounded-md px-1.5 text-[9px]">
                Fixture
              </Badge>
              <div className="truncate font-semibold">{event.extendedProps.grade}</div>
            </div>
            <div className="text-muted-foreground truncate">
              {`${event.extendedProps.homeTeam} vs ${event.extendedProps.awayTeam}`}
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "calendar-display-lab bg-background/70 overflow-hidden rounded-xl border p-3 sm:p-4",
        "[&_.fc]:font-sans [&_.fc]:text-sm",
        "[&_.fc-theme-standard_td]:border-border/70 [&_.fc-theme-standard_th]:border-border/70 [&_.fc-theme-standard_.fc-scrollgrid]:border-border/70",
        "[&_.fc-col-header-cell]:bg-muted/40 [&_.fc-col-header-cell]:py-2 [&_.fc-col-header-cell-cushion]:font-medium",
        "[&_.fc-day-today]:bg-primary/5",
        "[&_.fc-daygrid-day.fc-day-today]:bg-primary/5",
        "[&_.fc-event]:cursor-pointer [&_.fc-event]:border-0! [&_.fc-event]:bg-transparent! [&_.fc-event]:shadow-none!",
        "[&_.fc-event-main]:bg-transparent!",
        "[&_.fc-daygrid-event]:border-0! [&_.fc-daygrid-event]:bg-transparent!",
        "[&_.fc-daygrid-block-event]:border-0! [&_.fc-daygrid-block-event]:bg-transparent!",
        "[&_.fc-multimonth_.fc-daygrid-event]:bg-transparent!",
        "[&_.fc-list-day-cushion]:bg-muted/40 [&_.fc-list-event:hover_td]:bg-muted/40",
        "[&_.fc-multimonth-title]:font-semibold",
        "[&_.fc-timegrid-slot]:h-14",
      )}
    >
      <div className="mb-4 flex flex-col gap-3 border-b pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="compact"
            onClick={() => withCalendarApi((api) => api.prev())}
            aria-label="Previous period"
          >
            <ChevronLeft />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="compact"
            onClick={() => withCalendarApi((api) => api.next())}
            aria-label="Next period"
          >
            <ChevronRight />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="compact"
            onClick={() => withCalendarApi((api) => api.today())}
          >
            Today
          </Button>
          <div className="ml-1 text-sm font-semibold">{currentTitle}</div>
        </div>

        <ToggleGroup
          type="single"
          value={currentView}
          onValueChange={(value) => {
            if (value) {
              withCalendarApi((api) => api.changeView(value));
            }
          }}
          variant="outline"
          size="sm"
          className="flex flex-wrap"
        >
          {calendarViews.map((view) => (
            <ToggleGroupItem key={view.value} value={view.value} aria-label={view.label}>
              {view.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin, listPlugin, multiMonthPlugin]}
        initialView="dayGridMonth"
        eventBackgroundColor="transparent"
        eventBorderColor="transparent"
        events={renderedEvents}
        eventClick={handleEventClick}
        dateClick={handleDateClick}
        eventContent={renderEventContent}
        height="auto"
        dayMaxEventRows={3}
        moreLinkClick="popover"
        datesSet={(arg: DatesSetArg) => {
          setCurrentView(arg.view.type);
          setCurrentTitle(arg.view.title);
        }}
        headerToolbar={false}
        views={{
          multiMonthYear: {
            multiMonthMaxColumns: 3,
          },
        }}
      />
    </div>
  );
}
