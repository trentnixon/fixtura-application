"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useTemplateNoisePickerList } from "./_hooks";
import { templateNoiseLabel } from "./_utils";

export function TemplateNoiseSelectPicker({ accountId }: { accountId: string }) {
  const { noises, selectValue, setSelectedId } = useTemplateNoisePickerList(accountId);

  return (
    <div className="max-w-md space-y-2">
      <Label htmlFor="template-noise-picker-select">Template noise</Label>
      <Select value={selectValue} onValueChange={setSelectedId}>
        <SelectTrigger id="template-noise-picker-select" className="w-full max-w-md">
          <SelectValue placeholder="Select a noise" />
        </SelectTrigger>
        <SelectContent>
          {noises.map((noise) => (
            <SelectItem key={noise.id} value={String(noise.id)}>
              {templateNoiseLabel(noise)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
