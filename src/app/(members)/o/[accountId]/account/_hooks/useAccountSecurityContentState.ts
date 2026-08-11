import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { useAccountMe } from "@/lib/api/hooks/account/useAccountMe";
import {
  isAccountOrganisationContextGatewayRedirect,
  useAccountOrganisationContext,
} from "@/lib/api/hooks/account/useAccountOrganisationContext";
import {
  isAccountSettingsGatewayRedirect,
  useAccountSettings,
} from "@/lib/api/hooks/account/useAccountSettings";
import { usePatchAccountSecurityLoginEmail } from "@/lib/api/hooks/account/usePatchAccountSecurityLoginEmail";
import { usePatchAccountSecurityProfile } from "@/lib/api/hooks/account/usePatchAccountSecurityProfile";
import { queryKeys } from "@/lib/api/query/query-keys";
import { isValidAccountIdSegment } from "@/lib/config/account-routes";
import {
  SELECT_ORG_GATEWAY_REASON,
  selectOrganisationUrlWithReason,
} from "@/lib/config/gateway-reasons";

import {
  ACCOUNT_SECURITY_EMAIL_UPDATED_TOAST,
  ACCOUNT_SECURITY_PROFILE_UPDATED_TOAST,
} from "../_constants/use-account-security-content-state";
import {
  createAccountSecurityProfileDraft,
  getAccountSecurityMutationErrorMessage,
  validateAccountSecurityLoginEmailValue,
  validateAccountSecurityProfileValue,
} from "../_utils/use-account-security-content-state";

import type {
  UseAccountSecurityContentStateArgs,
  UseAccountSecurityContentStateResult,
} from "../_types/use-account-security-content-state";

export function useAccountSecurityContentState({
  accountId,
}: UseAccountSecurityContentStateArgs): UseAccountSecurityContentStateResult {
  const router = useRouter();
  const queryClient = useQueryClient();
  const redirectingRef = useRef(false);
  const segmentOk = isValidAccountIdSegment(accountId);
  const settingsQ = useAccountSettings(accountId, { enabled: segmentOk });
  const meQ = useAccountMe({ enabled: segmentOk });
  const orgQ = useAccountOrganisationContext(accountId, { enabled: segmentOk });

  const patchProfile = usePatchAccountSecurityProfile(accountId);
  const patchEmail = usePatchAccountSecurityLoginEmail(accountId);

  const [profileOpen, setProfileOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [passwordFormKey, setPasswordFormKey] = useState(0);
  const [profileValue, setProfileValue] = useState("");
  const [emailValue, setEmailValue] = useState("");
  const [profileError, setProfileError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  useEffect(() => {
    redirectingRef.current = false;
  }, [accountId]);

  useEffect(() => {
    if (segmentOk || redirectingRef.current) return;

    redirectingRef.current = true;
    router.replace(selectOrganisationUrlWithReason(SELECT_ORG_GATEWAY_REASON.invalidOrg));
  }, [segmentOk, router]);

  useEffect(() => {
    if (!segmentOk) return;
    if (!settingsQ.isSuccess || !settingsQ.data || redirectingRef.current) return;
    if (!isAccountSettingsGatewayRedirect(settingsQ.data)) return;

    redirectingRef.current = true;
    void queryClient.removeQueries({ queryKey: queryKeys.account.settings(accountId) });
    router.replace(selectOrganisationUrlWithReason(settingsQ.data.reason));
  }, [settingsQ.isSuccess, settingsQ.data, accountId, queryClient, router, segmentOk]);

  useEffect(() => {
    if (!segmentOk) return;
    if (!orgQ.isSuccess || !orgQ.data || redirectingRef.current) return;
    if (!isAccountOrganisationContextGatewayRedirect(orgQ.data)) return;

    redirectingRef.current = true;
    void queryClient.removeQueries({ queryKey: queryKeys.account.organisationContext(accountId) });
    router.replace(selectOrganisationUrlWithReason(orgQ.data.reason));
  }, [orgQ.isSuccess, orgQ.data, accountId, queryClient, router, segmentOk]);

  useEffect(() => {
    if (!profileOpen || !settingsQ.isSuccess || isAccountSettingsGatewayRedirect(settingsQ.data)) {
      return;
    }

    setProfileValue(createAccountSecurityProfileDraft(settingsQ.data.data));
    setProfileError(null);
  }, [profileOpen, settingsQ.isSuccess, settingsQ.data]);

  useEffect(() => {
    const email = meQ.data?.data.user?.email;
    if (!emailOpen || !email) return;

    setEmailValue(email);
    setEmailError(null);
  }, [emailOpen, meQ.data?.data.user?.email]);

  const orgContextSlice = useMemo(() => {
    if (!orgQ.isSuccess || !orgQ.data || isAccountOrganisationContextGatewayRedirect(orgQ.data)) {
      return undefined;
    }

    return orgQ.data.data;
  }, [orgQ.isSuccess, orgQ.data]);

  async function submitProfile() {
    const { error, value } = validateAccountSecurityProfileValue(profileValue);
    if (error || !value) {
      setProfileError(error);
      return;
    }

    setProfileError(null);

    try {
      await patchProfile.mutateAsync({ userName: value });
      toast.success(ACCOUNT_SECURITY_PROFILE_UPDATED_TOAST);
      setProfileOpen(false);
    } catch (error) {
      setProfileError(getAccountSecurityMutationErrorMessage(error));
    }
  }

  async function submitEmail() {
    const { error, value } = validateAccountSecurityLoginEmailValue(emailValue);
    if (error || !value) {
      setEmailError(error);
      return;
    }

    setEmailError(null);

    try {
      await patchEmail.mutateAsync({ loginEmail: value });
      toast.success(ACCOUNT_SECURITY_EMAIL_UPDATED_TOAST);
      setEmailOpen(false);
    } catch (error) {
      setEmailError(getAccountSecurityMutationErrorMessage(error));
    }
  }

  function openPasswordDialog() {
    setPasswordFormKey((current) => current + 1);
    setPasswordDialogOpen(true);
  }

  return {
    emailDialog: {
      error: emailError,
      isOpen: emailOpen,
      isSubmitting: patchEmail.isPending,
      value: emailValue,
      onChange: setEmailValue,
      onClose: () => setEmailOpen(false),
      onOpenChange: setEmailOpen,
      onSubmit: () => void submitEmail(),
    },
    meQ,
    orgContextSlice,
    orgQ,
    passwordDialog: {
      accountId,
      formKey: passwordFormKey,
      isOpen: passwordDialogOpen,
      onEdit: openPasswordDialog,
      onOpenChange: setPasswordDialogOpen,
    },
    profileDialog: {
      error: profileError,
      isOpen: profileOpen,
      isSubmitting: patchProfile.isPending,
      value: profileValue,
      onChange: setProfileValue,
      onClose: () => setProfileOpen(false),
      onOpenChange: setProfileOpen,
      onSubmit: () => void submitProfile(),
    },
    segmentOk,
    settingsQ,
  };
}
