import type { SeasonHubFixtureListItem } from "@/types/api/season-hub";

/** Season-hub date strings (calendar day or ISO) -> readable local label (e.g. Wed, 31 Mar 2026). */
export function formatFixtureDateDisplay(value: string | null | undefined): string {
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
export function fixtureStatusBadgeClass(status: string): string {
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

export type SeasonFixtureListDisplayRow = {
  home: string;
  away: string;
  dateLabel: string;
  roundLabel: string;
  typeLabel: string;
  statusRaw: string;
  venueLabel: string;
};

export function buildSeasonFixtureListDisplayRow(
  fixture: SeasonHubFixtureListItem,
): SeasonFixtureListDisplayRow {
  return {
    home: fixture.teams.home ?? "-",
    away: fixture.teams.away ?? "-",
    dateLabel: formatFixtureDateDisplay(fixture.date),
    roundLabel:
      fixture.round != null && String(fixture.round).trim() !== "" ? String(fixture.round) : "-",
    typeLabel:
      fixture.type != null && String(fixture.type).trim() !== "" ? String(fixture.type) : "-",
    statusRaw: fixture.status ?? "",
    venueLabel: fixture.venue.ground ?? "-",
  };
}
