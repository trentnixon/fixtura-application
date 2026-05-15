"use client";

import { useMemo, useState } from "react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import { SponsorEditorSheet } from "./editor/sponsor-editor-sheet";
import { SponsorLibraryPanel } from "./library/sponsor-library-panel";
import { ManageSponsorsEmptyState } from "./manage-sponsors-empty-state";
import { ManageSponsorsErrorState } from "./manage-sponsors-error-state";
import { ManageSponsorsHeader } from "./manage-sponsors-header";
import { ManageSponsorsLoadingState } from "./manage-sponsors-loading-state";
import { ManageSponsorsShell } from "./manage-sponsors-shell";
import { useManageSponsorsWorkspace } from "../_hooks/use-manage-sponsors-workspace";

export function ManageSponsorsWorkspace({ accountId }: { accountId: string }) {
  const {
    isRedirecting,
    isLoading,
    isError,
    errorMessage,
    sponsors,
    workspaceSponsors,
    stats,
    searchValue,
    setSearchValue,
    activeFilter,
    setActiveFilter,
    saveSponsorEdits,
    refetch,
  } = useManageSponsorsWorkspace(accountId);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editorSponsorId, setEditorSponsorId] = useState<number | string | null>(null);
  const editorSponsor = useMemo(
    () => workspaceSponsors.find((s) => s.id === editorSponsorId) ?? null,
    [editorSponsorId, workspaceSponsors],
  );

  if (isRedirecting) {
    return <ManageSponsorsLoadingState />;
  }

  const hasAnySponsors = workspaceSponsors.length > 0;

  return (
    <ManageSponsorsShell>
      <ManageSponsorsHeader accountId={accountId} />

      {isLoading ? <ManageSponsorsLoadingState /> : null}
      {isError ? (
        <ManageSponsorsErrorState description={errorMessage} onRetry={() => void refetch()} />
      ) : null}
      {!isLoading && !isError && !hasAnySponsors ? (
        <ManageSponsorsEmptyState accountId={accountId} />
      ) : null}

      {!isLoading && !isError && hasAnySponsors ? (
        <div className="grid gap-4">
          <SponsorLibraryPanel
            sponsors={sponsors}
            stats={stats}
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            onEditSponsor={(sponsorId) => {
              setEditorSponsorId(sponsorId);
              setEditorOpen(true);
            }}
          />
        </div>
      ) : null}

      <Sheet
        open={editorOpen}
        onOpenChange={(open) => {
          setEditorOpen(open);
          if (!open) setEditorSponsorId(null);
        }}
      >
        <SheetContent
          side="right"
          className="w-full gap-4 overflow-y-auto px-4 sm:max-w-2xl sm:px-6 lg:max-w-3xl"
        >
          <SheetHeader>
            <SheetTitle>Edit sponsor</SheetTitle>
            <SheetDescription>
              Changes are saved to your account immediately when you confirm.
            </SheetDescription>
          </SheetHeader>
          <SponsorEditorSheet
            mode="edit"
            sponsor={editorSponsor}
            onSaveSponsor={(params) => saveSponsorEdits(params)}
            onSaved={() => {
              setEditorOpen(false);
              setEditorSponsorId(null);
            }}
          />
        </SheetContent>
      </Sheet>
    </ManageSponsorsShell>
  );
}
