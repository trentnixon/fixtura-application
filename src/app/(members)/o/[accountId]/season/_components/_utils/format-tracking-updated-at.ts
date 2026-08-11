import { differenceInCalendarDays, differenceInHours, differenceInMinutes, format } from "date-fns";

function parseTrackingUpdatedAt(iso: string): Date | null {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

/** Full absolute timestamp for tooltips and screen readers. */
export function formatTrackingUpdatedAtAbsolute(iso: string): string {
  const date = parseTrackingUpdatedAt(iso);
  if (!date) return iso;

  const datePart = date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const timePart = date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });

  return timePart ? `${datePart}, ${timePart}` : datePart;
}

/** Relative or conversational label for freshness badges. */
export function formatTrackingUpdatedAt(iso: string, referenceDate = new Date()): string {
  const date = parseTrackingUpdatedAt(iso);
  if (!date) return iso;

  const minutes = differenceInMinutes(referenceDate, date);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;

  const hours = differenceInHours(referenceDate, date);
  const calendarDays = differenceInCalendarDays(referenceDate, date);
  if (hours < 24 && calendarDays === 0) return `${hours} hour${hours === 1 ? "" : "s"} ago`;

  const timeLabel = format(date, "h:mm a");
  if (calendarDays === 1) return `yesterday at ${timeLabel}`;

  if (date.getFullYear() === referenceDate.getFullYear()) {
    return `${format(date, "d MMM")} at ${timeLabel}`;
  }

  return `${format(date, "d MMM yyyy")} at ${timeLabel}`;
}
