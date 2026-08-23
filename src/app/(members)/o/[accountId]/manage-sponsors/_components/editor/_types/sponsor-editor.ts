import type { ManageSponsorsWorkspaceSponsor } from "../../../_types/manage-sponsors";
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
  accountId: string;
  sponsor: ManageSponsorsWorkspaceSponsor | null;
  onSaveSponsor: (params: SponsorEditorSaveParams) => void | Promise<void>;
  onSaved?: () => void;
  mode?: SponsorEditorMode;
};

export type SponsorEditorFormValues = {
  name: string;
  tagline: string;
  description: string;
  url: string;
  isActive: boolean;
};

export type SponsorEditorLogoState = {
  logoFile: File | null;
  logoPreviewUrl: string | null;
  clearLogo: boolean;
  lastSessionSource: ImageUploaderCropSessionSource | undefined;
};

export type SponsorEditorDialogState = {
  saveDialogOpen: boolean;
  isConfirmSaving: boolean;
  archiveDialogOpen: boolean;
  isArchiving: boolean;
  confirmedAt: string | null;
};

export type SponsorEditorSavePayloadInput = {
  sponsor: ManageSponsorsWorkspaceSponsor;
  form: SponsorEditorFormValues;
  logoFile: File | null;
  clearLogo: boolean;
};

export type SponsorEditorArchivePayloadInput = {
  sponsor: ManageSponsorsWorkspaceSponsor;
  form: SponsorEditorFormValues;
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
  isCreateMode?: boolean;
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

export type SponsorEditorSheetHookResult = {
  form: {
    name: string;
    setName: (value: string) => void;
    isActive: boolean;
    setIsActive: (value: boolean) => void;
  };
  logo: {
    savedLogoUrl: string | null;
    logoPreviewUrl: string | null;
    clearLogo: boolean;
    logoChangeKind: SponsorLogoChangeKind;
    showSavedLogoAboveCard: boolean;
    handleLogoCropComplete: (payload: ImageUploaderCropCompletePayload) => void;
    handleLogoReset: () => void;
  };
  mode: {
    isCreateMode: boolean;
    isEditMode: boolean;
  };
  status: {
    isDirty: boolean;
    confirmedAt: string | null;
  };
  saveDialog: {
    open: boolean;
    setOpen: (open: boolean) => void;
    isSaving: boolean;
    handleOpen: () => void;
    handleConfirm: () => Promise<void>;
  };
  archiveDialog: {
    open: boolean;
    setOpen: (open: boolean) => void;
    isArchiving: boolean;
    handleOpen: () => void;
    handleConfirm: () => Promise<void>;
  };
};
