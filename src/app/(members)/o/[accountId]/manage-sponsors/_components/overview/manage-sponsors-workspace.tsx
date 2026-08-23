"use client";

import { useAccountReadOnly } from "@/lib/support/use-account-read-only";

import { ManageSponsorsEditorSheet } from "./_components/manage-sponsors-editor-sheet";
import { ManageSponsorsWorkspaceContent } from "./_components/manage-sponsors-workspace-content";
import { useManageSponsorsEditorSelection } from "./_hooks/use-manage-sponsors-editor-selection";
import { ManageSponsorsHeader } from "./manage-sponsors-header";
import { useManageSponsorsWorkspace } from "../../_hooks/use-manage-sponsors-workspace";
import { ManageSponsorsLoadingState } from "../shared/manage-sponsors-loading-state";
import { ManageSponsorsShell } from "../shared/manage-sponsors-shell";

import type { ManageSponsorsWorkspaceProps } from "./_types/manage-sponsors-workspace";

export function ManageSponsorsWorkspace({ accountId }: ManageSponsorsWorkspaceProps) {
  const readOnly = useAccountReadOnly();
  const workspace = useManageSponsorsWorkspace(accountId);
  const editor = useManageSponsorsEditorSelection({
    sponsors: workspace.workspaceSponsors,
  });

  if (workspace.isRedirecting) {
    return <ManageSponsorsLoadingState />;
  }

  return (
    <ManageSponsorsShell>
      <ManageSponsorsHeader accountId={accountId} readOnly={readOnly} />

      <ManageSponsorsWorkspaceContent
        accountId={accountId}
        workspace={workspace}
        readOnly={readOnly}
        onEditSponsor={readOnly ? () => {} : editor.openEditor}
      />

      {!readOnly ? (
        <ManageSponsorsEditorSheet
          accountId={accountId}
          open={editor.editorOpen}
          sponsor={editor.editorSponsor}
          onOpenChange={editor.handleEditorOpenChange}
          onSaveSponsor={workspace.saveSponsorEdits}
          onSaved={editor.closeEditor}
        />
      ) : null}
    </ManageSponsorsShell>
  );
}
