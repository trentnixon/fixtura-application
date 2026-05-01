import type { SettingsDraft } from "../_types/settings-draft";

export function settingsPrefId(key: keyof SettingsDraft) {
  return `account-settings-pref-${key}`;
}
