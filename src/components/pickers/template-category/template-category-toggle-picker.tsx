"use client";

import { TypographyMuted } from "@/components/typography";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

import { TOGGLE_MAX_CATEGORIES } from "./_consts";
import { useTemplateCategoryPickerList } from "./_hooks";
import { categoryLabel } from "./_utils";

export function TemplateCategoryTogglePicker({ accountId }: { accountId: string }) {
  const { categories, selectValue, setSelectedId } = useTemplateCategoryPickerList(accountId);

  const showToggleGroup = categories.length > 0 && categories.length <= TOGGLE_MAX_CATEGORIES;

  if (!showToggleGroup) {
    return (
      <TypographyMuted className="text-sm">
        Toggle group is shown only when there are {TOGGLE_MAX_CATEGORIES} or fewer categories
        (current: {categories.length}). Use Select, Combobox, or Cards instead.
      </TypographyMuted>
    );
  }

  return (
    <div className="space-y-3">
      <Label className="text-sm">Category (single, compact)</Label>
      <ToggleGroup
        type="single"
        value={selectValue}
        onValueChange={(v) => {
          if (v) setSelectedId(v);
        }}
        variant="outline"
        spacing={0}
        className="flex-wrap justify-start"
      >
        {categories.map((cat) => (
          <ToggleGroupItem
            key={cat.id}
            value={String(cat.id)}
            className="max-w-48 truncate text-xs sm:text-sm"
            title={categoryLabel(cat)}
          >
            {categoryLabel(cat)}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}
