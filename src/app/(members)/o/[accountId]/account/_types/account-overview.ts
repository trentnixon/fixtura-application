import type { AccountSecuritySummary } from "./account-security";
import type { AccountSettingsData } from "@/types/api/account";

export type AccountOverviewSectionProps = {
  settings: AccountSettingsData;
  summary: AccountSecuritySummary;
};

export type AccountOverviewAccessSettingKey = "isRightsHolder" | "isPermissionGiven";

export type AccountOverviewAccessItem = {
  label: string;
  description: string;
  settingKey: AccountOverviewAccessSettingKey;
};
