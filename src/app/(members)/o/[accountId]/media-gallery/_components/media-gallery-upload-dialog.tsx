"use client";

import { useEffect, useRef, useState, type FormEvent, type MouseEvent } from "react";
import { toast } from "sonner";

import { ImageUploaderCrop } from "@/components/media/image-uploader-crop";
import {
  REMOTION_PREVIEW_COMPOSITION_HEIGHT,
  REMOTION_PREVIEW_COMPOSITION_WIDTH,
} from "@/components/remotion/_constants/remotion-player";
import { TypographyHelperText } from "@/components/typography";
import { Button } from "@/components/ui/button";
import { Dialog, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ApiError } from "@/lib/api/client/api-error";
import { useCreateAccountMediaLibraryItem } from "@/lib/api/hooks/account/useCreateAccountMediaLibraryItem";
import { parseMediaLibraryApiError } from "@/lib/api/media-library/parse-media-library-api-error";
import { cn } from "@/lib/utils";

import { MediaGalleryFormDialogShell } from "./media-gallery-form-dialog-shell";
import { MediaGalleryItemFormFields, useMediaGalleryForm } from "./media-gallery-item-form-fields";
import { useMediaGalleryCategoryConfig } from "../_hooks/use-media-gallery-category-config";
import {
  formDefaultsFromItem,
  markerFromForm,
  MEDIA_LIBRARY_MAX_FILE_MB,
  parseTagsInput,
} from "../_utils/media-gallery-form";

type UploadStep = 1 | 2;

