"use client";

import { SponsorEditorStatusBadges } from "./name-fields/sponsor-editor-status-badges";
import { SponsorNameField } from "./name-fields/sponsor-name-field";
import { SponsorVisibilityField } from "./name-fields/sponsor-visibility-field";
import { SPONSOR_EDITOR_NAME_FIELDS_COPY } from "../_constants/sponsor-editor-name-fields";

import type { SponsorEditorNameFieldsBlockProps } from "../_types/sponsor-editor";

export function SponsorEditorNameFieldsBlock({
  sponsor,
  name,
  onNameChange,
  isActive,
  onActiveChange,
  isCreateMode = false,
}: SponsorEditorNameFieldsBlockProps) {
  return (
    <div className="grid min-w-0 gap-4">
      <SponsorNameField
        name={name}
        onNameChange={onNameChange}
        placeholder={
          isCreateMode
            ? SPONSOR_EDITOR_NAME_FIELDS_COPY.nameCreatePlaceholder
            : SPONSOR_EDITOR_NAME_FIELDS_COPY.namePlaceholder
        }
      />
      <SponsorVisibilityField isActive={isActive} onActiveChange={onActiveChange} />
      <SponsorEditorStatusBadges sponsor={sponsor} isActive={isActive} />
    </div>
  );
}
