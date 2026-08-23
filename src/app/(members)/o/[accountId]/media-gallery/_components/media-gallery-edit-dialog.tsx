"use client";

import { useEffect, type ComponentProps } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { captureUserAction } from "@/lib/analytics";
import { ApiError } from "@/lib/api/client/api-error";
import { usePatchAccountMediaLibraryItem } from "@/lib/api/hooks/account/usePatchAccountMediaLibraryItem";
import { parseMediaLibraryApiError } from "@/lib/api/media-library/parse-media-library-api-error";

import { MediaGalleryFormDialogShell } from "./media-gallery-form-dialog-shell";
import {
  MediaGalleryItemFormFields,
  useMediaGalleryForm,
  type MediaGalleryFormValues,
} from "./media-gallery-item-form-fields";
import { useMediaGalleryCategoryConfig } from "../_hooks/use-media-gallery-category-config";
import {
  categoryAssignmentChangedOnEdit,
  formDefaultsFromItem,
  markerFromForm,
  parseTagsInput,
} from "../_utils/media-gallery-form";

import type { AccountMediaLibraryItem } from "@/types/api/account";

function mediaGalleryFieldsChanged(
  item: AccountMediaLibraryItem,
  values: MediaGalleryFormValues,
  categoryConfig: ReturnType<typeof useMediaGalleryCategoryConfig>,
): string[] {
  const defaults = formDefaultsFromItem(item, categoryConfig);
  const fields: string[] = [];

  if (values.title !== defaults.title) fields.push("title");
  if (values.isActive !== defaults.isActive) fields.push("is_active");
  if (values.tagsInput !== defaults.tagsInput) fields.push("tags");
  if (JSON.stringify(values.assetTypes) !== JSON.stringify(defaults.assetTypes)) {
    fields.push("asset_types");
  }
  if (categoryAssignmentChangedOnEdit(item, values.categoryAssignment, categoryConfig)) {
    fields.push("category_assignment");
  }
  if (
    values.useFocalPoint !== defaults.useFocalPoint ||
    values.markerTop !== defaults.markerTop ||
    values.markerLeft !== defaults.markerLeft
  ) {
    fields.push("focal_point");
  }

  return fields;
}

type MediaGalleryEditDialogProps = {
  accountId: string;
  accountSport: string | null;
  item: AccountMediaLibraryItem | null;
  onOpenChange: (open: boolean) => void;
};

export function MediaGalleryEditDialog({
  accountId,
  accountSport,
  item,
  onOpenChange,
}: MediaGalleryEditDialogProps) {
  const patchMutation = usePatchAccountMediaLibraryItem(accountId);
  const dialogOpen = item != null;
  const categoryConfig = useMediaGalleryCategoryConfig(accountId, {
    enabled: dialogOpen,
    ...(item?.resolvedTargets ? { resolvedTargets: item.resolvedTargets } : {}),
  });
  const form = useMediaGalleryForm(formDefaultsFromItem(item ?? undefined, categoryConfig));

  useEffect(() => {
    if (item) {
      form.reset(formDefaultsFromItem(item, categoryConfig));
      patchMutation.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset when item changes
  }, [item]);

  const isPending = patchMutation.isPending;
  const open = dialogOpen;

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && isPending) return;
    if (!nextOpen) onOpenChange(false);
  };

  const applyApiErrors = (error: unknown) => {
    if (!(error instanceof ApiError)) {
      toast.error("Could not save changes. Please try again.");
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
    if (!item) return;
    try {
      const body: Parameters<typeof patchMutation.mutateAsync>[0]["body"] = {
        title: values.title,
        isActive: values.isActive,
        tags: parseTagsInput(values.tagsInput),
        assetTypes: values.assetTypes,
        markerPosition: markerFromForm(values.useFocalPoint, values.markerTop, values.markerLeft),
      };
      if (categoryAssignmentChangedOnEdit(item, values.categoryAssignment, categoryConfig)) {
        body.categoryAssignment = values.categoryAssignment;
      }
      await patchMutation.mutateAsync({
        mediaId: String(item.id),
        body,
      });
      captureUserAction("media_updated", {
        accountId,
        media_id: String(item.id),
        fields_changed: mediaGalleryFieldsChanged(item, values, categoryConfig),
      });
      toast.success("Background updated");
      onOpenChange(false);
    } catch (error) {
      applyApiErrors(error);
    }
  });

  if (!item) return null;

  type DialogShellProps = ComponentProps<typeof MediaGalleryFormDialogShell>;
  const dialogContentProps = {
    showCloseButton: !isPending,
    onPointerDownOutside: (event: Parameters<DialogShellProps["onPointerDownOutside"]>[0]) => {
      if (isPending) event.preventDefault();
    },
    onEscapeKeyDown: (event: Parameters<DialogShellProps["onEscapeKeyDown"]>[0]) => {
      if (isPending) event.preventDefault();
    },
  } as const;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <MediaGalleryFormDialogShell
        {...dialogContentProps}
        onSubmit={onSubmit}
        header={
          <DialogHeader>
            <DialogTitle>Edit background</DialogTitle>
            <DialogDescription>
              Update how this background is categorised and used in your assets.
            </DialogDescription>
          </DialogHeader>
        }
        footer={
          <>
            <Button
              type="button"
              variant="brandPrimaryOutline"
              disabled={isPending}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="brandPrimary" loading={isPending}>
              Save changes
            </Button>
          </>
        }
      >
        <div className="grid gap-6">
          <MediaGalleryItemFormFields
            form={form}
            previewUrl={item.image.url}
            accountSport={accountSport}
            categoryConfig={categoryConfig}
            disabled={isPending}
            idPrefix={`edit-${item.id}`}
          />
        </div>
      </MediaGalleryFormDialogShell>
    </Dialog>
  );
}
