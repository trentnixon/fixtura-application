"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { captureUserAction } from "@/lib/analytics";

import {
  EMPTY_SPONSOR_EDITOR_FORM_VALUES,
  EMPTY_SPONSOR_EDITOR_LOGO_STATE,
  INITIAL_SPONSOR_EDITOR_DIALOG_STATE,
  getSponsorSavedToastDescription,
  SPONSOR_EDITOR_ALREADY_ARCHIVED_MESSAGE,
  SPONSOR_EDITOR_ARCHIVED_TOAST,
} from "../_constants/sponsor-editor-sheet";
import {
  buildSponsorEditorArchivePayload,
  buildSponsorEditorFormValues,
  buildSponsorEditorSavePayload,
  deriveLogoChangeKind,
  getConfirmedTimeStamp,
  isSponsorEditorDirty,
  sponsorEditorArchiveErrorMessage,
  sponsorEditorSaveErrorMessage,
  validateSponsorEditorBeforeArchive,
  validateSponsorEditorBeforeSave,
} from "../_utils/sponsor-editor";

import type {
  SponsorEditorDialogState,
  SponsorEditorFormValues,
  SponsorEditorLogoState,
  SponsorEditorSheetHookResult,
  SponsorEditorSheetProps,
} from "../_types/sponsor-editor";
import type { ImageUploaderCropCompletePayload } from "@/components/media/image-uploader-crop";

