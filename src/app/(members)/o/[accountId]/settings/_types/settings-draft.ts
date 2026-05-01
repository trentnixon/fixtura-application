import type { WeekdayKey } from "@/features/settings/bundle-delivery-weekdays";

export type CompetitionGroupingKey = "competition" | "grade";

export type SettingsDraft = {
  includeJuniorSurnames: boolean;
  competitionsGroupedBy: CompetitionGroupingKey;
  splitSeniorsAndMasters: boolean;
  deliveryWeekdayKey: WeekdayKey;
};
