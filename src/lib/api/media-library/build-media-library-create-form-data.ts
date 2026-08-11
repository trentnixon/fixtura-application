import type { CreateAccountMediaLibraryMetadata } from "@/types/api/account";

export function buildMediaLibraryCreateFormData(
  file: File,
  metadata?: CreateAccountMediaLibraryMetadata,
): FormData {
  const form = new FormData();
  form.append("file", file, file.name);

  if (metadata?.title !== undefined) {
    form.append("title", metadata.title);
  }
  if (metadata?.isActive !== undefined) {
    form.append("isActive", JSON.stringify(metadata.isActive));
  }
  if (metadata?.tags !== undefined) {
    form.append("tags", JSON.stringify(metadata.tags));
  }
  if (metadata?.ageGroup !== undefined) {
    form.append("ageGroup", metadata.ageGroup);
  }
  if (metadata?.categoryAssignment !== undefined) {
    form.append("categoryAssignment", JSON.stringify(metadata.categoryAssignment));
  }
  if (metadata?.assetTypes !== undefined) {
    form.append("assetTypes", JSON.stringify(metadata.assetTypes));
  }
  if (metadata?.markerPosition !== undefined && metadata.markerPosition.length > 0) {
    form.append("markerPosition", JSON.stringify(metadata.markerPosition));
  }

  return form;
}
