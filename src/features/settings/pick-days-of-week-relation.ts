import { weekdayKeyFromDaysOfWeekRelation } from "@/features/settings/bundle-delivery-weekdays";

import type {
  AccountSchedulerDayOfWeek,
  AccountSchedulerDocument,
  AccountSettingsData,
} from "@/types/api/account";

/**
 * Prefer **`GET /api/accounts/:id/scheduler`** for `days_of_the_week` when populated; settings GET
 * often omits it. While scheduler GET is still pending, use only the settings embedding.
 *
 * - `apiSchedulerDoc === undefined` — scheduler request not settled yet.
 * - `apiSchedulerDoc === null` — settled, no scheduler document (or gateway); fall back to settings.
 */
export function pickDaysOfWeekRelation(
  settings: AccountSettingsData,
  apiSchedulerDoc: AccountSchedulerDocument | null | undefined,
): AccountSchedulerDayOfWeek | null | undefined {
  const emb = settings.scheduler?.days_of_the_week ?? null;

  if (apiSchedulerDoc === undefined) {
    return emb ?? undefined;
  }

  const api = apiSchedulerDoc?.days_of_the_week ?? null;

  const apiParsableKey = weekdayKeyFromDaysOfWeekRelation(api);
  const embParsableKey = weekdayKeyFromDaysOfWeekRelation(emb);
  const apiUsable = Boolean(apiParsableKey || (api?.id ?? 0) > 0);
  const embUsable = Boolean(embParsableKey || (emb?.id ?? 0) > 0);

  if (apiUsable) return api ?? undefined;
  if (embUsable) return emb ?? undefined;
  return api ?? emb ?? undefined;
}
