"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useTemplateModePickerList } from "./_hooks";
import { templateModeLabel } from "./_utils";

export function TemplateModeSelectPicker({ accountId }: { accountId: string }) {
  const { modes, selectValue, setSelectedId } = useTemplateModePickerList(accountId);

  return (
    <div className="max-w-md space-y-2">
      <Label htmlFor="template-mode-picker-select">Template mode</Label>
      <Select value={selectValue} onValueChange={setSelectedId}>
        <SelectTrigger id="template-mode-picker-select" className="w-full max-w-md">
          <SelectValue placeholder="Select a mode" />
        </SelectTrigger>
        <SelectContent>
          {modes.map((mode) => (
            <SelectItem key={mode.id} value={String(mode.id)}>
              {templateModeLabel(mode)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
