import { useMemo, useState } from "react";

import { usePostAccountBillingStartTrial } from "@/lib/api/hooks/account/usePostAccountBillingStartTrial";

import { canStartTrial } from "../_core/billing-state";
import {
  getBillingTrialScheduleLabelsForStartToday,
  messageFromBillingTrialStartFailure,
  parseBillingTrialStartResponseMessage,
} from "../_utils/trial/billingTrialStart";

export function useBillingTrialStart(
  accountId: string,
  enabled: boolean,
  availableActions?: Partial<Record<string, boolean>>,
) {
  const mutation = usePostAccountBillingStartTrial(accountId);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const trialSchedule = useMemo(() => {
    if (!confirmOpen) {
      return null;
    }
    return getBillingTrialScheduleLabelsForStartToday();
  }, [confirmOpen]);

  const visible = Boolean(enabled && canStartTrial(availableActions));

  function handleConfirmDialogOpenChange(next: boolean) {
    if (mutation.isPending && !next) {
      return;
    }
    setConfirmOpen(next);
  }

  function openConfirmDialog() {
    setErrorMessage(null);
    setFeedback(null);
    setConfirmOpen(true);
  }

  async function confirmStartTrial() {
    setErrorMessage(null);
    setFeedback(null);
    try {
      const body = await mutation.mutateAsync();
      setFeedback(parseBillingTrialStartResponseMessage(body));
      setConfirmOpen(false);
    } catch (e) {
      setErrorMessage(messageFromBillingTrialStartFailure(e));
    }
  }

  return {
    visible,
    mutation,
    feedback,
    errorMessage,
    confirmOpen,
    trialSchedule,
    handleConfirmDialogOpenChange,
    openConfirmDialog,
    confirmStartTrial,
  };
}
