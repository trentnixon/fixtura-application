import {
  type NotificationsProfileDraft,
  WEEKDAY_OPTIONS,
} from "@/features/notifications/bundle-delivery-profile-shared";
import {
  cmsDaysOfWeekIdFromWeekdayKey,
  type WeekdayKey,
  weekdayLabel,
} from "@/features/settings/bundle-delivery-weekdays";

import type {
  AccountNotificationsData,
  PatchAccountNotificationsBody,
  PatchAccountSettingsBody,
} from "@/types/api/account";

function weekdayKeyFromApi(value: string | null): WeekdayKey | undefined {
  if (!value) return undefined;
  return WEEKDAY_OPTIONS.find((o) => o.key === value)?.key;
}

function normalizeEmailCompare(s: string): string {
  return s.trim().toLowerCase();
}

export function dataToProfileDraft(d: AccountNotificationsData): NotificationsProfileDraft {
  return {
    bundleAddressedTo: d.bundleAddressedTo ?? "",
    deliveryEmail: d.deliveryEmail ?? "",
    assetDeliveryDay: weekdayKeyFromApi(d.assetDeliveryDay) ?? "sunday",
  };
}

export function dayBaselineFromData(d: AccountNotificationsData): WeekdayKey {
  return weekdayKeyFromApi(d.assetDeliveryDay) ?? "sunday";
}

export function hasDeliveryDayChange(
  saved: AccountNotificationsData,
  draft: NotificationsProfileDraft,
): boolean {
  return dayBaselineFromData(saved) !== draft.assetDeliveryDay;
}

export function buildPatchAccountNotificationsBody(
  saved: AccountNotificationsData,
  draft: NotificationsProfileDraft,
): PatchAccountNotificationsBody | null {
  const out: PatchAccountNotificationsBody = {};
  const nextBundle = draft.bundleAddressedTo.trim();
  const prevBundle = (saved.bundleAddressedTo ?? "").trim();
  if (nextBundle !== prevBundle) {
    out.bundleAddressedTo = nextBundle === "" ? null : nextBundle;
  }
  const nextEmail = normalizeEmailCompare(draft.deliveryEmail);
  const prevEmail = normalizeEmailCompare(saved.deliveryEmail ?? "");
  if (nextEmail !== prevEmail) {
    const trimmed = draft.deliveryEmail.trim();
    out.deliveryEmail = trimmed === "" ? null : trimmed.toLowerCase();
  }
  if (Object.keys(out).length === 0) return null;
  return out;
}

export function settingsPatchForDeliveryDay(
  draftDay: WeekdayKey,
): Pick<PatchAccountSettingsBody, "daysOfTheWeekId" | "bundleDeliveryDay"> {
  const id = cmsDaysOfWeekIdFromWeekdayKey(draftDay);
  if (id !== undefined) return { daysOfTheWeekId: id };
  return { bundleDeliveryDay: weekdayLabel(draftDay) };
}

export function hasParsableAssetDeliveryDay(data: AccountNotificationsData): boolean {
  return (
    data.assetDeliveryDay != null && WEEKDAY_OPTIONS.some((o) => o.key === data.assetDeliveryDay)
  );
}
