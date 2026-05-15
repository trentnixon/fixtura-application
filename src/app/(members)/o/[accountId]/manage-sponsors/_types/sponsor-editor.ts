import type { ManageSponsorsWorkspaceSponsor } from "./manage-sponsors";
import type {
  ImageUploaderCropCompletePayload,
  ImageUploaderCropSessionSource,
} from "@/components/media/image-uploader-crop";

export type SponsorLogoChangeKind = "none" | "first-upload" | "replacement" | "recrop";

export type SponsorEditorMode = "edit" | "create";

export type SponsorEditorSaveParams = {
  sponsorId: number | string;
  name: string;
  tagline: string | null;
  description: string | null;
  url: string | null;
  isActive: boolean;
  logoFile: File | null;
  clearLogo: boolean;
};

export type SponsorEditorSheetProps = {
  sponsor: ManageSponsorsWorkspaceSponsor | null;
  onSaveSponsor: (params: SponsorEditorSaveParams) => void | Promise<void>;
  onSaved?: () => void;
  mode?: SponsorEditorMode;
};

export type SponsorEditorCurrentLogoBannerProps = {
  sponsor: ManageSponsorsWorkspaceSponsor;
  savedLogoUrl: string;
};

export type SponsorEditorEmptyStateProps = {
  isCreateMode: boolean;
};

export type SponsorEditorFormCardProps = {
  sponsor: ManageSponsorsWorkspaceSponsor;
  name: string;
  onNameChange: (value: string) => void;
  isActive: boolean;
  onActiveChange: (value: boolean) => void;
  savedLogoUrl: string | null;
  clearLogo: boolean;
  logoChangeKind: SponsorLogoChangeKind;
  isCreateMode: boolean;
  isEditMode: boolean;
  isDirty: boolean;
  confirmedAt: string | null;
  isArchiving: boolean;
  onLogoCropComplete: (payload: ImageUploaderCropCompletePayload) => void;
  onLogoReset: () => void;
  onArchiveClick: () => void;
  onSaveClick: () => void;
};

export type SponsorEditorActionsProps = {
  sponsor: ManageSponsorsWorkspaceSponsor;
  isCreateMode: boolean;
  isDirty: boolean;
  confirmedAt: string | null;
  isArchiving: boolean;
  onArchiveClick: () => void;
  onSaveClick: () => void;
};

export type SponsorEditorArchiveDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isArchiving: boolean;
  onConfirm: () => void;
};

export type SponsorEditorSaveDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isConfirmSaving: boolean;
  isCreateMode: boolean;
  clearLogo: boolean;
  logoPreviewUrl: string | null;
  savedLogoUrl: string | null;
  name: string;
  onConfirm: () => void;
};

export type SponsorEditorLogoPreviewProps = {
  clearLogo: boolean;
  logoPreviewUrl: string | null;
  savedLogoUrl: string | null;
  name: string;
};

export type SponsorEditorLogoUploadBlockProps = {
  savedLogoUrl: string | null;
  clearLogo: boolean;
  logoChangeKind: SponsorLogoChangeKind;
  showFileFormatCallout?: boolean;
  onLogoCropComplete: (payload: ImageUploaderCropCompletePayload) => void;
  onLogoReset: () => void;
};

export type SponsorEditorNameFieldsBlockProps = {
  sponsor: ManageSponsorsWorkspaceSponsor;
  name: string;
  onNameChange: (value: string) => void;
  isActive: boolean;
  onActiveChange: (value: boolean) => void;
};

export type SponsorLogoChangeInput = {
  logoFile: File | null;
  savedLogoUrl: string | null;
  sessionSource: ImageUploaderCropSessionSource | undefined;
};

export type SponsorEditorValidationInput = {
  sponsor: ManageSponsorsWorkspaceSponsor | null;
  name: string;
  url: string;
  isActive: boolean;
  logoFile: File | null;
  clearLogo: boolean;
  savedLogoUrl: string | null;
};