type MediaGalleryUploadDialogProps = {
  accountId: string;
  accountSport: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function MediaGalleryUploadDialog({
  accountId,
  accountSport,
  open,
  onOpenChange,
}: MediaGalleryUploadDialogProps) {
  const createMutation = useCreateAccountMediaLibraryItem(accountId);
  const categoryConfig = useMediaGalleryCategoryConfig(accountId, { enabled: open });
  const [step, setStep] = useState<UploadStep>(1);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const uploadInFlightRef = useRef(false);

  const form = useMediaGalleryForm(formDefaultsFromItem(undefined, categoryConfig));

  const resetUpload = () => {
    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setStep(1);
    setUploadFile(null);
    setPreviewUrl(null);
    setUploadError(null);
    form.reset(formDefaultsFromItem(undefined, categoryConfig));
  };

  useEffect(() => {
    if (!open) {
      resetUpload();
      createMutation.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset when dialog closes
  }, [open]);

  const isPending = createMutation.isPending;

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && isPending) return;
    onOpenChange(nextOpen);
  };

  const applyApiErrors = (error: unknown) => {
    if (!(error instanceof ApiError)) {
      toast.error("Could not upload image. Please try again.");
      return;
    }
    const parsed = parseMediaLibraryApiError(error.details);
    toast.error(parsed.message);
    for (const [field, messages] of Object.entries(parsed.fieldErrors)) {
      const message = messages[0];
      if (!message) continue;
      if (field === "title") form.setError("title", { message });
      if (field === "assetTypes" || field === "assetType") {
        form.setError("assetTypes", { message });
      }
      if (field === "categoryAssignment" || field.startsWith("categoryAssignment.")) {
        form.setError("categoryAssignment", { message });
      }
      if (field.startsWith("tags")) form.setError("tagsInput", { message });
    }
  };

  const onSubmit = form.handleSubmit(async (values) => {
    if (step !== 2 || uploadInFlightRef.current || isPending) {
      return;
    }

    if (!uploadFile) {
      toast.error("Choose an image before uploading.");
      setStep(1);
      return;
    }

    uploadInFlightRef.current = true;
    try {
      await createMutation.mutateAsync({
        file: uploadFile,
        metadata: {
          title: values.title,
          isActive: values.isActive,
          tags: parseTagsInput(values.tagsInput),
          categoryAssignment: values.categoryAssignment,
          assetTypes: values.assetTypes,
          ...(() => {
            const markerPosition = markerFromForm(
              values.useFocalPoint,
              values.markerTop,
              values.markerLeft,
            );
            return markerPosition.length > 0 ? { markerPosition } : {};
          })(),
        },
      });
      toast.success("Background uploaded");
      onOpenChange(false);
    } catch (error) {
      applyApiErrors(error);
    } finally {
      uploadInFlightRef.current = false;
    }
  });

  const uploadRequirementsPrimary = `JPEG, PNG, or WebP · max ${MEDIA_LIBRARY_MAX_FILE_MB} MB · crop as 4:5 portrait or 5:4 landscape after selecting.`;

  const stepTitle =
    step === 1 ? "Upload background image · Step 1 of 2" : "Upload background image · Step 2 of 2";
  const stepPurpose = step === 1 ? "Select and crop" : "Configure usage and availability";
  const stepDescription =
    step === 1
      ? uploadRequirementsPrimary
      : "Set category, asset types, and visibility for this background.";

  const handleContinue = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!uploadFile) {
      toast.error("Choose and crop an image before continuing.");
      return;
    }
    // Defer so the Continue click cannot land on the step-2 Upload button in the same slot.
    queueMicrotask(() => setStep(2));
  };

  const handleUpload = () => {
    if (step !== 2) return;
    void onSubmit();
  };

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (step !== 2) return;
    void onSubmit();
  };

  const handleBack = () => {
    setStep(1);
  };

  const dialogContentProps = {
    showCloseButton: !isPending,
    onPointerDownOutside: (event) => {
      if (isPending) event.preventDefault();
    },
    onEscapeKeyDown: (event) => {
      if (isPending) event.preventDefault();
    },
  } as const;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <MediaGalleryFormDialogShell
        {...dialogContentProps}
        onSubmit={handleFormSubmit}
        header={
          <DialogHeader>
            <DialogTitle>{stepTitle}</DialogTitle>
            <DialogDescription>{stepPurpose}</DialogDescription>
            <p className="text-muted-foreground sr-only text-sm">{stepDescription}</p>
          </DialogHeader>
        }
        footer={
          <>
            {step === 2 ? (
              <Button
                type="button"
                variant="brandPrimaryOutline"
                disabled={isPending}
                onClick={handleBack}
              >
                Back
              </Button>
            ) : null}
            <Button
              type="button"
              variant="brandPrimaryOutline"
              disabled={isPending}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            {step === 1 ? (
              <Button
                type="button"
                variant="brandPrimary"
                disabled={!uploadFile || isPending}
                onClick={handleContinue}
              >
                Continue
              </Button>
            ) : (
              <Button
                type="button"
                variant="brandPrimary"
                loading={isPending}
                disabled={!uploadFile || isPending}
                onClick={handleUpload}
              >
                Upload
              </Button>
            )}
          </>
        }
      >
        <div className="grid gap-6">
          <div className={cn("space-y-2", step === 2 && "hidden")} aria-hidden={step === 2}>
            <ImageUploaderCrop
              aspect={REMOTION_PREVIEW_COMPOSITION_WIDTH / REMOTION_PREVIEW_COMPOSITION_HEIGHT}
              aspectLabel="4:5 — Portrait"
              aspectPresets={[
                {
                  aspect: REMOTION_PREVIEW_COMPOSITION_WIDTH / REMOTION_PREVIEW_COMPOSITION_HEIGHT,
                  label: "4:5 — Portrait",
                },
                {
                  aspect: REMOTION_PREVIEW_COMPOSITION_HEIGHT / REMOTION_PREVIEW_COMPOSITION_WIDTH,
                  label: "5:4 — Landscape",
                },
              ]}
              hideAspectPresetOnUploader
              maxFileSizeMb={MEDIA_LIBRARY_MAX_FILE_MB}
              label=""
              helperText={uploadRequirementsPrimary}
              onError={setUploadError}
              onComplete={(payload) => {
                setUploadError(null);
                setUploadFile(payload.file);
                setPreviewUrl(payload.previewUrl);
                if (!form.getValues("title")) {
                  const stem = payload.file.name.replace(/\.[^/.]+$/, "");
                  form.setValue("title", stem.trim() || "Background image");
                }
              }}
              onReset={() => {
                setUploadError(null);
                setUploadFile(null);
                setPreviewUrl(null);
                if (step === 2) {
                  setStep(1);
                }
              }}
            />
            {uploadError ? (
              <TypographyHelperText className="text-destructive" role="alert">
                {uploadError}
              </TypographyHelperText>
            ) : null}
          </div>

          {step === 2 && uploadFile ? (
            <div className="grid gap-6">
              <div className="border-primary/20 bg-primary/5 flex items-center gap-4 rounded-xl border p-3 sm:p-4">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Selected background preview"
                    className="bg-muted size-16 shrink-0 rounded-lg object-cover sm:size-20"
                  />
                ) : null}
                <div className="grid min-w-0 gap-0.5">
                  <p className="truncate text-sm font-medium">{uploadFile.name}</p>
                  <TypographyHelperText>
                    Selected image — use Back to adjust cropping.
                  </TypographyHelperText>
                </div>
              </div>

              <MediaGalleryItemFormFields
                form={form}
                previewUrl={previewUrl ?? uploadFile.name}
                accountSport={accountSport}
                categoryConfig={categoryConfig}
                disabled={isPending}
                idPrefix="upload"
              />
            </div>
          ) : null}
        </div>
      </MediaGalleryFormDialogShell>
    </Dialog>
  );
}
