"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useTemplateVideoPickerList } from "./_hooks";
import { templateVideoLabel } from "./_utils";

export function TemplateVideoSelectPicker() {
  const { videos, selectValue, setSelectedId } = useTemplateVideoPickerList();

  return (
    <div className="space-y-2">
      <Label htmlFor="template-video-select">Template video</Label>
      <Select value={selectValue} onValueChange={setSelectedId}>
        <SelectTrigger id="template-video-select" className="w-full sm:max-w-sm">
          <SelectValue placeholder="Select a template video" />
        </SelectTrigger>
        <SelectContent>
          {videos.map((video) => (
            <SelectItem key={video.id} value={String(video.id)}>
              {templateVideoLabel(video)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
