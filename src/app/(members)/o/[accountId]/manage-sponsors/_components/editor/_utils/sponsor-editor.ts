import { ApiError } from "@/lib/api/client/api-error";

import type { ManageSponsorsWorkspaceSponsor } from "../../../_types/manage-sponsors";
import type {
  SponsorEditorArchivePayloadInput,
  SponsorEditorFormValues,
  SponsorEditorSavePayloadInput,
  SponsorEditorSaveParams,
  SponsorEditorValidationInput,
  SponsorLogoChangeInput,
  SponsorLogoChangeKind,
} from "../_types/sponsor-editor";

export function changeKindLabel(kind: SponsorLogoChangeKind): string {
  switch (kind) {
    case "first-upload":
      return "First upload";
    case "replacement":
      return "Replacement";
    case "recrop":
      return "Recrop";
    default:
      return "-";
  }
}

export function deriveLogoChangeKind({
  logoFile,
  savedLogoUrl,
  sessionSource,
}: SponsorLogoChangeInput): SponsorLogoChangeKind {
  if (!logoFile) return "none";
  if (sessionSource === "editableUrl" || sessionSource === "recrop") return "recrop";
  return savedLogoUrl === null ? "first-upload" : "replacement";
}

export function buildSponsorEditorFormValues(
  sponsor: ManageSponsorsWorkspaceSponsor | null,
): SponsorEditorFormValues {
  return {
    name: sponsor?.name ?? "",
    tagline: sponsor?.tagline ?? "",
    description: sponsor?.description ?? "",
    url: sponsor?.url ?? "",
    isActive: sponsor?.isActive ?? false,
  };
}

export function isSponsorEditorDirty({
  sponsor,
  form,
  logoFile,
  clearLogo,
}: {
  sponsor: ManageSponsorsWorkspaceSponsor | null;
  form: SponsorEditorFormValues;
  logoFile: File | null;
  clearLogo: boolean;
}) {
  return (
    sponsor != null &&
    (form.name !== sponsor.name ||
      form.tagline !== (sponsor.tagline ?? "") ||
      form.description !== (sponsor.description ?? "") ||
      form.url !== (sponsor.url ?? "") ||
      form.isActive !== sponsor.isActive ||
      logoFile !== null ||
      clearLogo)
  );
}

export function buildSponsorEditorSavePayload({
  sponsor,
  form,
  logoFile,
  clearLogo,
}: SponsorEditorSavePayloadInput): SponsorEditorSaveParams {
  return {
    sponsorId: sponsor.id,
    name: form.name,
    tagline: form.tagline.trim() || null,
    description: form.description.trim() || null,
    url: form.url.trim() || null,
    isActive: form.isActive,
    logoFile,
    clearLogo,
  };
}

export function buildSponsorEditorArchivePayload({
  sponsor,
  form,
}: SponsorEditorArchivePayloadInput): SponsorEditorSaveParams {
  return {
    sponsorId: sponsor.id,
    name: form.name,
    tagline: form.tagline.trim() || null,
    description: form.description.trim() || null,
    url: form.url.trim() || null,
    isActive: false,
    logoFile: null,
    clearLogo: false,
  };
}

export function sponsorEditorSaveErrorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : "Could not save sponsor. Please try again.";
}

export function sponsorEditorArchiveErrorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : "Could not update sponsor. Please try again.";
}

export function getConfirmedTimeStamp(): string {
  return new Date().toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function validateSponsorEditorBeforeSave({
  sponsor,
  name,
  url,
  isActive,
  logoFile,
  clearLogo,
  savedLogoUrl,
}: SponsorEditorValidationInput): string | null {
  if (!sponsor) return "No sponsor selected.";
  if (!name.trim()) return "Sponsor name is required.";

  const resultingHasLogo = clearLogo ? false : Boolean(logoFile || savedLogoUrl);
  if (isActive && !resultingHasLogo) {
    return "A logo is required before a sponsor can be used outside the archive.";
  }

  return validateSponsorEditorUrl(url);
}

export function validateSponsorEditorBeforeArchive({
  sponsor,
  name,
  url,
}: Pick<SponsorEditorValidationInput, "sponsor" | "name" | "url">): string | null {
  if (!sponsor) return "No sponsor selected.";
  if (!name.trim()) return "Sponsor name is required.";

  return validateSponsorEditorUrl(url);
}

function validateSponsorEditorUrl(url: string): string | null {
  if (url.trim().length === 0) return null;

  try {
    new URL(url.trim());
  } catch {
    return "Enter a valid URL including http:// or https://.";
  }

  return null;
}
