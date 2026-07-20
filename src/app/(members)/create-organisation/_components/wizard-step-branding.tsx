"use client";

import Link from "next/link";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";

import { InlineAlert } from "@/components/auth/actions";
import { FixturaAssetColorPreview } from "@/components/brand-color";
import {
  ImageUploaderCrop,
  type ImageUploaderCropCompletePayload,
} from "@/components/media/image-uploader-crop";
import { TypographyBodySmall, TypographyFinePrint } from "@/components/typography";
import {
  LOGO_MIN_OUTPUT_HEIGHT_PX,
  LOGO_MIN_OUTPUT_WIDTH_PX,
  LOGO_MIN_SOURCE_HEIGHT_PX,
  LOGO_MIN_SOURCE_WIDTH_PX,
} from "@/features/branding/components/brand-logo-workspace/logo-save-validation";
import { BrandColoursCard } from "@/features/branding/components/branding-workspace/_components/brand-colours-card";
import { activeAccountSummaryFromMePayload } from "@/lib/account/account-me-rows";
import { ApiError } from "@/lib/api/client/api-error";
import {
  useAccountBranding,
  isAccountBrandingGatewayRedirect,
} from "@/lib/api/hooks/account/useAccountBranding";
import { useAccountMe } from "@/lib/api/hooks/account/useAccountMe";
import { useCreateOnboardingStep2Theme } from "@/lib/api/hooks/account/useCreateOnboardingStep2Theme";
import { useOnboardingLookupThemes } from "@/lib/api/hooks/account/useOnboardingLookupThemes";
import { usePatchAccountBranding } from "@/lib/api/hooks/account/usePatchAccountBranding";
import { useUpdateOnboardingStep2 } from "@/lib/api/hooks/account/useUpdateOnboardingStep2";
import {
  bothColorsVeryDark,
  bothColorsVeryLight,
  colorsAreTooSimilar,
  tryNormalizeHex,
} from "@/lib/brand-color";
import {
  THEME_JSON_DEFAULT_DARK,
  THEME_JSON_DEFAULT_WHITE,
  themeColoursFromAccountBrandingTheme,
} from "@/lib/branding/theme-colours-from-account";
import { ROUTES } from "@/lib/config/routes";
import { SELECTABLE_LOGO_CROP_PRESETS } from "@/lib/media/selectable-logo-crop-presets";
import { buildOnboardingCustomThemeName } from "@/lib/onboarding/build-custom-theme-name";
import { cn } from "@/lib/utils";

import type { ColourSourceMode } from "@/features/branding/components/branding-workspace/_types";
import type {
  CreateOnboardingStep2ThemeResponse,
  OnboardingThemeOption,
  UpdateOnboardingStep2Body,
} from "@/types/api/account";

export type WizardStepBrandingHandle = {
  submit: () => Promise<void>;
};

type WizardStepBrandingProps = {
  accountId: string;
  onContinue: () => void;
  onPendingChange?: (pending: boolean) => void;
};

type BrandingMode = "default" | "custom";

/** Default premade themes when the theme list is unavailable. */
const FALLBACK_PREMADE_THEMES: OnboardingThemeOption[] = [
  {
    id: 101,
    label: "Classic",
    sport: null,
    theme: {
      primary: "#79001F",
      secondary: "#FDBC2C",
      dark: THEME_JSON_DEFAULT_DARK,
      white: THEME_JSON_DEFAULT_WHITE,
    },
  },
  {
    id: 102,
    label: "Bold",
    sport: null,
    theme: {
      primary: "#0F172A",
      secondary: "#38BDF8",
      dark: THEME_JSON_DEFAULT_DARK,
      white: THEME_JSON_DEFAULT_WHITE,
    },
  },
  {
    id: 103,
    label: "Minimal",
    sport: null,
    theme: {
      primary: "#1E293B",
      secondary: "#94A3B8",
      dark: THEME_JSON_DEFAULT_DARK,
      white: THEME_JSON_DEFAULT_WHITE,
    },
  },
];

const SWATCH_FALLBACK_BY_ID: Record<number, { primary: string; secondary: string }> = {
  101: { primary: "#79001F", secondary: "#FDBC2C" },
  102: { primary: "#0F172A", secondary: "#38BDF8" },
  103: { primary: "#1E293B", secondary: "#94A3B8" },
};

