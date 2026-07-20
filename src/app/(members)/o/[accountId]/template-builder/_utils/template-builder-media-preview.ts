import { clearInactiveBackgroundRelations } from "./template-builder-field-visibility";

import type { TemplateBuilderEditorState } from "./template-builder-editor-state";
import type { AccountMediaLibraryItem } from "@/types/api/account";

export type TemplateBuilderMediaSelectionByAccount = Readonly<Record<string, number | undefined>>;

export type TemplateBuilderMediaPreviewState = {
  status: "loading" | "ready" | "error";
  items: AccountMediaLibraryItem[];
  selectedId: number | null;
  errorMessage: string | null;
  onSelectedIdChange: (mediaId: number) => void;
  onRetry: () => void;
};

export function getTemplateBuilderMediaItems(
  items: readonly AccountMediaLibraryItem[],
): AccountMediaLibraryItem[] {
  return [...items];
}

export function resolveTemplateBuilderPreviewMediaItem(
  items: readonly AccountMediaLibraryItem[],
  selectedIdsByAccount: TemplateBuilderMediaSelectionByAccount,
  accountId: string,
): AccountMediaLibraryItem | null {
  const selectedId = selectedIdsByAccount[accountId];
  if (selectedId !== undefined) {
    const selected = items.find((item) => item.id === selectedId);
    if (selected) return selected;
  }

  return items[0] ?? null;
}

export function clearUnavailableImageBackground(
  state: TemplateBuilderEditorState,
  hasConfirmedEmptyMediaLibrary: boolean,
): TemplateBuilderEditorState {
  if (!hasConfirmedEmptyMediaLibrary || state.useBackground !== "Image") return state;
  return clearInactiveBackgroundRelations({ ...state, useBackground: null }, null);
}
