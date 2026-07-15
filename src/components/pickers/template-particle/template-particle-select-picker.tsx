"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useTemplateParticlePickerList } from "./_hooks";
import { templateParticleLabel } from "./_utils";

export function TemplateParticleSelectPicker({ accountId }: { accountId: string }) {
  const { particles, selectValue, setSelectedId } = useTemplateParticlePickerList(accountId);

  return (
    <div className="max-w-md space-y-2">
      <Label htmlFor="template-particle-picker-select">Template particle</Label>
      <Select value={selectValue} onValueChange={setSelectedId}>
        <SelectTrigger id="template-particle-picker-select" className="w-full max-w-md">
          <SelectValue placeholder="Select a particle preset" />
        </SelectTrigger>
        <SelectContent>
          {particles.map((particle) => (
            <SelectItem key={particle.id} value={String(particle.id)}>
              {templateParticleLabel(particle)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
