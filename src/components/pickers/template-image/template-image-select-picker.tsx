"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useTemplateImagePickerList } from "./_hooks";
import { templateImageLabel } from "./_utils";

export function TemplateImageSelectPicker() {
  const { images, selectValue, setSelectedId } = useTemplateImagePickerList();

  return (
    <div className="max-w-md space-y-2">
      <Label htmlFor="template-image-picker-select">Template image</Label>
      <Select value={selectValue} onValueChange={setSelectedId}>
        <SelectTrigger id="template-image-picker-select" className="w-full max-w-md">
          <SelectValue placeholder="Select a template image" />
        </SelectTrigger>
        <SelectContent>
          {images.map((img) => (
            <SelectItem key={img.id} value={String(img.id)}>
              {templateImageLabel(img)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
