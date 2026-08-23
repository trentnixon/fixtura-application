import type { PatchAccountSettingsBody } from "@/types/api/account";

export function settingsFieldsChanged(patch: PatchAccountSettingsBody): string[] {
  const fields: string[] = [];
  if (patch.includeJuniorSurnames !== undefined) {
    fields.push("include_junior_surnames");
  }
  if (patch.competitionsGroupedBy !== undefined) {
    fields.push("competitions_grouped_by");
  }
  if (patch.splitSeniorsAndMasters !== undefined) {
    fields.push("split_seniors_masters");
  }
  if (patch.daysOfTheWeekId !== undefined || patch.bundleDeliveryDay !== undefined) {
    fields.push("delivery_weekday");
  }
  return fields;
}

export function brandingFieldsChanged(body: {
  palette?: unknown;
  themeId?: unknown;
  templateModeId?: unknown;
}): string[] {
  const fields: string[] = [];
  if (body.palette !== undefined) fields.push("palette");
  if (body.themeId !== undefined) fields.push("theme_id");
  if (body.templateModeId !== undefined) fields.push("template_mode_id");
  return fields;
}
