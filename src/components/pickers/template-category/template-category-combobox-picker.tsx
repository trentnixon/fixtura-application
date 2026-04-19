"use client";

import { Label } from "@/components/ui/label";
import { SearchableCombobox } from "@/components/ui/searchable-combobox";

import { useTemplateCategoryPickerList } from "./_hooks";

export function TemplateCategoryComboboxPicker() {
  const { comboboxOptions, resolvedSelectedId, setSelectedId } = useTemplateCategoryPickerList();

  return (
    <div className="max-w-md space-y-2">
      <Label htmlFor="template-category-picker-combobox">Template category</Label>
      <SearchableCombobox
        id="template-category-picker-combobox"
        options={comboboxOptions}
        value={resolvedSelectedId ?? null}
        onChange={(v) => setSelectedId(v)}
        placeholder="Search categories…"
        emptyText="No category matches."
      />
    </div>
  );
}
