/**
 * Bundle delivery weekday keys and labels — shared with Route Lab settings
 * (`settings-lab-workspace.tsx`) so dropdown order and `dateIndex` stay identical.
 */
export type WeekdayKey =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export const WEEKDAY_OPTIONS: { key: WeekdayKey; label: string; dateIndex: number }[] = [
  { key: "sunday", label: "Sunday", dateIndex: 1 },
  { key: "monday", label: "Monday", dateIndex: 2 },
  { key: "tuesday", label: "Tuesday", dateIndex: 3 },
  { key: "wednesday", label: "Wednesday", dateIndex: 4 },
  { key: "thursday", label: "Thursday", dateIndex: 5 },
  { key: "friday", label: "Friday", dateIndex: 6 },
  { key: "saturday", label: "Saturday", dateIndex: 7 },
];

/**
 * Strapi **`days-of-the-week`** catalogue IDs (Fixtura admin order):
 * **`1` = Sunday … `7` = Saturday.** There is **no `0`** CMS id for a weekday.
 *
 * `WEEKDAY_OPTIONS[].dateIndex` is **only** for **`Date#getDay()`** (ECMAScript **`0`** = Sun … **`6`** = Sat)
 * and must not be confused with these CMS IDs.
 */
export const CMS_DAYS_OF_WEEK_ID_TO_KEY = {
  1: "sunday",
  2: "monday",
  3: "tuesday",
  4: "wednesday",
  5: "thursday",
  6: "friday",
  7: "saturday",
} as const satisfies Record<number, WeekdayKey>;

export type CmsDaysOfWeekId = keyof typeof CMS_DAYS_OF_WEEK_ID_TO_KEY;

export function weekdayLabel(key: WeekdayKey): string {
  return WEEKDAY_OPTIONS.find((o) => o.key === key)?.label ?? "—";
}

/**
 * Map Strapi **`days-of-the-week.id`** (**`1`–`7`**, Sun–Sat — **never `0`**) to UI key.
 */
export function weekdayKeyFromCmsDaysOfWeekId(rawId: unknown): WeekdayKey | undefined {
  const id =
    typeof rawId === "number"
      ? rawId
      : typeof rawId === "string"
        ? Number.parseInt(rawId.trim(), 10)
        : Number.NaN;
  if (!Number.isInteger(id)) return undefined;
  if (id < 1 || id > 7) return undefined;
  return CMS_DAYS_OF_WEEK_ID_TO_KEY[id as CmsDaysOfWeekId];
}

/** PATCH: UI key → Strapi **`days-of-the-week`** id **`1`** (Sunday) … **`7`** (Saturday). */
export function cmsDaysOfWeekIdFromWeekdayKey(key: WeekdayKey): CmsDaysOfWeekId | undefined {
  const found = (Object.entries(CMS_DAYS_OF_WEEK_ID_TO_KEY) as [string, WeekdayKey][]).find(
    ([, k]) => k === key,
  );
  if (!found) return undefined;
  const n = Number(found[0]);
  if (n < 1 || n > 7) return undefined;
  return n as CmsDaysOfWeekId;
}

/**
 * Normalize CMS **`days-of-the-week`** display name (`Name`, or JSON `name`) to a select key.
 * Accepts abbreviations (“Wed”, “thu”).
 */
export function weekdayKeyFromPublishedName(
  raw: string | undefined | null,
): WeekdayKey | undefined {
  if (!raw) return undefined;
  const folded = raw.trim().replace(/\.$/, "").toLowerCase();

  const exact = WEEKDAY_OPTIONS.find(
    ({ label, key }) => folded === label.toLowerCase() || folded === key,
  );
  if (exact) return exact.key;

  const byPrefix = WEEKDAY_OPTIONS.find(({ label }) =>
    folded.startsWith(label.toLowerCase().slice(0, 3)),
  );
  return byPrefix?.key;
}

/** Relation from GET settings / scheduler: name first, then Strapi **`days-of-the-week`** ids `1`–`7` (Sun–Sat). */
export function weekdayKeyFromDaysOfWeekRelation(
  dow: { Name?: string; id?: number } | null | undefined,
): WeekdayKey | undefined {
  if (!dow) return undefined;
  const row = dow as Record<string, unknown>;
  const fromName =
    typeof dow.Name === "string"
      ? dow.Name
      : typeof row["name"] === "string"
        ? row["name"]
        : typeof row["Name"] === "string"
          ? row["Name"]
          : "";
  const parsedName = weekdayKeyFromPublishedName(
    typeof fromName === "string" ? fromName : undefined,
  );
  if (parsedName) return parsedName;

  const rawId = dow.id ?? row["id"] ?? row["documentId"];
  return weekdayKeyFromCmsDaysOfWeekId(rawId);
}

export function daysUntilNextDelivery(target: WeekdayKey, now = new Date()): number {
  const today = now.getDay(); // 0 (Sun) -> 6 (Sat)
  const targetIndex = WEEKDAY_OPTIONS.find((o) => o.key === target)?.dateIndex ?? 0;
  const delta = (targetIndex - today + 7) % 7;
  return delta === 0 ? 7 : delta;
}
