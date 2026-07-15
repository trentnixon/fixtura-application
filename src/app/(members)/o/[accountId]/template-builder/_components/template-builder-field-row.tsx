"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { TemplateBuilderChangedBadge } from "./template-builder-changed-badge";
import {
  TEMPLATE_BUILDER_UNSET_VALUE,
  optionIdToSelectValue,
  selectValueToOptionId,
  selectValueToUseBackground,
} from "../_utils/template-builder-select-value";

import type { TemplateUseBackground } from "@/types/api/template-options";

export interface TemplateBuilderSelectOption {
  value: string;
  label: string;
}

export function TemplateBuilderRelationFieldRow({
  fieldId,
  label,
  selectValue,
  options,
  isChanged,
  onValueChange,
  allowUnset = true,
  selectPlaceholder = "Select...",
}: {
  fieldId: string;
  label: string;
  /** When undefined, the select shows `selectPlaceholder` (no unset option). */
  selectValue: string | undefined;
  options: TemplateBuilderSelectOption[];
  isChanged: boolean;
  onValueChange: (id: number | null) => void;
  /** When false, only catalog options are shown; reverting means choosing the original setting again. */
  allowUnset?: boolean;
  selectPlaceholder?: string;
}) {
  return (
    <div className="border-border/60 grid gap-2 border-b pb-4 last:border-0 last:pb-0">
      <Label htmlFor={fieldId} className="inline-flex items-center gap-2 text-sm font-medium">
        {label}
        {isChanged ? <TemplateBuilderChangedBadge placement="title" /> : null}
      </Label>
      <Select
        value={selectValue ?? ""}
        onValueChange={(v) => onValueChange(selectValueToOptionId(v))}
      >
        <SelectTrigger id={fieldId} className="w-full">
          <SelectValue placeholder={selectPlaceholder} />
        </SelectTrigger>
        <SelectContent>
          {allowUnset ? <SelectItem value={TEMPLATE_BUILDER_UNSET_VALUE}>Unset</SelectItem> : null}
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function TemplateBuilderUseBackgroundFieldRow({
  fieldId,
  selectValue,
  options,
  isChanged,
  onValueChange,
}: {
  fieldId: string;
  selectValue: string;
  options: TemplateBuilderSelectOption[];
  isChanged: boolean;
  onValueChange: (value: TemplateUseBackground | null) => void;
}) {
  const resolvedValue = selectValue === TEMPLATE_BUILDER_UNSET_VALUE ? undefined : selectValue;

  return (
    <div className="grid gap-2">
      <Label htmlFor={fieldId} className="inline-flex items-center gap-2 text-sm font-medium">
        Background type
        {isChanged ? <TemplateBuilderChangedBadge placement="title" /> : null}
      </Label>
      <Select
        value={resolvedValue}
        onValueChange={(v) => onValueChange(selectValueToUseBackground(v))}
      >
        <SelectTrigger id={fieldId} className="w-full">
          <SelectValue placeholder="Select background type…" />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function buildRelationSelectOptions<T extends { id: number }>(
  items: T[],
  formatLabel: (item: T) => string,
): TemplateBuilderSelectOption[] {
  return items.map((item) => ({
    value: optionIdToSelectValue(item.id),
    label: formatLabel(item),
  }));
}
