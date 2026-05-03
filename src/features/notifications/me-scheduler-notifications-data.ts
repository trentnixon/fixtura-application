import { weekdayKeyFromDaysOfWeekRelation } from "@/features/settings/bundle-delivery-weekdays";

import type {
  AccountNotificationsData,
  AccountSchedulerDocument,
  AccountSummary,
} from "@/types/api/account";

function trimToNull(s: string | null | undefined): string | null {
  if (s == null) return null;
  const t = s.trim();
  return t === "" ? null : t;
}

/**
 * Notifications read model — no `getAccountNotifications`, no settings GET:
 * - **Bundle addressed to** → `accounts[]` row **`FirstName`** (`GET /api/account/me`).
 * - **Delivery email** → **`DeliveryAddress`** on that row (operational contact; CMS stores email there for this account).
 * - **Asset delivery day** → **`scheduler.days_of_the_week`** (`GET /api/accounts/:id/scheduler`), same Name/id parsing as elsewhere.
 */
export function notificationsDataFromMeRowAndScheduler(
  meRow: AccountSummary | undefined,
  schedulerDoc: AccountSchedulerDocument | null,
): AccountNotificationsData {
  const dayKey = weekdayKeyFromDaysOfWeekRelation(schedulerDoc?.days_of_the_week ?? null) ?? null;

  return {
    bundleAddressedTo: trimToNull(meRow?.FirstName ?? null),
    deliveryEmail: trimToNull(meRow?.DeliveryAddress ?? null),
    assetDeliveryDay: dayKey,
  };
}
