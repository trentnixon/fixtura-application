import type { useTemplateModePickerList } from "@/components/pickers/template-mode";
import type { useOnboardingLookupThemes } from "@/lib/api/hooks/account/useOnboardingLookupThemes";
import type { usePatchAccountBranding } from "@/lib/api/hooks/account/usePatchAccountBranding";
import type { AccountBrandingData, OnboardingThemeOption } from "@/types/api/account";
import type React from "react";

type PatchBranding = ReturnType<typeof usePatchAccountBranding>;
type ThemesQuery = ReturnType<typeof useOnboardingLookupThemes>;
type PickList = ReturnType<typeof useTemplateModePickerList>;

export type BrandingWorkspaceProps = {
  /** Strapi account id — PATCH target; route lab passes a fixture id while save is stubbed. */
  accountId: string;
  data: AccountBrandingData;
  mode: "view" | "edit";
  /**
   * When true (route lab), CMS/API persistence does not run.
   * Omit or false when wiring production saves against real endpoints.
   */
  cmsSaveLabStub?: boolean;
  /**
   * When true (default), the header description includes the org-level intro plus Template/Theme.
   * Set false when an outer shell (e.g. route lab) already provides page context.
   */
  includeBrandingPageIntro?: boolean;
  pageTitle?: string;
  pageDescription?: string;
};

export type ColourSourceMode = "custom" | "premade";

/** Everything the workspace UI reads from `useBrandingWorkspace`. */
export type UseBrandingWorkspaceResult = {
  patchBranding: PatchBranding;
  selectedMode: PickList["selectedMode"];
  selectValue: PickList["selectValue"];
  modes: PickList["modes"];
  templateModesPending: PickList["isPending"];

  themesQuery: ThemesQuery;

  palette: { primary: string; secondary: string };
  themeRows: OnboardingThemeOption[];

  primary: string;
  setPrimary: React.Dispatch<React.SetStateAction<string>>;
  secondary: string;
  setSecondary: React.Dispatch<React.SetStateAction<string>>;
  primaryValid: boolean;
  setPrimaryValid: React.Dispatch<React.SetStateAction<boolean>>;
  secondaryValid: boolean;
  setSecondaryValid: React.Dispatch<React.SetStateAction<boolean>>;

  colourSourceMode: ColourSourceMode;
  selectedPremadeThemeId: string;
  setSelectedPremadeThemeId: React.Dispatch<React.SetStateAction<string>>;

  np: string | null;
  ns: string | null;
  duplicate: boolean;
  formWarnings: string[];

  template: AccountBrandingData["template"];

  interactive: boolean;
  colorsReady: boolean;

  confirmedAt: string | null;
  saveDialogOpen: boolean;
  setSaveDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;

  handleColourSourceModeChange: (next: ColourSourceMode) => void;

  finalizeSaveToCms: () => Promise<void>;

  headerTitle: string;
  headerDescription: string | undefined;

  cmsSaveLabStub: boolean;
};
