"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { TemplateBuilderChangedBadge } from "./template-builder-changed-badge";
import {
  formatAnimationPresetLabel,
  getAnimationPresetType,
} from "../_utils/template-builder-animation-catalog";

import type { AnimationPresetCatalogItem } from "@/types/api/all-template-options";
import type { TemplateAnimationConfig } from "@/types/api/template-options";

export function TemplateBuilderAnimationCardPicker({
  presets,
  selectedAnimation,
  isChanged,
  unavailablePresetId,
  onSelectPreset,
}: {
  presets: AnimationPresetCatalogItem[];
  selectedAnimation: TemplateAnimationConfig | null;
  isChanged: boolean;
  unavailablePresetId?: string | null;
  onSelectPreset: (preset: AnimationPresetCatalogItem) => void;
}) {
  const selectedType = getAnimationPresetType(selectedAnimation);

  return (
    <div className="grid gap-2">
      <Label
        htmlFor="template-builder-animation-preset"
        className="inline-flex items-center gap-2 text-sm font-medium"
      >
        Animation preset
        {isChanged ? <TemplateBuilderChangedBadge placement="title" /> : null}
      </Label>

      {unavailablePresetId ? (
        <p className="border-destructive/40 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-xs">
          Saved preset &quot;{unavailablePresetId}&quot; is no longer available. Choose a new
          animation preset before saving.
        </p>
      ) : null}

      <Select
        value={selectedType ?? ""}
        onValueChange={(presetId) => {
          const preset = presets.find((item) => item.presetId === presetId);
          if (preset) onSelectPreset(preset);
        }}
      >
        <SelectTrigger id="template-builder-animation-preset" className="w-full">
          <SelectValue placeholder="Select animation preset…" />
        </SelectTrigger>
        <SelectContent>
          {presets.map((preset) => (
            <SelectItem key={preset.presetId} value={preset.presetId}>
              {formatAnimationPresetLabel(preset)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
