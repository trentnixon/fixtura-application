"use client";

import { TypographyMuted } from "@/components/typography";
import { PageHeader } from "@/components/ui/container";
import { SectionBlock, SectionLabel } from "@/components/ui/section";
import { cn } from "@/lib/utils";

import { BrandingTemplateModeCardsInput } from "../branding-template-mode-cards-input";
import { BrandColoursCard } from "./_components/brand-colours-card";
import { PreviewSidebar } from "./_components/preview-sidebar";
import { SaveBrandingCtas } from "./_components/save-branding-ctas";
import { SaveBrandingDialog } from "./_components/save-branding-dialog";
import { useBrandingWorkspace } from "./_hooks";

import type { BrandingWorkspaceProps } from "./_types";

export type { BrandingWorkspaceProps };

export function BrandingWorkspace(props: BrandingWorkspaceProps) {
  const { data } = props;
  const vm = useBrandingWorkspace(props);
  const {
    patchBranding,
    selectedMode,
    templateModesPending,
    themesQuery,
    palette,
    primary,
    setPrimary,
    secondary,
    setSecondary,
    primaryValid,
    setPrimaryValid,
    secondaryValid,
    setSecondaryValid,
    colourSourceMode,
    selectedPremadeThemeId,
    setSelectedPremadeThemeId,
    themeRows,
    np,
    ns,
    duplicate,
    formWarnings,
    template,
    interactive,
    colorsReady,
    confirmedAt,
    saveDialogOpen,
    setSaveDialogOpen,
    handleColourSourceModeChange,
    finalizeSaveToCms,
    headerTitle,
    headerDescription,
    cmsSaveLabStub,
  } = vm;

  const saveCtasProps = {
    interactive,
    colorsReady,
    isPending: patchBranding.isPending,
    confirmedAt,
    cmsSaveLabStub,
    onOpenSaveDialog: () => setSaveDialogOpen(true),
  } as const;

  return (
    <div className="space-y-8">
      <PageHeader
        title={headerTitle}
        {...(headerDescription !== undefined ? { description: headerDescription } : {})}
      />

      <SaveBrandingCtas {...saveCtasProps} variant="mobile" />

      {!template && !data.theme ? (
        <SectionBlock variant="surface">
          <SectionLabel>Overview</SectionLabel>
          <TypographyMuted>
            No template or theme on this account yet — colours below use normalization defaults.
          </TypographyMuted>
        </SectionBlock>
      ) : null}

      <div
        className={cn("grid gap-8", "lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] lg:items-start")}
      >
        <div className="w-full min-w-0 space-y-6">
          <BrandColoursCard
            interactive={interactive}
            palette={palette}
            primary={primary}
            setPrimary={setPrimary}
            secondary={secondary}
            setSecondary={setSecondary}
            setPrimaryValid={setPrimaryValid}
            setSecondaryValid={setSecondaryValid}
            colourSourceMode={colourSourceMode}
            selectedPremadeThemeId={selectedPremadeThemeId}
            setSelectedPremadeThemeId={setSelectedPremadeThemeId}
            themesQuery={themesQuery}
            themeRows={themeRows}
            duplicate={duplicate}
            formWarnings={formWarnings}
            handleColourSourceModeChange={handleColourSourceModeChange}
          />

          <BrandingTemplateModeCardsInput
            accountId={props.accountId}
            interactive={interactive}
            brandPrimaryHex={primary}
            brandSecondaryHex={secondary}
          />

          <SaveBrandingCtas {...saveCtasProps} variant="desktop" />
        </div>

        <PreviewSidebar
          primaryHex={primary}
          secondaryHex={secondary}
          logoSrc={data.onboardingLogo?.url ?? null}
          templateModeSlug={selectedMode?.slug ?? null}
          saveCtasProps={saveCtasProps}
        />
      </div>

      {colourSourceMode === "custom" && (!primaryValid || !secondaryValid) ? (
        <TypographyMuted className="text-xs">
          Resolve invalid hex values to sync previews.
        </TypographyMuted>
      ) : null}

      <SaveBrandingDialog
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        np={np}
        ns={ns}
        templateModesPending={templateModesPending}
        selectedMode={selectedMode}
        cmsSaveLabStub={cmsSaveLabStub}
        colorsReady={colorsReady}
        isPending={patchBranding.isPending}
        onConfirm={finalizeSaveToCms}
      />
    </div>
  );
}
