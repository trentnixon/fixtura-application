import { useMemo, useState } from "react";

import {
  isAccountOrganisationContextGatewayRedirect,
  useAccountOrganisationContext,
} from "@/lib/api/hooks/account/useAccountOrganisationContext";
import { usePostAccountBillingStartTrial } from "@/lib/api/hooks/account/usePostAccountBillingStartTrial";

import { canStartTrial } from "../_core/billing-state";
import {
  messageFromBillingTrialStartFailure,
  parseBillingTrialStartResponseMessage,
  resolveBillingTrialAccountName,
} from "../_utils/trial/billingTrialStart";

import type { OrganisationTrialPresentation } from "../_types/trial/organisationTrialPresentation";

export function useBillingTrialStart(
  accountId: string,
  enabled: boolean,
  availableActions?: Partial<Record<string, boolean>>,
  organisationTrialPresentation?: OrganisationTrialPresentation,
) {
  const mutation = usePostAccountBillingStartTrial(accountId);
  const orgQ = useAccountOrganisationContext(accountId, { enabled: enabled && Boolean(accountId) });
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const accountName = useMemo(() => {
    if (!orgQ.isSuccess || !orgQ.data || isAccountOrganisationContextGatewayRedirect(orgQ.data)) {
      return "";
    }
    return resolveBillingTrialAccountName(orgQ.data.data);
  }, [orgQ.isSuccess, orgQ.data]);

  const visible = Boolean(
    enabled &&
    canStartTrial(availableActions) &&
    organisationTrialPresentation === "start_available",
  );

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
    accountName,
    handleConfirmDialogOpenChange,
    openConfirmDialog,
    confirmStartTrial,
  };
}
