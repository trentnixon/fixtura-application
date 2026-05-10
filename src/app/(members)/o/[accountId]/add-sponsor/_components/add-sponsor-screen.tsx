"use client";

import { SponsorEditorSheet } from "@/app/(members)/o/[accountId]/manage-sponsors/_components/editor/sponsor-editor-sheet";
import { ManageSponsorsErrorState } from "@/app/(members)/o/[accountId]/manage-sponsors/_components/manage-sponsors-error-state";
import { ManageSponsorsLoadingState } from "@/app/(members)/o/[accountId]/manage-sponsors/_components/manage-sponsors-loading-state";
import { ManageSponsorsShell } from "@/app/(members)/o/[accountId]/manage-sponsors/_components/manage-sponsors-shell";
import { SponsorPreviewPanel } from "@/app/(members)/o/[accountId]/manage-sponsors/_components/sponsor-preview-panel";

import { AddSponsorHeader } from "./add-sponsor-header";
import { useAddSponsorScreen } from "../_hooks/use-add-sponsor-screen";

export function AddSponsorScreen({ accountId }: { accountId: string }) {
  const {
    isRedirecting,
    isLoading,
    isError,
    errorMessage,
    sponsor,
    isCreated,
    saveSponsor,
    refetch,
  } = useAddSponsorScreen(accountId);

  if (isRedirecting) {
    return <ManageSponsorsLoadingState />;
  }

  return (
    <ManageSponsorsShell>
      <AddSponsorHeader accountId={accountId} />

      {isLoading ? <ManageSponsorsLoadingState /> : null}
      {isError ? (
        <ManageSponsorsErrorState description={errorMessage} onRetry={() => void refetch()} />
      ) : null}

      {!isLoading && !isError ? (
        isCreated ? (
          <SponsorPreviewPanel sponsor={sponsor} />
        ) : (
          <SponsorEditorSheet sponsor={sponsor} onSaveSponsor={saveSponsor} mode="create" />
        )
      ) : null}
    </ManageSponsorsShell>
  );
}
