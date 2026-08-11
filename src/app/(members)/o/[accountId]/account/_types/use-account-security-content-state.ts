import type { EditDisplayNameDialogProps } from "./edit-display-name-dialog";
import type { EditLoginEmailDialogProps } from "./edit-login-email-dialog";
import type { AccountOrganisationContextQueryResult } from "@/lib/api/hooks/account/useAccountOrganisationContext";
import type { AccountSettingsQueryResult } from "@/lib/api/hooks/account/useAccountSettings";
import type { AccountOrganisationContextData, AccountMeResponse } from "@/types/api/account";
import type { UseQueryResult } from "@tanstack/react-query";

export type UseAccountSecurityContentStateArgs = {
  accountId: string;
};

export type AccountSecurityPasswordDialogState = {
  accountId: string;
  formKey: number;
  isOpen: boolean;
  onEdit: () => void;
  onOpenChange: (open: boolean) => void;
};

export type UseAccountSecurityContentStateResult = {
  emailDialog: EditLoginEmailDialogProps;
  meQ: UseQueryResult<AccountMeResponse, Error>;
  orgContextSlice: AccountOrganisationContextData | undefined;
  orgQ: UseQueryResult<AccountOrganisationContextQueryResult, Error>;
  passwordDialog: AccountSecurityPasswordDialogState;
  profileDialog: EditDisplayNameDialogProps;
  segmentOk: boolean;
  settingsQ: UseQueryResult<AccountSettingsQueryResult, Error>;
};
