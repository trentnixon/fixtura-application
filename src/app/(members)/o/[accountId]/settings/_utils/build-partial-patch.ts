import {
  cmsDaysOfWeekIdFromWeekdayKey,
  weekdayLabel,
} from "@/features/settings/bundle-delivery-weekdays";

import type { SettingsDraft } from "../_types/settings-draft";
import type { PatchAccountSettingsBody } from "@/types/api/account";

export function buildPartialPatch(params: {
  baseline: SettingsDraft;
  next: SettingsDraft;
  isClub: boolean;
}): PatchAccountSettingsBody | null {
  const { baseline, next, isClub } = params;
  const out: PatchAccountSettingsBody = {};
  let changed = false;

  if (next.includeJuniorSurnames !== baseline.includeJuniorSurnames) {
    out.includeJuniorSurnames = next.includeJuniorSurnames;
    changed = true;
  }

  if (!isClub && next.competitionsGroupedBy !== baseline.competitionsGroupedBy) {
    out.competitionsGroupedBy = next.competitionsGroupedBy;
    changed = true;
  }

  if (isClub && next.splitSeniorsAndMasters !== baseline.splitSeniorsAndMasters) {
    out.splitSeniorsAndMasters = next.splitSeniorsAndMasters;
    changed = true;
  }

  if (next.deliveryWeekdayKey !== baseline.deliveryWeekdayKey) {
    /* Strapi catalogue uses numeric ids 1–7 (Sun–Sat); prefer id when available (CMS handoff). */
    const id = cmsDaysOfWeekIdFromWeekdayKey(next.deliveryWeekdayKey);
    if (id !== undefined) {
      out.daysOfTheWeekId = id;
    } else {
      out.bundleDeliveryDay = weekdayLabel(next.deliveryWeekdayKey);
    }
    changed = true;
  }

  return changed ? out : null;
}
