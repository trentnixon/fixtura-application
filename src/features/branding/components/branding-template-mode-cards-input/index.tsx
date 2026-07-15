"use client";

import { TypographyMuted } from "@/components/typography";

import { useBrandingTemplateModeCardsInputState } from "./_hooks";
import { ContrastSelectorCard } from "./contrast-selector-card";
import { ModeGridCards } from "./mode-grid-cards";

import type { BrandingTemplateModeCardsInputProps } from "./_types";

export type { BrandingTemplateModeCardsInputProps } from "./_types";

/**
 * Template mode: contrast preset for asset titles vs container backgrounds (GET
 * `/api/template-modes/ui` via `useTemplateModePickerList`).
 */
export function BrandingTemplateModeCardsInput({
  accountId,
  interactive,
  brandPrimaryHex,
  brandSecondaryHex,
}: BrandingTemplateModeCardsInputProps) {
  const state = useBrandingTemplateModeCardsInputState(accountId, interactive);

  switch (state.phase) {
    case "readonly":
      return (
        <ContrastSelectorCard
          headerDescription={
            <TypographyMuted>
              Fixture contrast below — switch route lab to edit to choose a template mode.
            </TypographyMuted>
          }
        >
          {null}
        </ContrastSelectorCard>
      );
    case "loading":
      return (
        <ContrastSelectorCard>
          <p className="text-muted-foreground text-sm" role="status">
            Loading template modes…
          </p>
        </ContrastSelectorCard>
      );
    case "error":
      return (
        <ContrastSelectorCard>
          <TypographyMuted className="text-destructive text-sm">
            {state.error instanceof Error ? state.error.message : "Could not load template modes"}
          </TypographyMuted>
        </ContrastSelectorCard>
      );
    case "empty":
      return (
        <ContrastSelectorCard>
          <TypographyMuted className="text-sm">No template modes available.</TypographyMuted>
        </ContrastSelectorCard>
      );
    case "ready":
      return (
        <ContrastSelectorCard>
          <div className="space-y-5">
            <ModeGridCards
              modes={state.modes}
              selectValue={state.selectValue}
              setSelectedId={state.setSelectedId}
              brandPrimaryHex={brandPrimaryHex}
              brandSecondaryHex={brandSecondaryHex}
            />
            <TypographyMuted className="text-sm leading-relaxed lg:hidden">
              Preview the changes below
            </TypographyMuted>
          </div>
        </ContrastSelectorCard>
      );
  }
}
