export type CalendarEventType = "fixture" | "bundle-production";

export type FixtureStatus = "scheduled" | "completed" | "postponed" | "abandoned";
export type BundleProductionStatus = "pending" | "processing" | "complete";
export type CalendarEventStatus = FixtureStatus | BundleProductionStatus;

type BaseCalendarEvent = {
  id: string;
  title: string;
  date: string;
  start?: string;
  end?: string;
  allDay?: boolean;
};

export type FixtureCalendarEvent = BaseCalendarEvent & {
  eventType: "fixture";
  extendedProps: {
    grade: string;
    competition: string;
    homeTeam: string;
    awayTeam: string;
    venue?: string;
    status: FixtureStatus;
    round?: string;
    organisation?: string;
    notes?: string;
  };
};

export type BundleProductionCalendarEvent = BaseCalendarEvent & {
  eventType: "bundle-production";
  extendedProps: {
    bundleName: string;
    bundleHref?: string;
    productionWindow?: string;
    deliverable: string;
    channel?: string;
    status: BundleProductionStatus;
    organisation?: string;
    notes?: string;
    renderCount?: number;
  };
};

export type CalendarDisplayEvent = FixtureCalendarEvent | BundleProductionCalendarEvent;