function errorMessageFromUnknown(e: unknown): string {
  if (e instanceof ApiError) {
    const d = e.details;
    if (typeof d === "object" && d !== null && "error" in d) {
      const err = (d as { error?: { message?: string } }).error;
      if (typeof err?.message === "string" && err.message.trim()) return err.message;
    }
    return e.message;
  }
  if (e instanceof Error) return e.message;
  return "Something went wrong. Try again.";
}

function normalizeHex(value: string): string | null {
  const t = value.trim();
  if (!t) return null;
  if (/^#[0-9A-Fa-f]{6}$/.test(t)) return t;
  return null;
}

function resolveThemeRowColours(row: OnboardingThemeOption): {
  primary: string;
  secondary: string;
} {
  if (row.theme != null && typeof row.theme === "object") {
    const palette = themeColoursFromAccountBrandingTheme({
      id: row.id,
      name: row.label,
      theme: row.theme,
    });
    return { primary: palette.primary, secondary: palette.secondary };
  }
  const fb = SWATCH_FALLBACK_BY_ID[row.id];
  if (fb) return fb;
  return { primary: "#64748B", secondary: "#94A3B8" };
}

function themeIdFromCreateThemeResponse(data: CreateOnboardingStep2ThemeResponse): number | null {
  const id = data.data.id ?? data.data.themeId;
  return typeof id === "number" && Number.isFinite(id) ? id : null;
}

export const WizardStepBranding = forwardRef<WizardStepBrandingHandle, WizardStepBrandingProps>(
  function WizardStepBranding({ accountId, onContinue, onPendingChange }, ref) {
    const brandingQuery = useAccountBranding(accountId, { enabled: Boolean(accountId) });
    const meQuery = useAccountMe();
    const themesQuery = useOnboardingLookupThemes();
    const updateStep2 = useUpdateOnboardingStep2(accountId);
    const createTheme = useCreateOnboardingStep2Theme(accountId);
    const patchBranding = usePatchAccountBranding(accountId);

    const [brandingMode, setBrandingMode] = useState<BrandingMode>("custom");
    const [selectedThemeId, setSelectedThemeId] = useState("");
    const [primaryColor, setPrimaryColor] = useState("#000000");
    const [secondaryColor, setSecondaryColor] = useState("#666666");
    const [colourDefaultPrimary, setColourDefaultPrimary] = useState("#000000");
    const [colourDefaultSecondary, setColourDefaultSecondary] = useState("#666666");
    const [validationError, setValidationError] = useState<string | null>(null);
    const [_primaryValid, setPrimaryValid] = useState(true);
    const [_secondaryValid, setSecondaryValid] = useState(true);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoAssetPreviewBlobUrl, setLogoAssetPreviewBlobUrl] = useState<string | null>(null);
    const [logoUploaderKey, setLogoUploaderKey] = useState(0);

    const customSnapshotRef = useRef<{
      primary: string;
      secondary: string;
      themeId: number;
    } | null>(null);
    const brandingHydratedRef = useRef(false);

    const colourSourceMode: ColourSourceMode = brandingMode === "default" ? "premade" : "custom";

    const brandingPalette = useMemo(
      () => ({
        primary: colourDefaultPrimary,
        secondary: colourDefaultSecondary,
      }),
      [colourDefaultPrimary, colourDefaultSecondary],
    );

    useEffect(() => {
      onPendingChange?.(updateStep2.isPending || createTheme.isPending || patchBranding.isPending);
    }, [updateStep2.isPending, createTheme.isPending, patchBranding.isPending, onPendingChange]);

    useEffect(() => {
      if (!logoFile) {
        setLogoAssetPreviewBlobUrl(null);
        return;
      }
      const url = URL.createObjectURL(logoFile);
      setLogoAssetPreviewBlobUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    }, [logoFile]);

    const brandingPayload = brandingQuery.data;
    const gatewayRedirect =
      brandingPayload && isAccountBrandingGatewayRedirect(brandingPayload) ? brandingPayload : null;

    const posterUrl = useMemo(() => {
      if (!brandingPayload || isAccountBrandingGatewayRedirect(brandingPayload)) return null;
      return brandingPayload.data.template?.poster?.url ?? null;
    }, [brandingPayload]);

    const onboardingLogoUrl = useMemo(() => {
      if (!brandingPayload || isAccountBrandingGatewayRedirect(brandingPayload)) return null;
      return brandingPayload.data.onboardingLogo?.url ?? null;
    }, [brandingPayload]);

    const logoPreviewUrl = onboardingLogoUrl ?? posterUrl;
    const assetPreviewLogoSrc = logoAssetPreviewBlobUrl ?? logoPreviewUrl ?? null;

    const initialThemeId = useMemo(() => {
      if (!brandingPayload || isAccountBrandingGatewayRedirect(brandingPayload)) return null;
      return brandingPayload.data.theme?.id ?? null;
    }, [brandingPayload]);

    const themeRows = useMemo((): OnboardingThemeOption[] => {
      if (themesQuery.isPending) return [];
      const rows = themesQuery.data?.data;
      if (rows && rows.length > 0) return rows;
      return FALLBACK_PREMADE_THEMES;
    }, [themesQuery.data, themesQuery.isPending]);

    const derivedCustomTheme = useMemo(() => {
      const payload = meQuery.data?.data;
      // Wizard `accountId` only — never compatibility me.accountId or accounts[0].
      const row = activeAccountSummaryFromMePayload(payload, accountId);
      return buildOnboardingCustomThemeName({ user: payload?.user ?? null, accountRow: row });
    }, [meQuery.data?.data, accountId]);

    useEffect(() => {
      if (
        !brandingPayload ||
        isAccountBrandingGatewayRedirect(brandingPayload) ||
        brandingHydratedRef.current
      ) {
        return;
      }
      const rows = themeRows;
      if (rows.length === 0) return;

      brandingHydratedRef.current = true;
      const themeEntity = brandingPayload.data.theme;

      if (themeEntity?.id == null) {
        setBrandingMode("custom");
        const row = rows[0];
        if (row) {
          const c = resolveThemeRowColours(row);
          setPrimaryColor(c.primary);
          setSecondaryColor(c.secondary);
          setColourDefaultPrimary(c.primary);
          setColourDefaultSecondary(c.secondary);
          setSelectedThemeId(String(row.id));
        }
        return;
      }

      const tid = themeEntity.id;
      setSelectedThemeId(String(tid));

      const c = themeColoursFromAccountBrandingTheme(themeEntity);
      setPrimaryColor(c.primary);
      setSecondaryColor(c.secondary);
      setColourDefaultPrimary(c.primary);
      setColourDefaultSecondary(c.secondary);
      setBrandingMode("custom");
      customSnapshotRef.current = {
        primary: c.primary,
        secondary: c.secondary,
        themeId: tid,
      };
    }, [brandingPayload, themeRows]);

    const hasExistingLogo = Boolean(logoPreviewUrl);
    const logoDirty = Boolean(logoFile);

    const themesLookupWarning =
      themesQuery.isError ||
      (themesQuery.isSuccess && (!themesQuery.data?.data || themesQuery.data.data.length === 0));

    const selectedThemeIdNum = useMemo(() => {
      if (selectedThemeId === "") return null;
      const n = Number(selectedThemeId);
      return Number.isNaN(n) ? null : n;
    }, [selectedThemeId]);

    const selectedRow = useMemo(
      () => themeRows.find((t) => String(t.id) === selectedThemeId) ?? null,
      [themeRows, selectedThemeId],
    );

    const previewPrimaryHex =
      brandingMode === "default"
        ? selectedRow
          ? resolveThemeRowColours(selectedRow).primary
          : "#000000"
        : primaryColor;
    const previewSecondaryHex =
      brandingMode === "default"
        ? selectedRow
          ? resolveThemeRowColours(selectedRow).secondary
          : "#666666"
        : secondaryColor;

    const np = tryNormalizeHex(previewPrimaryHex);
    const ns = tryNormalizeHex(previewSecondaryHex);
    const duplicate = np !== null && ns !== null && np === ns;

    const themeChanged = useMemo(() => {
      if (selectedThemeIdNum == null) return false;
      return selectedThemeIdNum !== initialThemeId;
    }, [selectedThemeIdNum, initialThemeId]);

    const colourFormWarnings = useMemo(() => {
      if (!np || !ns || duplicate) return [];
      const out: string[] = [];
      if (colorsAreTooSimilar(np, ns)) {
        out.push("These colours are very similar and may not create enough distinction in assets");
      }
      if (bothColorsVeryLight(np, ns)) {
        out.push(
          "Both colours are extremely light; white text may be hard to read on the gradient",
        );
      }
      if (bothColorsVeryDark(np, ns)) {
        out.push("Both colours are extremely dark; dark text may be hard to read on the gradient");
      }
      return out;
    }, [np, ns, duplicate]);

    const handleLogoCropComplete = useCallback((payload: ImageUploaderCropCompletePayload) => {
      setLogoFile(payload.file);
    }, []);

    const handleLogoUploaderReset = useCallback(() => {
      setLogoFile(null);
    }, []);

    const applyDefaultModeFromRow = useCallback((row: OnboardingThemeOption) => {
      const c = resolveThemeRowColours(row);
      setPrimaryColor(c.primary);
      setSecondaryColor(c.secondary);
      setColourDefaultPrimary(c.primary);
      setColourDefaultSecondary(c.secondary);
    }, []);

    const handleBrandingModeChange = useCallback(
      (mode: BrandingMode) => {
        if (mode === "custom" && brandingMode === "default") {
          const row = selectedRow ?? themeRows[0];
          if (row) applyDefaultModeFromRow(row);
        }
        setBrandingMode(mode);
      },
      [brandingMode, selectedRow, themeRows, applyDefaultModeFromRow],
    );

    const handleColourSourceModeChange = useCallback(
      (next: ColourSourceMode) => {
        if (next === "premade") {
          setSelectedThemeId("");
        }
        handleBrandingModeChange(next === "premade" ? "default" : "custom");
      },
      [handleBrandingModeChange],
    );

    const submit = useCallback(async () => {
      setValidationError(null);
      if (gatewayRedirect) return;

      if (brandingMode === "default") {
        if (!themeChanged && !logoDirty) {
          if (hasExistingLogo || initialThemeId != null) {
            onContinue();
            return;
          }
          setValidationError(
            "Choose a premade theme, switch to custom branding, or upload a logo.",
          );
          return;
        }

        const body: UpdateOnboardingStep2Body = {};
        if (themeChanged && selectedThemeIdNum != null) {
          body.themeId = selectedThemeIdNum;
        }
        if (Object.keys(body).length === 0 && !logoFile) {
          onContinue();
          return;
        }

        try {
          await updateStep2.mutateAsync(logoFile ? { file: logoFile, body } : { body });
          setLogoFile(null);
          setLogoUploaderKey((k) => k + 1);
          onContinue();
        } catch (e) {
          setValidationError(errorMessageFromUnknown(e));
        }
        return;
      }

      if (meQuery.isPending) {
        setValidationError("Loading your account…");
        return;
      }
      if (meQuery.isError) {
        setValidationError("Could not load your account. Refresh the page and try again.");
        return;
      }
      if (!derivedCustomTheme.isComplete) {
        setValidationError(
          "We could not build a theme name from your profile and organisation. Complete step 1 (Organisation), then try again, or refresh the page.",
        );
        return;
      }
      const name = derivedCustomTheme.name;
      const p = normalizeHex(primaryColor);
      const s = normalizeHex(secondaryColor);
      if (!p || !s) {
        setValidationError("Enter valid primary and secondary HEX colours.");
        return;
      }
      if (p === s) {
        setValidationError("Primary and secondary colours must be different.");
        return;
      }

      const snap = customSnapshotRef.current;
      const unchanged =
        snap && snap.primary === p && snap.secondary === s && snap.themeId === initialThemeId;

      let themeIdForPatch: number | null = selectedThemeIdNum;

      try {
        if (!unchanged) {
          const res = await createTheme.mutateAsync({
            name,
            primary: p,
            secondary: s,
            dark: THEME_JSON_DEFAULT_DARK,
            white: THEME_JSON_DEFAULT_WHITE,
          });
          themeIdForPatch = themeIdFromCreateThemeResponse(res);
          if (themeIdForPatch == null) {
            setValidationError("Custom theme was created, but its id was missing. Try again.");
            return;
          }
          setSelectedThemeId(String(themeIdForPatch));
        }

        const body: UpdateOnboardingStep2Body = {};
        if (themeIdForPatch != null && (themeIdForPatch !== initialThemeId || !unchanged)) {
          body.themeId = themeIdForPatch;
        }
        if (Object.keys(body).length === 0 && !logoFile) {
          onContinue();
          return;
        }

        await updateStep2.mutateAsync(logoFile ? { file: logoFile, body } : { body });
        if (!unchanged && themeIdForPatch != null) {
          await patchBranding.mutateAsync({
            themeId: themeIdForPatch,
            palette: { primary: p, secondary: s },
            theme: {
              themeId: themeIdForPatch,
              primary: p,
              secondary: s,
              dark: THEME_JSON_DEFAULT_DARK,
              white: THEME_JSON_DEFAULT_WHITE,
            },
          });
        }
        setLogoFile(null);
        setLogoUploaderKey((k) => k + 1);
        onContinue();
      } catch (e) {
        setValidationError(errorMessageFromUnknown(e));
      }
    }, [
      gatewayRedirect,
      brandingMode,
      themeChanged,
      logoDirty,
      logoFile,
      hasExistingLogo,
      initialThemeId,
      selectedThemeIdNum,
      derivedCustomTheme.isComplete,
      derivedCustomTheme.name,
      meQuery.isError,
      meQuery.isPending,
      primaryColor,
      secondaryColor,
      updateStep2,
      createTheme,
      patchBranding,
      onContinue,
    ]);

    useImperativeHandle(ref, () => ({ submit }), [submit]);

    if (gatewayRedirect) {
      return (
        <div className="flex flex-col gap-4">
          <InlineAlert
            message="We could not load branding for this account. Return to organisation selection and try again."
            variant="destructive"
          />
          <TypographyBodySmall as="p" tone="default">
            <Link
              href={ROUTES.selectOrganisation}
              className="text-primary font-medium underline underline-offset-4"
            >
              Back to organisation selection
            </Link>
          </TypographyBodySmall>
        </div>
      );
    }

    if (brandingQuery.isError) {
      return (
        <InlineAlert
          message="We could not load branding. Refresh the page or try again later."
          variant="destructive"
        />
      );
    }

    if (brandingQuery.isPending) {
      return (
        <TypographyFinePrint tone="muted" aria-busy="true">
          Loading branding…
        </TypographyFinePrint>
      );
    }

    return (
      <div
        className={cn(
          "grid gap-8",
          "min-[1025px]:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] min-[1025px]:items-start",
        )}
      >
        <div className="flex min-w-0 flex-col gap-6">
          <section className="w-full min-w-0 space-y-3">
            <div className="space-y-1">
              <h2 className="text-sm font-semibold">Logo</h2>
              <TypographyFinePrint className="text-muted-foreground">
                Upload and crop your organisation logo.
              </TypographyFinePrint>
            </div>
            <ImageUploaderCrop
              key={`${accountId}-${logoUploaderKey}`}
              aspect={1}
              aspectPresets={[...SELECTABLE_LOGO_CROP_PRESETS]}
              defaultAspectPresetIndex={0}
              hideAspectPresetOnUploader
              label=""
              dropzoneVariant="primary-dark"
              showValidationHints
              maxFileSizeMb={8}
              minSourceWidth={LOGO_MIN_SOURCE_WIDTH_PX}
              minSourceHeight={LOGO_MIN_SOURCE_HEIGHT_PX}
              minOutputWidth={LOGO_MIN_OUTPUT_WIDTH_PX}
              minOutputHeight={LOGO_MIN_OUTPUT_HEIGHT_PX}
              onComplete={handleLogoCropComplete}
              onReset={handleLogoUploaderReset}
            />
          </section>

          {validationError ? <InlineAlert message={validationError} variant="destructive" /> : null}

          {themesLookupWarning ? (
            <InlineAlert
              message="We couldn't load the full theme list. You can still choose from the default themes below. Refresh the page if this keeps happening."
              variant="warning"
            />
          ) : null}

          <BrandColoursCard
            interactive
            headerTone="light"
            footerVariant="onboarding"
            palette={brandingPalette}
            primary={primaryColor}
            setPrimary={setPrimaryColor}
            secondary={secondaryColor}
            setSecondary={setSecondaryColor}
            setPrimaryValid={setPrimaryValid}
            setSecondaryValid={setSecondaryValid}
            colourSourceMode={colourSourceMode}
            selectedPremadeThemeId={selectedThemeId}
            setSelectedPremadeThemeId={setSelectedThemeId}
            themesQuery={themesQuery}
            themeRows={themeRows}
            duplicate={duplicate}
            formWarnings={colourFormWarnings}
            handleColourSourceModeChange={handleColourSourceModeChange}
          />
        </div>

        <aside
          className="hidden min-w-0 min-[1025px]:sticky min-[1025px]:top-6 min-[1025px]:flex min-[1025px]:flex-col min-[1025px]:gap-4 min-[1025px]:self-start"
          aria-label="Brand colours asset preview"
        >
          <FixturaAssetColorPreview
            primaryHex={previewPrimaryHex}
            secondaryHex={previewSecondaryHex}
            logoSrc={assetPreviewLogoSrc}
          />
        </aside>
      </div>
    );
  },
);

WizardStepBranding.displayName = "WizardStepBranding";
