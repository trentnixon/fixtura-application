/**
 * General allocation slots for “Assign to position” (account-wide / non-entity).
 *
 * Contract: `Allocation.accountGroup` with non-empty `category` + `id` (see
 * `.comms/data-fetching/request/app-handoff-account-sponsors-and-allocations-crud.md`).
 * Scheduler / `sponsorsFormatted.js` must agree on these values — if renders miss sponsors,
 * confirm with CMS before changing `POSITION_ALLOCATION_CATEGORY` or slot ids.
 *
 * Primary tier: four slots; first id stays `primary_sponsor` for legacy rows. General tier:
 * `general_sponsor_1` … `general_sponsor_N` where primary + N never exceeds 30 total rows.
 */
export const POSITION_ALLOCATION_CATEGORY = "global";

export type SponsorPositionSlotDef = {
  id: string;
  title: string;
};

/** First id matches legacy (`primary_sponsor`); three additional primary-tier slots. */
export const PRIMARY_POSITION_SLOTS: SponsorPositionSlotDef[] = [
  { id: "primary_sponsor", title: "Primary sponsor 1" },
  { id: "primary_sponsor_2", title: "Primary sponsor 2" },
  { id: "primary_sponsor_3", title: "Primary sponsor 3" },
  { id: "primary_sponsor_4", title: "Primary sponsor 4" },
];

export const PRIMARY_POSITION_SLOT_IDS: ReadonlySet<string> = new Set(
  PRIMARY_POSITION_SLOTS.map((s) => s.id),
);

/** Maximum position rows in assign UI: primary + general combined. */
export const MAX_TOTAL_POSITION_SLOTS = 30;

/** General tier slot count: {@link MAX_TOTAL_POSITION_SLOTS} minus primary rows. */
export const MAX_GENERAL_SPONSOR_SLOTS = MAX_TOTAL_POSITION_SLOTS - PRIMARY_POSITION_SLOTS.length;

/** @deprecated Prefer `PRIMARY_POSITION_SLOTS[0]?.id` — kept for existing imports. */
export const PRIMARY_SPONSOR_SLOT_ID = "primary_sponsor";

/** Initial number of general rows shown before “Add general position”. */
export const INITIAL_GENERAL_SPONSOR_SLOTS_VISIBLE = 4;

export function buildGeneralPositionSlots(count: number): SponsorPositionSlotDef[] {
  const n = Math.max(0, Math.min(MAX_GENERAL_SPONSOR_SLOTS, Math.floor(count)));
  return Array.from({ length: n }, (_, i) => ({
    id: `general_sponsor_${i + 1}`,
    title: `General sponsor ${i + 1}`,
  }));
}

export const ALL_GENERAL_POSITION_SLOTS: SponsorPositionSlotDef[] =
  buildGeneralPositionSlots(MAX_GENERAL_SPONSOR_SLOTS);

export const ALL_POSITION_SLOT_IDS: ReadonlySet<string> = new Set([
  ...PRIMARY_POSITION_SLOTS.map((s) => s.id),
  ...ALL_GENERAL_POSITION_SLOTS.map((s) => s.id),
]);

/** Short help text for tooltips on the assign-to-position table (and similar UI). */
export function getSponsorPositionSlotDescription(slotId: string): string {
  if (PRIMARY_POSITION_SLOT_IDS.has(slotId)) {
    return "Primary sponsors appear on every screen in your videos and images, and at the top of the sponsor listing on end screens.";
  }
  if (/^general_sponsor_\d+$/.test(slotId)) {
    return "This is the order sponsors appear in on the final end screens and images.";
  }
  return "Sponsor position used on your account-wide graphics when this slot is included in your template.";
}
