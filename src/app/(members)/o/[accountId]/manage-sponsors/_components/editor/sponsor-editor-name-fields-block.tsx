"use client";

import { SponsorEditorStatusBadges } from "./name-fields/sponsor-editor-status-badges";
import { SponsorNameField } from "./name-fields/sponsor-name-field";
import { SponsorVisibilityField } from "./name-fields/sponsor-visibility-field";

import type { SponsorEditorNameFieldsBlockProps } from "../../_types/sponsor-editor";

export function SponsorEditorNameFieldsBlock({
  sponsor,
  name,
  onNameChange,
  isActive,
  onActiveChange,
}: SponsorEditorNameFieldsBlockProps) {
  return (
    <div className="grid min-w-0 gap-4">
      <SponsorNameField name={name} onNameChange={onNameChange} />
      <SponsorVisibilityField isActive={isActive} onActiveChange={onActiveChange} />
      <SponsorEditorStatusBadges sponsor={sponsor} isActive={isActive} />
    </div>
  );
}
