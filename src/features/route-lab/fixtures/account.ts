import type { WeekdayKey } from "@/features/settings/bundle-delivery-weekdays";

export type AccountLabData = {
  id: string;
  organisationName: string;
  isActive: boolean;
  isSetup: boolean;
  isRightsHolder: boolean;
  isPermissionGiven: boolean;
  userName: string;
  loginEmail: string;
  memberSince: string;
  lastUpdated: string;
  sport: string;
  accountType: "Association" | "Club";
  organisations: string[];
  bundleAddressedTo: string;
  deliveryEmail: string;
  assetDeliveryDay: WeekdayKey;
};

export type AccountLabEditableDraft = {
  userName: string;
  loginEmail: string;
};

/** Bundle / delivery lab — used by Route Lab notifications page (`/sandbox/route-lab/app/notifications`). */
export type AccountNotificationsLabDraft = {
  bundleAddressedTo: string;
  deliveryEmail: string;
  assetDeliveryDay: WeekdayKey;
};

export const ACCOUNT_LAB_DEFAULT: AccountLabData = {
  id: "0000001",
  organisationName: "Cricket Whanganui",
  isActive: true,
  isSetup: true,
  isRightsHolder: true,
  isPermissionGiven: true,
  userName: "Cricket Whanganui",
  loginEmail: "trentnixon+cw@gmail.com",
  memberSince: "14 October 2025",
  lastUpdated: "8 March 2026",
  sport: "Cricket",
  accountType: "Association",
  organisations: ["Cricket Whanganui"],
  bundleAddressedTo: "Cricket Whanganui",
  deliveryEmail: "trentnixon+cw@gmail.com",
  assetDeliveryDay: "sunday",
};

export function editableDraftFromAccount(data: AccountLabData): AccountLabEditableDraft {
  return {
    userName: data.userName,
    loginEmail: data.loginEmail,
  };
}

export function notificationsLabDraftFromAccount(
  data: AccountLabData,
): AccountNotificationsLabDraft {
  return {
    bundleAddressedTo: data.bundleAddressedTo,
    deliveryEmail: data.deliveryEmail,
    assetDeliveryDay: data.assetDeliveryDay,
  };
}

export function accountLabBaseForState(state: string): AccountLabData {
  switch (state) {
    case "setup-pending":
      return { ...ACCOUNT_LAB_DEFAULT, isSetup: false };
    case "inactive":
      return { ...ACCOUNT_LAB_DEFAULT, isActive: false };
    default:
      return { ...ACCOUNT_LAB_DEFAULT };
  }
}
