"use client";

import { ManageSponsorsEditorSheet } from "./_components/manage-sponsors-editor-sheet";
import { ManageSponsorsWorkspaceContent } from "./_components/manage-sponsors-workspace-content";
import { useManageSponsorsEditorSelection } from "./_hooks/use-manage-sponsors-editor-selection";
import { ManageSponsorsHeader } from "./manage-sponsors-header";
import { useManageSponsorsWorkspace } from "../../_hooks/use-manage-sponsors-workspace";
import { ManageSponsorsLoadingState } from "../shared/manage-sponsors-loading-state";
import { ManageSponsorsShell } from "../shared/manage-sponsors-shell";

import type { ManageSponsorsWorkspaceProps } from "./_types/manage-sponsors-workspace";

export function ManageSponsorsWorkspace({ accountId }: ManageSponsorsWorkspaceProps) {
  const workspace = useManageSponsorsWorkspace(accountId);
  const editor = useManageSponsorsEditorSelection({
    sponsors: workspace.workspaceSponsors,
  });

  if (workspace.isRedirecting) {
    return <ManageSponsorsLoadingState />;
  }

  return (
    <ManageSponsorsShell>
      <ManageSponsorsHeader accountId={accountId} />

      <ManageSponsorsWorkspaceContent
        accountId={accountId}
        workspace={workspace}
        onEditSponsor={editor.openEditor}
      />

      <ManageSponsorsEditorSheet
        open={editor.editorOpen}
        sponsor={editor.editorSponsor}
        onOpenChange={editor.handleEditorOpenChange}
        onSaveSponsor={workspace.saveSponsorEdits}
        onSaved={editor.closeEditor}
      />
    </ManageSponsorsShell>
  );
}
