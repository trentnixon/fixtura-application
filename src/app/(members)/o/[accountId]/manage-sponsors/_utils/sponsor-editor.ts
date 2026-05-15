import type {
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
