"use client";

import { SponsorEditorSheet } from "@/app/(members)/o/[accountId]/manage-sponsors/_components/editor/sponsor-editor-sheet";
import { ManageSponsorsErrorState } from "@/app/(members)/o/[accountId]/manage-sponsors/_components/manage-sponsors-error-state";
import { ManageSponsorsLoadingState } from "@/app/(members)/o/[accountId]/manage-sponsors/_components/manage-sponsors-loading-state";
import { ManageSponsorsShell } from "@/app/(members)/o/[accountId]/manage-sponsors/_components/manage-sponsors-shell";
import { TypographySectionDescription, TypographySectionTitle } from "@/components/typography";

import { AddSponsorHeader } from "./add-sponsor-header";
import { useAddSponsorScreen } from "../_hooks/use-add-sponsor-screen";

export function AddSponsorScreen({ accountId }: { accountId: string }) {
  const { isRedirecting, isLoading, isError, errorMessage, sponsor, saveSponsor, refetch } =
    useAddSponsorScreen(accountId);

  if (isRedirecting) {
    return <ManageSponsorsLoadingState />;
  }

  return (
    <ManageSponsorsShell>
      <AddSponsorHeader accountId={accountId} />

      <div className="mb-8 max-w-3xl space-y-2">
        <TypographySectionTitle>Add to Sponsor pool</TypographySectionTitle>
        <TypographySectionDescription>
          You are adding a sponsor to your Sponsor pool so they are ready to use on your account.
          From there, use the sponsor assign features in manage sponsors to place them on your
          assets.
        </TypographySectionDescription>
      </div>

      {isLoading ? <ManageSponsorsLoadingState /> : null}
      {isError ? (
        <ManageSponsorsErrorState description={errorMessage} onRetry={() => void refetch()} />
      ) : null}

      {!isLoading && !isError ? (
        <SponsorEditorSheet sponsor={sponsor} onSaveSponsor={saveSponsor} mode="create" />
      ) : null}
    </ManageSponsorsShell>
  );
}
