"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { useTemplateModePickerList } from "@/components/pickers/template-mode";
import { templateModeLabel } from "@/components/pickers/template-mode/_utils";
import { LAB_BRANDING_ORG_LABEL } from "@/features/route-lab/fixtures/branding";
import { ApiError } from "@/lib/api/client/api-error";
import { useOnboardingLookupThemes } from "@/lib/api/hooks/account/useOnboardingLookupThemes";
import { usePatchAccountBranding } from "@/lib/api/hooks/account/usePatchAccountBranding";
import { tryNormalizeHex } from "@/lib/brand-color";
import { themeColoursFromAccountBrandingTheme } from "@/lib/branding/theme-colours-from-account";

import { BRANDING_PAGE_INTRO } from "../_consts";
import { cmsThemeRowColours, computeFormWarnings, readTemplateModeId } from "../_utils";

import type {
  BrandingWorkspaceProps,
  ColourSourceMode,
  UseBrandingWorkspaceResult,
} from "../_types";
import type { PatchAccountBrandingBody } from "@/types/api/account";

export function useBrandingWorkspace({
  accountId,
  data,
  mode,
  cmsSaveLabStub = false,
  includeBrandingPageIntro = true,
  pageTitle,
  pageDescription,
}: BrandingWorkspaceProps): UseBrandingWorkspaceResult {
  const patchBranding = usePatchAccountBranding(accountId);
  const {
    selectedMode,
    selectValue,
    setSelectedId,
    modes,
    isPending: templateModesPending,
  } = useTemplateModePickerList(accountId);

  const savedModeId = useMemo(
    () => readTemplateModeId(data.template_option),
    [data.template_option],
  );

  const themesQuery = useOnboardingLookupThemes();

  const palette = themeColoursFromAccountBrandingTheme(data.theme);
  const [primary, setPrimary] = useState(palette.primary);
  const [secondary, setSecondary] = useState(palette.secondary);

  useEffect(() => {
    const next = themeColoursFromAccountBrandingTheme(data.theme);
    setPrimary(next.primary);
    setSecondary(next.secondary);
  }, [data.theme]);
  const [primaryValid, setPrimaryValid] = useState(true);
  const [secondaryValid, setSecondaryValid] = useState(true);
  const [colourSourceMode, setColourSourceMode] = useState<ColourSourceMode>("custom");
  const [selectedPremadeThemeId, setSelectedPremadeThemeId] = useState("");

  const themeRows = useMemo(() => {
    if (!themesQuery.isSuccess || !themesQuery.data?.data?.length) return [];
    return themesQuery.data.data;
  }, [themesQuery.isSuccess, themesQuery.data]);

  const np = tryNormalizeHex(primary);
  const ns = tryNormalizeHex(secondary);
  const duplicate = np !== null && ns !== null && np === ns;

  const formWarnings = useMemo(() => computeFormWarnings(np, ns, duplicate), [np, ns, duplicate]);

  const hydratedFromAccountRef = useRef(false);
  useEffect(() => {
    hydratedFromAccountRef.current = false;
  }, [accountId]);

  useEffect(() => {
    if (hydratedFromAccountRef.current || modes.length === 0) return;

    if (savedModeId !== null && modes.some((m) => m.id === savedModeId)) {
      setSelectedId(String(savedModeId));
    } else {
      setSelectedId(null);
    }
    hydratedFromAccountRef.current = true;
  }, [accountId, modes, savedModeId, setSelectedId]);

  const template = data.template;
  const interactive = mode === "edit";

  const colorsReady =
    colourSourceMode === "premade"
      ? selectedPremadeThemeId !== "" &&
        themeRows.some(
          (r) => String(r.id) === selectedPremadeThemeId && cmsThemeRowColours(r) !== null,
        ) &&
        np !== null &&
        ns !== null &&
        !duplicate
      : primaryValid && secondaryValid && np !== null && ns !== null && !duplicate;

  const [confirmedAt, setConfirmedAt] = useState<string | null>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);

  useEffect(() => {
    setConfirmedAt(null);
  }, [primary, secondary, selectValue]);

  const handleColourSourceModeChange = (next: ColourSourceMode) => {
    setColourSourceMode(next);
    setSelectedPremadeThemeId("");
  };

  const headerTitle =
    pageTitle ?? (cmsSaveLabStub ? `Branding — ${LAB_BRANDING_ORG_LABEL}` : "Branding");
  const headerDescription =
    pageDescription ??
    (cmsSaveLabStub
      ? "Fixture-backed lab (no API)."
      : includeBrandingPageIntro
        ? BRANDING_PAGE_INTRO
        : undefined);

  const finalizeSaveToCms = async () => {
    if (!interactive || !colorsReady || np === null || ns === null) return;

    if (cmsSaveLabStub) {
      setSaveDialogOpen(false);
      const time = new Date().toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      setConfirmedAt(time);
      toast.success("Branding saved", {
        description: `Colours and template mode validated — CMS/API save runs only outside route lab.${selectedMode ? ` (${templateModeLabel(selectedMode)})` : ""}`,
      });
      return;
    }

    const body: PatchAccountBrandingBody = {
      palette: { primary: np, secondary: ns },
    };
    if (colourSourceMode === "premade" && selectedPremadeThemeId !== "") {
      body.themeId = Number(selectedPremadeThemeId);
    }
    if (selectedMode != null) {
      body.templateModeId = selectedMode.id;
    }

    try {
      await patchBranding.mutateAsync(body);
      setSaveDialogOpen(false);
      const time = new Date().toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      setConfirmedAt(time);
      toast.success("Branding saved", {
        description: `Primary, secondary, and template mode were saved to your organisation profile.${selectedMode ? ` (${templateModeLabel(selectedMode)})` : ""}`,
      });
    } catch (e) {
      const msg =
        e instanceof ApiError
          ? e.message
          : e instanceof Error
            ? e.message
            : "Could not save branding";
      toast.error("Could not save branding", {
        description: msg,
      });
    }
  };

  return {
    patchBranding,
    selectedMode,
    selectValue,
    modes,
    templateModesPending,
    themesQuery,
    palette,
    themeRows,
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
  };
}
