import {
  isTemplateUseBackgroundWrite,
  TEMPLATE_USE_BACKGROUND_WRITE_VALUES,
  type TemplateUseBackground,
} from "@/types/api/template-options";

/** Radix Select values are strings; use a sentinel for unset relation ids and useBackground null. */
export const TEMPLATE_BUILDER_UNSET_VALUE = "__unset__";

export function optionIdToSelectValue(id: number | null): string {
  if (id === null) return TEMPLATE_BUILDER_UNSET_VALUE;
  return String(id);
}

export function selectValueToOptionId(value: string): number | null {
  if (value === TEMPLATE_BUILDER_UNSET_VALUE) return null;
  if (value.trim() === "") return null;
  const n = Number(value);
  if (!Number.isFinite(n) || !Number.isInteger(n)) return null;
  return n;
}

/** Relation picker value when "unset" is not offered — falls back to the saved/original id. */
export function resolveRelationSelectValue(
  draftId: number | null,
  savedId: number | null,
  allowUnset: boolean,
): string | undefined {
  if (allowUnset) return optionIdToSelectValue(draftId);
  const effectiveId = draftId ?? savedId;
  if (effectiveId === null) return undefined;
  return optionIdToSelectValue(effectiveId);
}

export function useBackgroundToSelectValue(value: TemplateUseBackground | null): string {
  if (value === null) return TEMPLATE_BUILDER_UNSET_VALUE;
  return value;
}

export function selectValueToUseBackground(value: string): TemplateUseBackground | null {
  if (value === TEMPLATE_BUILDER_UNSET_VALUE) return null;
  if (isTemplateUseBackgroundWrite(value)) return value;
  return null;
}

export function buildUseBackgroundSelectOptions(): { value: string; label: string }[] {
  return TEMPLATE_USE_BACKGROUND_WRITE_VALUES.map((v) => ({ value: v, label: v }));
}
