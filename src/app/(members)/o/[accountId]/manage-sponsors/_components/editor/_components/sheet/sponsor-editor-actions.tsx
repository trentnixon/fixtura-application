"use client";

import { PersistentFieldFeedback } from "@/components/brand-color";
import { TypographySuccessText } from "@/components/typography";
import { Button } from "@/components/ui/button";

import type { SponsorEditorActionsProps } from "../../_types/sponsor-editor";

export function SponsorEditorActions({
  sponsor,
  isCreateMode,
  isDirty,
  confirmedAt,
  isArchiving,
  onArchiveClick,
  onSaveClick,
}: SponsorEditorActionsProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
        {!isCreateMode ? (
          <Button
            type="button"
            variant="brandPrimaryOutline"
            disabled={!sponsor.isActive || isArchiving}
            title={!sponsor.isActive ? "Sponsor is already archived" : undefined}
            onClick={onArchiveClick}
          >
            Archive sponsor
          </Button>
        ) : null}
        <Button type="button" variant="success" disabled={!isDirty} onClick={onSaveClick}>
          Save sponsor
        </Button>
      </div>
      {confirmedAt ? (
        <PersistentFieldFeedback variant="success">
          <TypographySuccessText tone="default" className="text-inherit">
            Sponsor saved at {confirmedAt}.
          </TypographySuccessText>
        </PersistentFieldFeedback>
      ) : null}
    </div>
  );
}
