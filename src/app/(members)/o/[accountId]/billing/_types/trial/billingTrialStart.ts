import type { OrganisationTrialPresentation } from "../../_types/trial/organisationTrialPresentation";

export type BillingTrialStartCardProps = {
  accountId: string;
  enabled: boolean;
  availableActions?: Partial<Record<string, boolean>>;
  organisationTrialPresentation?: OrganisationTrialPresentation;
};

export type BillingTrialStartConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountName: string;
  errorMessage: string | null;
  isPending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};
