import type {
  SponsorEditorDialogState,
  SponsorEditorFormValues,
  SponsorEditorMode,
  SponsorEditorLogoState,
} from "../_types/sponsor-editor";

export const EMPTY_SPONSOR_EDITOR_FORM_VALUES: SponsorEditorFormValues = {
  name: "",
  tagline: "",
  description: "",
  url: "",
  isActive: false,
};

export const EMPTY_SPONSOR_EDITOR_LOGO_STATE: SponsorEditorLogoState = {
  logoFile: null,
  logoPreviewUrl: null,
  clearLogo: false,
  lastSessionSource: undefined,
};

export const INITIAL_SPONSOR_EDITOR_DIALOG_STATE: SponsorEditorDialogState = {
  saveDialogOpen: false,
  isConfirmSaving: false,
  archiveDialogOpen: false,
  isArchiving: false,
  confirmedAt: null,
};

export const SPONSOR_EDITOR_ALREADY_ARCHIVED_MESSAGE = "This sponsor is already archived.";

export const SPONSOR_EDITOR_ARCHIVED_TOAST = {
  title: "Sponsor archived",
  description: "This sponsor is now archived on your account.",
} as const;

export function getSponsorSavedToastDescription(mode: SponsorEditorMode, isDraft: boolean): string {
  if (mode === "create") {
    return "New sponsor was created on your account.";
  }

  return isDraft ? "Draft sponsor changes were saved." : "Sponsor updates were saved.";
}
