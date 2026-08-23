"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { captureUserAction } from "@/lib/analytics";
import { ApiError } from "@/lib/api/client/api-error";
import { useAccountGradeOrdering } from "@/lib/api/hooks/account/useAccountGradeOrdering";
import { usePutAccountGradeOrdering } from "@/lib/api/hooks/account/usePutAccountGradeOrdering";
import { useUnsavedChangesGuard } from "@/lib/navigation/use-unsaved-changes-guard";

import {
  buildClearAllPayload,
  buildPutPayload,
  draftFromResponse,
  equalDraft,
  gradeLookupFromResponse,
  reorderGroupItems,
  type GradeOrderingDraft,
  type GradeOrderingGradeLookup,
} from "../_utils/grade-ordering-draft";

import type { GradeOrderingGetParams, GradeOrderingResponseData } from "@/types/api/grade-ordering";

export function useGradeOrderingEditor({
  accountId,
  orgParams,
  canonicalData,
}: {
  accountId: string;
  orgParams: GradeOrderingGetParams;
  canonicalData: GradeOrderingResponseData;
}) {
  const baselineDraft = useMemo(() => draftFromResponse(canonicalData), [canonicalData]);
  const [draft, setDraft] = useState(baselineDraft);
  const [conflictOpen, setConflictOpen] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);

  const gradeLookup = useMemo(() => gradeLookupFromResponse(canonicalData), [canonicalData]);

  useEffect(() => {
    setDraft(baselineDraft);
  }, [baselineDraft]);

  const hasChanges = useMemo(() => !equalDraft(draft, baselineDraft), [draft, baselineDraft]);
  useUnsavedChangesGuard(hasChanges);

  const mutation = usePutAccountGradeOrdering(accountId, orgParams);
  const refetchQuery = useAccountGradeOrdering(accountId, orgParams, { enabled: false });

  const handleReorder = useCallback(
    (groupKey: GradeOrderingDraft["groups"][number]["groupKey"], itemIds: number[]) => {
      setDraft((current) => reorderGroupItems(current, groupKey, itemIds));
    },
    [],
  );

  const handleReset = useCallback(() => {
    setDraft(baselineDraft);
  }, [baselineDraft]);

  const handleSave = useCallback(async () => {
    try {
      await mutation.mutateAsync(buildPutPayload(draft));
      captureUserAction("grade_order_saved", { accountId });
      toast.success("Grade order saved");
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        setConflictOpen(true);
        return;
      }
      if (error instanceof ApiError && error.status === 403) {
        toast.error("Saving is disabled. Contact support if this persists.");
        return;
      }
      const message = error instanceof Error ? error.message : "Could not save grade order";
      toast.error(message);
    }
  }, [accountId, draft, mutation]);

  const handleLoadLatestAfterConflict = useCallback(async () => {
    setConflictOpen(false);
    const result = await refetchQuery.refetch();
    if (result.data && "data" in result.data) {
      setDraft(draftFromResponse(result.data.data));
      toast.message("Loaded the latest grade order");
    }
  }, [refetchQuery]);

  const handleReviewAfterConflict = useCallback(() => {
    setConflictOpen(false);
    toast.message("Review your changes, then save again when ready.");
  }, []);

  const handleClearCustomOrder = useCallback(async () => {
    setClearDialogOpen(false);
    try {
      await mutation.mutateAsync(buildClearAllPayload(draft));
      captureUserAction("grade_order_cleared", { accountId });
      toast.success("Custom grade order cleared");
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        setConflictOpen(true);
        return;
      }
      const message = error instanceof Error ? error.message : "Could not clear grade order";
      toast.error(message);
    }
  }, [accountId, draft, mutation]);

  const saveDisabled = !hasChanges || mutation.isPending || draft.groups.length === 0;

  return {
    draft,
    gradeLookup,
    hasChanges,
    mutation,
    saveDisabled,
    conflictOpen,
    setConflictOpen,
    clearDialogOpen,
    setClearDialogOpen,
    handleReorder,
    handleReset,
    handleSave,
    handleLoadLatestAfterConflict,
    handleReviewAfterConflict,
    handleClearCustomOrder,
  };
}

export type { GradeOrderingGradeLookup };
