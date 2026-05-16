"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import { SponsorEditorSheet } from "../../editor/sponsor-editor-sheet";
import {
  MANAGE_SPONSORS_EDITOR_SHEET_CONTENT_CLASS_NAME,
  MANAGE_SPONSORS_EDITOR_SHEET_COPY,
} from "../_constants/manage-sponsors-workspace";

import type { ManageSponsorsEditorSheetProps } from "../_types/manage-sponsors-workspace";

export function ManageSponsorsEditorSheet({
  open,
  sponsor,
  onOpenChange,
  onSaveSponsor,
  onSaved,
}: ManageSponsorsEditorSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className={MANAGE_SPONSORS_EDITOR_SHEET_CONTENT_CLASS_NAME}>
        <SheetHeader>
          <SheetTitle>{MANAGE_SPONSORS_EDITOR_SHEET_COPY.title}</SheetTitle>
          <SheetDescription>{MANAGE_SPONSORS_EDITOR_SHEET_COPY.description}</SheetDescription>
        </SheetHeader>
        <SponsorEditorSheet
          mode="edit"
          sponsor={sponsor}
          onSaveSponsor={onSaveSponsor}
          onSaved={onSaved}
        />
      </SheetContent>
    </Sheet>
  );
}
