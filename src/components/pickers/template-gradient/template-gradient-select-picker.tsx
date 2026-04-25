"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useTemplateGradientPickerList } from "./_hooks";
import { gradientLabel } from "./_utils";

export function TemplateGradientSelectPicker() {
  const { gradients, selectValue, setSelectedId } = useTemplateGradientPickerList();

  return (
    <div className="max-w-md space-y-2">
      <Label htmlFor="template-gradient-picker-select">Template gradient</Label>
      <Select value={selectValue} onValueChange={setSelectedId}>
        <SelectTrigger id="template-gradient-picker-select" className="w-full max-w-md">
          <SelectValue placeholder="Select a gradient" />
        </SelectTrigger>
        <SelectContent>
          {gradients.map((g) => (
            <SelectItem key={g.id} value={String(g.id)}>
              {gradientLabel(g)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
