"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  SPONSOR_EDITOR_NAME_FIELD_ID,
  SPONSOR_EDITOR_NAME_FIELDS_COPY,
} from "../../_constants/sponsor-editor-name-fields";

export function SponsorNameField({
  name,
  onNameChange,
}: {
  name: string;
  onNameChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={SPONSOR_EDITOR_NAME_FIELD_ID}>
        {SPONSOR_EDITOR_NAME_FIELDS_COPY.nameLabel}
      </Label>
      <Input
        id={SPONSOR_EDITOR_NAME_FIELD_ID}
        value={name}
        onChange={(event) => onNameChange(event.target.value)}
        placeholder={SPONSOR_EDITOR_NAME_FIELDS_COPY.namePlaceholder}
      />
    </div>
  );
}