export function useSponsorEditorSheet({
  accountId,
  sponsor,
  onSaveSponsor,
  onSaved,
  mode = "edit",
}: SponsorEditorSheetProps): SponsorEditorSheetHookResult {
  const [formValues, setFormValues] = useState<SponsorEditorFormValues>(
    EMPTY_SPONSOR_EDITOR_FORM_VALUES,
  );
  const [logoState, setLogoState] = useState<SponsorEditorLogoState>(
    EMPTY_SPONSOR_EDITOR_LOGO_STATE,
  );
  const [dialogState, setDialogState] = useState<SponsorEditorDialogState>(
    INITIAL_SPONSOR_EDITOR_DIALOG_STATE,
  );

  useEffect(() => {
    setDialogState((current) => ({ ...current, confirmedAt: null }));
  }, [sponsor?.id]);

  useEffect(() => {
    setFormValues(buildSponsorEditorFormValues(sponsor));
    setLogoState(EMPTY_SPONSOR_EDITOR_LOGO_STATE);
  }, [sponsor]);

  const savedLogoUrl = sponsor?.logoUrl ?? null;
  const isCreateMode = mode === "create";
  const isEditMode = mode === "edit";
  const { name, url, isActive } = formValues;
  const { logoFile, logoPreviewUrl, clearLogo, lastSessionSource } = logoState;
  const { saveDialogOpen, isConfirmSaving, archiveDialogOpen, isArchiving, confirmedAt } =
    dialogState;

  const logoChangeKind = useMemo(
    () =>
      deriveLogoChangeKind({
        logoFile,
        savedLogoUrl,
        sessionSource: lastSessionSource,
      }),
    [lastSessionSource, logoFile, savedLogoUrl],
  );

  const showSavedLogoAboveCard = Boolean(savedLogoUrl) && !clearLogo && logoFile === null;

  const isDirty = isSponsorEditorDirty({
    sponsor,
    form: formValues,
    logoFile,
    clearLogo,
  });

  function revokeLogoPreviewUrl() {
    if (logoPreviewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(logoPreviewUrl);
    }
  }

  function handleLogoCropComplete(payload: ImageUploaderCropCompletePayload) {
    const nextPreviewUrl = URL.createObjectURL(payload.file);
    revokeLogoPreviewUrl();
    setLogoState({
      logoFile: payload.file,
      logoPreviewUrl: nextPreviewUrl,
      clearLogo: false,
      lastSessionSource: payload.sessionSource,
    });
  }

  function handleLogoReset() {
    revokeLogoPreviewUrl();
    setLogoState((current) => ({
      ...current,
      logoFile: null,
      logoPreviewUrl: null,
      lastSessionSource: undefined,
    }));
  }

  function handleOpenSave() {
    const error = validateSponsorEditorBeforeSave({
      sponsor,
      name,
      url,
      isActive,
      logoFile,
      clearLogo,
      savedLogoUrl,
    });
    if (error) {
      toast.error(error);
      return;
    }
    setDialogState((current) => ({ ...current, saveDialogOpen: true }));
  }

  async function handleConfirmSave() {
    if (!sponsor) return;

    setDialogState((current) => ({ ...current, isConfirmSaving: true }));
    try {
      await Promise.resolve(
        onSaveSponsor(
          buildSponsorEditorSavePayload({
            sponsor,
            form: formValues,
            logoFile,
            clearLogo,
          }),
        ),
      );
    } catch (error) {
      toast.error(sponsorEditorSaveErrorMessage(error));
      setDialogState((current) => ({ ...current, isConfirmSaving: false }));
      return;
    }

    revokeLogoPreviewUrl();
    setDialogState((current) => ({
      ...current,
      saveDialogOpen: false,
      isConfirmSaving: false,
      confirmedAt: getConfirmedTimeStamp(),
    }));
    setLogoState((current) => ({
      ...current,
      logoFile: null,
      logoPreviewUrl: null,
      clearLogo: false,
      lastSessionSource: undefined,
    }));
    toast.success("Sponsor saved", {
      description: getSponsorSavedToastDescription(mode, sponsor.isDraft),
    });
    onSaved?.();
  }

  function handleOpenArchive() {
    if (!sponsor) return;
    if (!sponsor.isActive) {
      toast.info(SPONSOR_EDITOR_ALREADY_ARCHIVED_MESSAGE);
      return;
    }

    const error = validateSponsorEditorBeforeArchive({ sponsor, name, url });
    if (error) {
      toast.error(error);
      return;
    }
    setDialogState((current) => ({ ...current, archiveDialogOpen: true }));
  }

  async function handleConfirmArchive() {
    if (!sponsor) return;

    setDialogState((current) => ({ ...current, isArchiving: true }));
    try {
      await Promise.resolve(
        onSaveSponsor(
          buildSponsorEditorArchivePayload({
            sponsor,
            form: formValues,
          }),
        ),
      );
    } catch (error) {
      toast.error(sponsorEditorArchiveErrorMessage(error));
      setDialogState((current) => ({ ...current, isArchiving: false }));
      return;
    }

    revokeLogoPreviewUrl();
    setFormValues((current) => ({ ...current, isActive: false }));
    setDialogState((current) => ({
      ...current,
      archiveDialogOpen: false,
      isArchiving: false,
      confirmedAt: getConfirmedTimeStamp(),
    }));
    setLogoState((current) => ({
      ...current,
      logoFile: null,
      logoPreviewUrl: null,
      lastSessionSource: undefined,
    }));
    toast.success(SPONSOR_EDITOR_ARCHIVED_TOAST.title, {
      description: SPONSOR_EDITOR_ARCHIVED_TOAST.description,
    });
    captureUserAction("sponsor_archived", { accountId });
    onSaved?.();
  }

  useEffect(() => {
    return () => {
      if (logoPreviewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(logoPreviewUrl);
      }
    };
  }, [logoPreviewUrl]);

  return {
    form: {
      name,
      setName: (value) => setFormValues((current) => ({ ...current, name: value })),
      isActive,
      setIsActive: (value) => setFormValues((current) => ({ ...current, isActive: value })),
    },
    logo: {
      savedLogoUrl,
      logoPreviewUrl,
      clearLogo,
      logoChangeKind,
      showSavedLogoAboveCard,
      handleLogoCropComplete,
      handleLogoReset,
    },
    mode: {
      isCreateMode,
      isEditMode,
    },
    status: {
      isDirty,
      confirmedAt,
    },
    saveDialog: {
      open: saveDialogOpen,
      setOpen: (open) => setDialogState((current) => ({ ...current, saveDialogOpen: open })),
      isSaving: isConfirmSaving,
      handleOpen: handleOpenSave,
      handleConfirm: handleConfirmSave,
    },
    archiveDialog: {
      open: archiveDialogOpen,
      setOpen: (open) => setDialogState((current) => ({ ...current, archiveDialogOpen: open })),
      isArchiving,
      handleOpen: handleOpenArchive,
      handleConfirm: handleConfirmArchive,
    },
  };
}
