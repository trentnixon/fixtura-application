"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useTemplatePatternPickerList } from "./_hooks";
import { patternLabel } from "./_utils";

export function TemplatePatternSelectPicker() {
  const { patterns, selectValue, setSelectedId } = useTemplatePatternPickerList();

  return (
    <div className="space-y-2">
      <Label htmlFor="template-pattern-select">Template pattern</Label>
      <Select value={selectValue} onValueChange={setSelectedId}>
        <SelectTrigger id="template-pattern-select" className="w-full sm:max-w-sm">
          <SelectValue placeholder="Select a template pattern" />
        </SelectTrigger>
        <SelectContent>
          {patterns.map((pattern) => (
            <SelectItem key={pattern.id} value={String(pattern.id)}>
              {patternLabel(pattern)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
