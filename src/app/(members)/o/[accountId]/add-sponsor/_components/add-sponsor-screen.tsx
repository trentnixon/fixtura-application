"use client";

import { Handshake } from "lucide-react";

import { SponsorEditorSheet } from "@/app/(members)/o/[accountId]/manage-sponsors/_components/editor/sponsor-editor-sheet";
import { ManageSponsorsContainerHeaderTitle } from "@/app/(members)/o/[accountId]/manage-sponsors/_components/shared/manage-sponsors-container-header-title";
import { ManageSponsorsErrorState } from "@/app/(members)/o/[accountId]/manage-sponsors/_components/shared/manage-sponsors-error-state";
import { ManageSponsorsLoadingState } from "@/app/(members)/o/[accountId]/manage-sponsors/_components/shared/manage-sponsors-loading-state";
import { ManageSponsorsShell } from "@/app/(members)/o/[accountId]/manage-sponsors/_components/shared/manage-sponsors-shell";

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

      {isLoading ? <ManageSponsorsLoadingState /> : null}
      {isError ? (
        <ManageSponsorsErrorState description={errorMessage} onRetry={() => void refetch()} />
      ) : null}

      {!isLoading && !isError ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,24rem)] lg:items-start">
          <div className="min-w-0">
            <SponsorEditorSheet sponsor={sponsor} onSaveSponsor={saveSponsor} mode="create" />
          </div>

          <aside className="min-w-0 lg:sticky lg:top-6">
            <div className="bg-card text-card-foreground ring-border overflow-hidden rounded-2xl border-none shadow-xl ring-1">
              <div className="border-zinc-900/80 bg-zinc-950 px-6 py-5 text-white">
                <ManageSponsorsContainerHeaderTitle
                  icon={<Handshake className="size-5" aria-hidden />}
                  title="Add to sponsor pool"
                  description="Create a sponsor record so it is ready for placement across your account assets."
                />
              </div>
              <div className="space-y-3 px-6 py-5">
                <p className="text-sm leading-relaxed">
                  You are adding a sponsor to your sponsor pool. After saving, use Manage sponsors
                  to assign them to fixed positions or account entities.
                </p>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  The sponsor logo and name are saved together, then become available for placement
                  across generated assets.
                </p>
              </div>
            </div>
          </aside>
        </div>
      ) : null}
    </ManageSponsorsShell>
  );
}
