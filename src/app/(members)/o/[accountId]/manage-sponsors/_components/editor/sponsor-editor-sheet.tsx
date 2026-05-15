"use client";

import { SponsorEditorCurrentLogoBanner } from "./sheet/sponsor-editor-current-logo-banner";
import { SponsorEditorEmptyState } from "./sheet/sponsor-editor-empty-state";
import { SponsorEditorFormCard } from "./sheet/sponsor-editor-form-card";
import { SponsorEditorArchiveDialog } from "./sponsor-editor-archive-dialog";
import { SponsorEditorSaveDialog } from "./sponsor-editor-save-dialog";
import { useSponsorEditorSheet } from "../../_hooks/use-sponsor-editor-sheet";

import type { SponsorEditorSheetProps } from "../../_types/sponsor-editor";

export function SponsorEditorSheet(props: SponsorEditorSheetProps) {
  const { sponsor } = props;
  const editor = useSponsorEditorSheet(props);
  const { name, setName, isActive, setIsActive } = editor.form;
  const {
    savedLogoUrl,
    logoPreviewUrl,
    clearLogo,
    logoChangeKind,
    showSavedLogoAboveCard,
    handleLogoCropComplete,
    handleLogoReset,
  } = editor.logo;
  const { isCreateMode, isEditMode } = editor.mode;
  const { isDirty, confirmedAt } = editor.status;

  return (
    <div className="grid gap-6">
      <div>
        {sponsor ? (
          <div className="grid gap-3">
            {showSavedLogoAboveCard && savedLogoUrl ? (
              <SponsorEditorCurrentLogoBanner sponsor={sponsor} savedLogoUrl={savedLogoUrl} />
            ) : null}

            <SponsorEditorFormCard
              sponsor={sponsor}
              name={name}
              onNameChange={setName}
              isActive={isActive}
              onActiveChange={setIsActive}
              savedLogoUrl={savedLogoUrl}
              clearLogo={clearLogo}
              logoChangeKind={logoChangeKind}
              isCreateMode={isCreateMode}
              isEditMode={isEditMode}
              isDirty={isDirty}
              confirmedAt={confirmedAt}
              isArchiving={editor.archiveDialog.isArchiving}
              onLogoCropComplete={handleLogoCropComplete}
              onLogoReset={handleLogoReset}
              onArchiveClick={editor.archiveDialog.handleOpen}
              onSaveClick={editor.saveDialog.handleOpen}
            />
          </div>
        ) : (
          <SponsorEditorEmptyState isCreateMode={isCreateMode} />
        )}
      </div>

      <SponsorEditorSaveDialog
        open={editor.saveDialog.open}
        onOpenChange={editor.saveDialog.setOpen}
        isConfirmSaving={editor.saveDialog.isSaving}
        isCreateMode={isCreateMode}
        clearLogo={clearLogo}
        logoPreviewUrl={logoPreviewUrl}
        savedLogoUrl={savedLogoUrl}
        name={name}
        onConfirm={editor.saveDialog.handleConfirm}
      />

      <SponsorEditorArchiveDialog
        open={editor.archiveDialog.open}
        onOpenChange={editor.archiveDialog.setOpen}
        isArchiving={editor.archiveDialog.isArchiving}
        onConfirm={() => void editor.archiveDialog.handleConfirm()}
      />
    </div>
  );
}
