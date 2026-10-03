"use client";

import { useState } from "react";
import { toast } from "sonner";

import { captureUserAction } from "@/lib/analytics";
import { useOnboardingOnboardingState } from "@/lib/api/hooks/account/useOnboardingOnboardingState";
import { usePatchAccountActive } from "@/lib/api/hooks/account/usePatchAccountActive";
import { useAccountReadOnly } from "@/lib/support/use-account-read-only";

import {
  ACCOUNT_ACTIVE_TURNED_OFF_TOAST,
  ACCOUNT_ACTIVE_TURNED_ON_TOAST,
} from "../_constants/account-active";
import { accountActiveErrorMessage, canSetAccountActive } from "../_utils/account-active";

export function useAccountActiveSection(accountId: string) {
  const onboardingQ = useOnboardingOnboardingState(accountId);
  const patchActive = usePatchAccountActive(accountId);
  const isSupportReadOnly = useAccountReadOnly();
  const [confirmNext, setConfirmNext] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canEdit = onboardingQ.isSuccess && canSetAccountActive(onboardingQ.data);
  const visible = canEdit;

  function requestChange(next: boolean) {
    if (!canEdit || isSupportReadOnly || patchActive.isPending) return;
    setError(null);
    setConfirmNext(next);
  }

  function dismiss() {
    if (patchActive.isPending) return;
    setConfirmNext(null);
    setError(null);
  }

  async function confirm() {
    if (confirmNext === null || !canEdit || isSupportReadOnly) return;

    setError(null);
    try {
      await patchActive.mutateAsync({ isActive: confirmNext });
      captureUserAction("account_active_updated", { accountId, isActive: confirmNext });
      toast.success(confirmNext ? ACCOUNT_ACTIVE_TURNED_ON_TOAST : ACCOUNT_ACTIVE_TURNED_OFF_TOAST);
      setConfirmNext(null);
    } catch (caught) {
      setError(accountActiveErrorMessage(caught));
    }
  }

  return {
    visible,
    isSupportReadOnly,
    confirmNext,
    isSubmitting: patchActive.isPending,
    error,
    requestChange,
    dismiss,
    confirm: () => void confirm(),
  };
}
