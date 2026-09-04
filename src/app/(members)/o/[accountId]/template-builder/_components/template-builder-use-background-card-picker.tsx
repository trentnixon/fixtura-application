"use client";

import { useMemo } from "react";

import {
  TEMPLATE_USE_BACKGROUND_WRITE_VALUES,
  type TemplateUseBackground,
} from "@/types/api/template-options";

import { TemplateBuilderUseBackgroundFieldRow } from "./template-builder-field-row";
import { formatUseBackgroundLabel } from "../_utils/template-builder-option-labels";
import { useBackgroundToSelectValue } from "../_utils/template-builder-select-value";

const HIDDEN_USE_BACKGROUND_VALUES = new Set<TemplateUseBackground>(["Video"]);

export function buildTemplateBuilderUseBackgroundOptions(hideImageOption: boolean) {
  return TEMPLATE_USE_BACKGROUND_WRITE_VALUES.filter(
    (value) => !HIDDEN_USE_BACKGROUND_VALUES.has(value) && !(hideImageOption && value === "Image"),
  ).map((value) => ({
    value,
    label: formatUseBackgroundLabel(value),
  }));
}

export function TemplateBuilderUseBackgroundCardPicker({
  selectedValue,
  isChanged,
  hideImageOption = false,
  onSelect,
}: {
  selectedValue: TemplateUseBackground | null;
  isChanged: boolean;
  hideImageOption?: boolean;
  onSelect: (value: TemplateUseBackground | null) => void;
  /** @deprecated Unused — background type is a select, not a tile grid. */
  centerTiles?: boolean;
}) {
  const selectValue = useBackgroundToSelectValue(selectedValue);

  const options = useMemo(
    () => buildTemplateBuilderUseBackgroundOptions(hideImageOption),
    [hideImageOption],
  );

  return (
    <TemplateBuilderUseBackgroundFieldRow
      fieldId="template-builder-useBackground"
      selectValue={selectValue}
      options={options}
      isChanged={isChanged}
      onValueChange={onSelect}
    />
  );
}
