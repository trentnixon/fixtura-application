"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useTemplateTexturePickerList } from "./_hooks";
import { templateTextureLabel } from "./_utils";

export function TemplateTextureSelectPicker({ accountId }: { accountId: string }) {
  const { textures, selectValue, setSelectedId } = useTemplateTexturePickerList(accountId);

  return (
    <div className="space-y-2">
      <Label htmlFor="template-texture-select">Template texture</Label>
      <Select value={selectValue} onValueChange={setSelectedId}>
        <SelectTrigger id="template-texture-select" className="w-full sm:max-w-sm">
          <SelectValue placeholder="Select a template texture" />
        </SelectTrigger>
        <SelectContent>
          {textures.map((texture) => (
            <SelectItem key={texture.id} value={String(texture.id)}>
              {templateTextureLabel(texture)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
