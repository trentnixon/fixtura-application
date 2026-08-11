"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { weekdayKeyFromDaysOfWeekRelation } from "@/features/settings/bundle-delivery-weekdays";
import { pickDaysOfWeekRelation } from "@/features/settings/pick-days-of-week-relation";
import { ApiError } from "@/lib/api/client/api-error";
import {
  isAccountSchedulerGatewayRedirect,
  useAccountScheduler,
} from "@/lib/api/hooks/account/useAccountScheduler";
import { usePatchAccountSettings } from "@/lib/api/hooks/account/usePatchAccountSettings";
import { isValidAccountIdSegment } from "@/lib/config/account-routes";

import { buildPartialPatch } from "../_utils/build-partial-patch";
import { extraDetailForSaveError, strapiStructuredErrorCode } from "../_utils/save-error-details";
import { equalDraft, settingsDraftFromPayload } from "../_utils/settings-draft-from-payload";

import type { SettingsDraft } from "../_types/settings-draft";
import type { AccountSchedulerDocument, AccountSettingsData } from "@/types/api/account";

export function useAccountSettingsPreferencesState(params: {
  accountId: string;
  payload: AccountSettingsData;
}) {
  const { accountId, payload } = params;
  const mutation = usePatchAccountSettings(accountId);

  const segmentOk = isValidAccountIdSegment(accountId);
  const schedulerQ = useAccountScheduler(accountId, { enabled: segmentOk });

  const apiSchedulerResolved: AccountSchedulerDocument | null | undefined = (() => {
    if (!segmentOk || schedulerQ.isPending) return undefined;
    if (!schedulerQ.isSuccess) return null;
    if (isAccountSchedulerGatewayRedirect(schedulerQ.data)) return null;
    return schedulerQ.data.data.scheduler;
  })();

  const isClub = payload.account_type === 1;

  /**
   * Association-only fields (`competitionsGroupedBy`) apply when not a club.
   * Handoff: club = `account_type === 1`.
   */
  const showAssocGrouping = !isClub;
  const showClubSplitSeniors = isClub;

  const deliveryDow = pickDaysOfWeekRelation(payload, apiSchedulerResolved);
  const hasParsableDeliveryFromServer = weekdayKeyFromDaysOfWeekRelation(deliveryDow) !== undefined;

  const baselineDraft = useMemo(
    () => settingsDraftFromPayload(payload, apiSchedulerResolved),
    [payload, apiSchedulerResolved],
  );

  const [draft, setDraft] = useState<SettingsDraft>(baselineDraft);
  useEffect(() => {
    setDraft(baselineDraft);
  }, [baselineDraft]);

  const [saveDialogOpen, setSaveDialogOpen] = useState(false);

  const hasChanges = !equalDraft(draft, baselineDraft);
  const partialPatch = buildPartialPatch({
    baseline: baselineDraft,
    next: draft,
    isClub,
  });
  const canSubmit = Boolean(partialPatch);
  const saveDisabled = mutation.isPending || !hasChanges || !canSubmit;

  function handleConfirmSave() {
    if (!partialPatch) return;
    mutation.reset();
    void mutation.mutateAsync(partialPatch).then(
      () => {
        toast.success("Settings saved", {
          description: "Your changes are stored on the server.",
        });
        setSaveDialogOpen(false);
      },
      () => {},
    );
  }

  const saveForbidden = mutation.error instanceof ApiError && mutation.error.status === 403;
  const structuredCode =
    mutation.error instanceof ApiError
      ? strapiStructuredErrorCode(mutation.error.details)
      : undefined;
  const saveExtraDetail = mutation.isError ? extraDetailForSaveError(structuredCode) : undefined;

  function openSaveDialog() {
    mutation.reset();
    setSaveDialogOpen(true);
  }

  return {
    mutation,
    isClub,
    showAssocGrouping,
    showClubSplitSeniors,
    hasParsableDeliveryFromServer,
    baselineDraft,
    draft,
    setDraft,
    saveDialogOpen,
    setSaveDialogOpen,
    hasChanges,
    partialPatch,
    canSubmit,
    saveDisabled,
    handleConfirmSave,
    saveForbidden,
    saveExtraDetail,
    openSaveDialog,
  };
}
