"use client";

import { useMemo, useState } from "react";

import type { UseManageSponsorsEditorSelectionInput } from "../_types/manage-sponsors-workspace";

export function useManageSponsorsEditorSelection({
  sponsors,
}: UseManageSponsorsEditorSelectionInput) {
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorSponsorId, setEditorSponsorId] = useState<number | string | null>(null);
  const editorSponsor = useMemo(
    () => sponsors.find((sponsor) => sponsor.id === editorSponsorId) ?? null,
    [editorSponsorId, sponsors],
  );

  function closeEditor() {
    setEditorOpen(false);
    setEditorSponsorId(null);
  }

  function openEditor(sponsorId: number | string) {
    setEditorSponsorId(sponsorId);
    setEditorOpen(true);
  }

  function handleEditorOpenChange(open: boolean) {
    if (open) {
      setEditorOpen(true);
      return;
    }

    closeEditor();
  }

  return {
    editorOpen,
    editorSponsor,
    closeEditor,
    openEditor,
    handleEditorOpenChange,
  };
}
