"use client";

import { TypographyMuted } from "@/components/typography";

import type { SponsorEditorEmptyStateProps } from "../../../_types/sponsor-editor";

export function SponsorEditorEmptyState({ isCreateMode }: SponsorEditorEmptyStateProps) {
  return (
    <TypographyMuted>
      {isCreateMode
        ? "Add sponsor details and logo to create a new sponsor."
        : "Select a sponsor from the pool to inspect it."}
    </TypographyMuted>
  );
}
