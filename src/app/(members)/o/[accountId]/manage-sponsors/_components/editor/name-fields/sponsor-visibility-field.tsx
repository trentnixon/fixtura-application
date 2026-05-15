"use client";

import { TypographyLabel } from "@/components/typography";

import { SPONSOR_EDITOR_NAME_FIELDS_COPY } from "../../../_constants/sponsor-editor-name-fields";

export function SponsorVisibilityField({
  isActive,
  onActiveChange,
}: {
  isActive: boolean;
  onActiveChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-3 rounded-xl border px-4 py-3">
      <input
        type="checkbox"
        className="accent-primary"
        checked={!isActive}
        onChange={(event) => onActiveChange(!event.target.checked)}
      />
      <TypographyLabel as="span">
        {SPONSOR_EDITOR_NAME_FIELDS_COPY.hiddenPlacementLabel}
      </TypographyLabel>
    </label>
  );
}
