"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useTemplatePalettePickerList } from "./_hooks";
import { templatePaletteLabel } from "./_utils";

export function TemplatePaletteSelectPicker() {
  const { palettes, selectValue, setSelectedId } = useTemplatePalettePickerList();

  return (
    <div className="max-w-md space-y-2">
      <Label htmlFor="template-palette-picker-select">Template palette</Label>
      <Select value={selectValue} onValueChange={setSelectedId}>
        <SelectTrigger id="template-palette-picker-select" className="w-full max-w-md">
          <SelectValue placeholder="Select a palette" />
        </SelectTrigger>
        <SelectContent>
          {palettes.map((palette) => (
            <SelectItem key={palette.id} value={String(palette.id)}>
              {templatePaletteLabel(palette)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
