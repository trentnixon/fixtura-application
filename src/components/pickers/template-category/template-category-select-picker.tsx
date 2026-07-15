"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useTemplateCategoryPickerList } from "./_hooks";
import { categoryLabel } from "./_utils";

export function TemplateCategorySelectPicker({ accountId }: { accountId: string }) {
  const { categories, selectValue, setSelectedId } = useTemplateCategoryPickerList(accountId);

  return (
    <div className="max-w-md space-y-2">
      <Label htmlFor="template-category-picker-select">Template category</Label>
      <Select value={selectValue} onValueChange={setSelectedId}>
        <SelectTrigger id="template-category-picker-select" className="w-full max-w-md">
          <SelectValue placeholder="Select a category" />
        </SelectTrigger>
        <SelectContent>
          {categories.map((cat) => (
            <SelectItem key={cat.id} value={String(cat.id)}>
              {categoryLabel(cat)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
