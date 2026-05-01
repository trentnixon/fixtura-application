import { weekdayKeyFromDaysOfWeekRelation } from "@/features/settings/bundle-delivery-weekdays";

import { pickDaysOfWeekRelation } from "./pick-days-of-week-relation";

import type { CompetitionGroupingKey, SettingsDraft } from "../_types/settings-draft";
import type { AccountSchedulerDocument, AccountSettingsData } from "@/types/api/account";

export function settingsDraftFromPayload(
  settings: AccountSettingsData,
  apiSchedulerDoc: AccountSchedulerDocument | null | undefined,
): SettingsDraft {
  const grouping: CompetitionGroupingKey = settings.group_assets_by ? "grade" : "competition";
  const dow = pickDaysOfWeekRelation(settings, apiSchedulerDoc);
  const deliveryWeekdayKey = weekdayKeyFromDaysOfWeekRelation(dow) ?? "sunday";
  return {
    includeJuniorSurnames: settings.include_junior_surnames,
    competitionsGroupedBy: grouping,
    splitSeniorsAndMasters: settings.split_seniors_and_masters ?? false,
    deliveryWeekdayKey,
  };
}

export function equalDraft(a: SettingsDraft, b: SettingsDraft): boolean {
  return (
    a.includeJuniorSurnames === b.includeJuniorSurnames &&
    a.competitionsGroupedBy === b.competitionsGroupedBy &&
    a.splitSeniorsAndMasters === b.splitSeniorsAndMasters &&
    a.deliveryWeekdayKey === b.deliveryWeekdayKey
  );
}
