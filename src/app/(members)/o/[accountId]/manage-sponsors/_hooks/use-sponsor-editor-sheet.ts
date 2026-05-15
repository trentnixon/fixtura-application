"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { ApiError } from "@/lib/api/client/api-error";

import {
  deriveLogoChangeKind,
  validateSponsorEditorBeforeArchive,
  validateSponsorEditorBeforeSave,
} from "../_utils/sponsor-editor";

import type { SponsorEditorSheetProps } from "../_types/sponsor-editor";
import type {
  ImageUploaderCropCompletePayload,
  ImageUploaderCropSessionSource,
} from "@/components/media/image-uploader-crop";

export function useSponsorEditorSheet({
  sponsor,
  onSaveSponsor,
  onSaved,
  mode = "edit",
}: SponsorEditorSheetProps) {
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const [clearLogo, setClearLogo] = useState(false);
  const [lastSessionSource, setLastSessionSource] = useState<ImageUploaderCropSessionSource>();
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [isConfirmSaving, setIsConfirmSaving] = useState(false);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [confirmedAt, setConfirmedAt] = useState<string | null>(null);

  useEffect(() => {
    setConfirmedAt(null);
  }, [sponsor?.id]);

  useEffect(() => {
    if (!sponsor) {
      setName("");
      setTagline("");
      setDescription("");
      setUrl("");
      setIsActive(false);
      setLogoFile(null);
      setLogoPreviewUrl(null);
      setClearLogo(false);
      setLastSessionSource(undefined);
      return;
    }

    setName(sponsor.name);
    setTagline(sponsor.tagline ?? "");
    setDescription(sponsor.description ?? "");
    setUrl(sponsor.url ?? "");
    setIsActive(sponsor.isActive);
    setLogoFile(null);
    setLogoPreviewUrl(null);
    setClearLogo(false);
    setLastSessionSource(undefined);
  }, [sponsor]);

  const savedLogoUrl = sponsor?.logoUrl ?? null;
  const isCreateMode = mode === "create";
  const isEditMode = mode === "edit";

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

  const isDirty =
    sponsor != null &&
    (name !== sponsor.name ||
      tagline !== (sponsor.tagline ?? "") ||
      description !== (sponsor.description ?? "") ||
      url !== (sponsor.url ?? "") ||
      isActive !== sponsor.isActive ||
      logoFile !== null ||
      clearLogo);

  function revokeLogoPreviewUrl() {
    if (logoPreviewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(logoPreviewUrl);
    }
  }

  function handleLogoCropComplete(payload: ImageUploaderCropCompletePayload) {
    const nextPreviewUrl = URL.createObjectURL(payload.file);
    revokeLogoPreviewUrl();
    setLogoFile(payload.file);
    setLogoPreviewUrl(nextPreviewUrl);
    setClearLogo(false);
    setLastSessionSource(payload.sessionSource);
  }

  function handleLogoReset() {
    revokeLogoPreviewUrl();
    setLogoFile(null);
    setLogoPreviewUrl(null);
    setLastSessionSource(undefined);
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
    setSaveDialogOpen(true);
  }

  async function handleConfirmSave() {
    if (!sponsor) return;

    setIsConfirmSaving(true);
    try {
      await Promise.resolve(
        onSaveSponsor({
          sponsorId: sponsor.id,
          name,
          tagline: tagline.trim() || null,
          description: description.trim() || null,
          url: url.trim() || null,
          isActive,
          logoFile,
          clearLogo,
        }),
      );
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : "Could not save sponsor. Please try again.";
      toast.error(message);
      setIsConfirmSaving(false);
      return;
    }

    setSaveDialogOpen(false);
    setIsConfirmSaving(false);
    setLogoFile(null);
    setLastSessionSource(undefined);
    setClearLogo(false);
    revokeLogoPreviewUrl();
    setLogoPreviewUrl(null);
    setConfirmedAt(getConfirmedTimeStamp());
    toast.success("Sponsor saved", {
      description: isCreateMode
        ? "New sponsor was created on your account."
        : sponsor.isDraft
          ? "Draft sponsor changes were saved."
          : "Sponsor updates were saved.",
    });
    onSaved?.();
  }

  function handleOpenArchive() {
    if (!sponsor) return;
    if (!sponsor.isActive) {
      toast.info("This sponsor is already archived.");
      return;
    }

    const error = validateSponsorEditorBeforeArchive({ sponsor, name, url });
    if (error) {
      toast.error(error);
      return;
    }
    setArchiveDialogOpen(true);
  }

  async function handleConfirmArchive() {
    if (!sponsor) return;

    setIsArchiving(true);
    try {
      await Promise.resolve(
        onSaveSponsor({
          sponsorId: sponsor.id,
          name,
          tagline: tagline.trim() || null,
          description: description.trim() || null,
          url: url.trim() || null,
          isActive: false,
          logoFile: null,
          clearLogo: false,
        }),
      );
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : "Could not update sponsor. Please try again.";
      toast.error(message);
      setIsArchiving(false);
      return;
    }

    setArchiveDialogOpen(false);
    setIsArchiving(false);
    setIsActive(false);
    setLogoFile(null);
    setLastSessionSource(undefined);
    revokeLogoPreviewUrl();
    setLogoPreviewUrl(null);
    setConfirmedAt(getConfirmedTimeStamp());
    toast.success("Sponsor archived", {
      description: "This sponsor is now archived on your account.",
    });
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
      setName,
      isActive,
      setIsActive,
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
      setOpen: setSaveDialogOpen,
      isSaving: isConfirmSaving,
      handleOpen: handleOpenSave,
      handleConfirm: handleConfirmSave,
    },
    archiveDialog: {
      open: archiveDialogOpen,
      setOpen: setArchiveDialogOpen,
      isArchiving,
      handleOpen: handleOpenArchive,
      handleConfirm: handleConfirmArchive,
    },
  };
}

function getConfirmedTimeStamp(): string {
  return new Date().toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
