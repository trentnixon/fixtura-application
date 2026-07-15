"use client";

import { useTemplateModePickerList } from "@/components/pickers/template-mode";

import type { BrandingTemplateModeCardsInputState } from "../_types";

export function useBrandingTemplateModeCardsInputState(
  accountId: string,
  interactive: boolean,
): BrandingTemplateModeCardsInputState {
  const { modes, selectValue, setSelectedId, isPending, isError, error } =
    useTemplateModePickerList(accountId);

  if (!interactive) {
    return { phase: "readonly" };
  }
  if (isPending) {
    return { phase: "loading" };
  }
  if (isError) {
    return { phase: "error", error };
  }
  if (modes.length === 0) {
    return { phase: "empty" };
  }
  return {
    phase: "ready",
    modes,
    selectValue,
    setSelectedId,
  };
}
