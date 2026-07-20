"use client";

import { Palette } from "lucide-react";

import { BrandColorField, PersistentFieldFeedback } from "@/components/brand-color";
import { MetricComparisonCard } from "@/components/cards";
import { TypographyMuted } from "@/components/typography";
import { Button } from "@/components/ui/button";
import { GridCard, GridCardVisualSlot } from "@/components/ui/grid-card";
import { cn } from "@/lib/utils";

import {
  BRANDING_CONTAINER_HEADER_CLASS_NAME,
  BRANDING_CONTAINER_HEADER_LIGHT_CLASS_NAME,
  BrandingContainerHeaderTitle,
} from "../../branding-container-header-title";
import { cmsThemeRowColours } from "../_utils";

import type { ColourSourceMode, UseBrandingWorkspaceResult } from "../_types";

export type BrandColoursCardProps = {
  interactive: boolean;
  palette: UseBrandingWorkspaceResult["palette"];
  primary: string;
  setPrimary: UseBrandingWorkspaceResult["setPrimary"];
  secondary: string;
  setSecondary: UseBrandingWorkspaceResult["setSecondary"];
  setPrimaryValid: UseBrandingWorkspaceResult["setPrimaryValid"];
  setSecondaryValid: UseBrandingWorkspaceResult["setSecondaryValid"];
  colourSourceMode: ColourSourceMode;
  selectedPremadeThemeId: string;
  setSelectedPremadeThemeId: UseBrandingWorkspaceResult["setSelectedPremadeThemeId"];
  themesQuery: UseBrandingWorkspaceResult["themesQuery"];
  themeRows: UseBrandingWorkspaceResult["themeRows"];
  duplicate: boolean;
  formWarnings: string[];
  handleColourSourceModeChange: UseBrandingWorkspaceResult["handleColourSourceModeChange"];
  /** Dark navy header (default) or light grey band for onboarding and compact layouts. */
  headerTone?: "dark" | "light";
  /**
   * `onboarding` — mode buttons side-by-side from `md`; preview hint only below `md`.
   * `workspace` — existing layout (buttons row from 1200px).
   */
  footerVariant?: "workspace" | "onboarding";
};

export function BrandColoursCard({
  interactive,
  palette,
  primary,
  setPrimary,
  secondary,
  setSecondary,
  setPrimaryValid,
  setSecondaryValid,
  colourSourceMode,
  selectedPremadeThemeId,
  setSelectedPremadeThemeId,
  themesQuery,
  themeRows,
  duplicate,
  formWarnings,
  handleColourSourceModeChange,
  headerTone = "dark",
  footerVariant = "workspace",
}: BrandColoursCardProps) {
  const onboardingFooter = footerVariant === "onboarding";
  const body = (
    <div className="space-y-5">
      {!interactive ? (
        <TypographyMuted className="text-sm">
          Fixture colours below — switch route lab to edit to set brand colours or browse presets.
        </TypographyMuted>
      ) : null}

      {(!interactive || colourSourceMode === "custom") && (
        <div className="grid gap-4 md:grid-cols-2">
          <BrandColorField
            label="Primary"
            value={primary}
            onChange={setPrimary}
            disabled={!interactive || colourSourceMode === "premade"}
            required
            requiredErrorMessage="Primary color is required"
            showPreview={false}
            validateContrast={false}
            allowReset={interactive && colourSourceMode === "custom"}
            defaultValue={palette.primary}
            onValidChange={setPrimaryValid}
          />

          <BrandColorField
            label="Secondary"
            value={secondary}
            onChange={setSecondary}
            disabled={!interactive || colourSourceMode === "premade"}
            required
            requiredErrorMessage="Secondary color is required"
            showPreview={false}
            validateContrast={false}
            allowReset={interactive && colourSourceMode === "custom"}
            defaultValue={palette.secondary}
            onValidChange={setSecondaryValid}
          />
        </div>
      )}

      {interactive && colourSourceMode === "premade" ? (
        <div className="space-y-3">
          {themesQuery.isPending ? (
            <p className="text-muted-foreground font-sans text-sm leading-6" role="status">
              Loading theme options…
            </p>
          ) : null}

          {themesQuery.isError ? (
            <PersistentFieldFeedback variant="warning">
              {themesQuery.error instanceof Error
                ? themesQuery.error.message
                : "Could not load theme options. Sign in or try again."}
            </PersistentFieldFeedback>
          ) : null}

          {themesQuery.isSuccess ? (
            themeRows.length === 0 ? (
              <TypographyMuted className="text-sm">No theme options returned.</TypographyMuted>
            ) : (
              <div
                role="group"
                aria-label="Optional preset themes from CMS"
                className="max-h-[min(70vh,44rem)] overflow-x-hidden overflow-y-auto pt-1 pb-2 max-lg:max-h-none max-lg:overflow-visible"
              >
                <div className="grid grid-cols-2 justify-items-center gap-4 sm:gap-6 xl:grid-cols-4 2xl:grid-cols-5">
                  {themeRows.map((row) => {
                    const sw = cmsThemeRowColours(row);
                    const sel = sw ? String(row.id) === selectedPremadeThemeId : false;
                    return (
                      <GridCard
                        key={row.id}
                        title={row.label}
                        description={
                          sw
                            ? `${sw.primary} — ${sw.secondary}`
                            : "No palette on this preset (id " + String(row.id) + ")"
                        }
                        ctaLabel={sw ? "Apply preset" : "Unavailable"}
                        disabled={!sw}
                        onClick={() => {
                          if (!sw) return;
                          setSelectedPremadeThemeId(String(row.id));
                          setPrimary(sw.primary);
                          setSecondary(sw.secondary);
                        }}
                        {...(sw
                          ? {
                              tileStyle: {
                                backgroundImage: `linear-gradient(135deg, ${sw.primary} 0%, ${sw.secondary} 100%)`,
                              },
                              className: cn(
                                "!bg-transparent hover:!bg-transparent text-white shadow-xl ring-1 ring-black/15 dark:ring-white/20",
                                sel && "ring-2 ring-white ring-offset-2 ring-offset-background",
                              ),
                              titleClassName: cn(
                                "text-xs leading-tight !font-semibold",
                                "!text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]",
                              ),
                              ctaClassName:
                                "!text-white/95 group-hover:!text-white underline-offset-4 group-hover:underline",
                              visual: (
                                <GridCardVisualSlot
                                  visual="add"
                                  emphasis="strong"
                                  className="border-white/50 bg-black/20! text-white! backdrop-blur-[2px]"
                                />
                              ),
                            }
                          : {
                              titleClassName: "text-xs leading-tight font-semibold",
                              className: cn(sel && "ring-2 ring-primary ring-offset-2"),
                              visual: (
                                <div
                                  className={cn(
                                    "border-border flex size-16 shrink-0 items-center justify-center rounded-xl border border-dashed",
                                    "bg-muted/30 text-muted-foreground text-xs font-medium",
                                  )}
                                  aria-hidden
                                >
                                  —
                                </div>
                              ),
                            })}
                      />
                    );
                  })}
                </div>
              </div>
            )
          ) : null}
        </div>
      ) : null}

      {interactive && duplicate ? (
        <PersistentFieldFeedback variant="error">
          Primary and secondary colors must be different
        </PersistentFieldFeedback>
      ) : null}

      {interactive && colourSourceMode === "custom"
        ? formWarnings.map((msg, i) => (
            <PersistentFieldFeedback key={i} variant="warning">
              {msg}
            </PersistentFieldFeedback>
          ))
        : null}
    </div>
  );

  const footer = interactive ? (
    <div className="flex w-full min-w-0 flex-col gap-4">
      <TypographyMuted
        className={cn("text-sm leading-relaxed", onboardingFooter ? "md:hidden" : "lg:hidden")}
      >
        Preview the changes below
      </TypographyMuted>
      <div
        className={cn(
          "flex w-full max-w-full flex-col gap-2",
          onboardingFooter
            ? "md:flex-row md:flex-wrap md:items-center"
            : "min-[1200px]:flex-row min-[1200px]:flex-wrap min-[1200px]:items-center min-[1200px]:justify-end",
        )}
      >
        <Button
          type="button"
          variant={colourSourceMode === "custom" ? "brandPrimary" : "brandPrimaryOutline"}
          className={cn("w-full", onboardingFooter ? "md:w-auto" : "min-[1200px]:w-auto")}
          onClick={() => handleColourSourceModeChange("custom")}
        >
          Create your brand colours
        </Button>
        <Button
          type="button"
          variant={colourSourceMode === "premade" ? "brandPrimary" : "brandPrimaryOutline"}
          className={cn("w-full", onboardingFooter ? "md:w-auto" : "min-[1200px]:w-auto")}
          onClick={() => handleColourSourceModeChange("premade")}
        >
          Preset themes
        </Button>
      </div>
    </div>
  ) : (
    <TypographyMuted className="text-xs">
      View mode — switch to edit to change colours.
    </TypographyMuted>
  );

  return (
    <MetricComparisonCard
      className="ring-border w-full min-w-0 rounded-2xl border-none shadow-xl ring-1"
      layout="card"
      headerClassName={
        headerTone === "light"
          ? BRANDING_CONTAINER_HEADER_LIGHT_CLASS_NAME
          : BRANDING_CONTAINER_HEADER_CLASS_NAME
      }
      titleRowClassName="items-start"
      title={
        <BrandingContainerHeaderTitle
          tone={headerTone}
          icon={<Palette className="size-5" aria-hidden />}
          title="1. Brand colours"
          description={
            interactive && colourSourceMode === "custom" ? (
              <>
                Choose the colours that represent your organisation. Fine-tune primary and secondary
                using the fields below.
              </>
            ) : (
              "Choose from presets or create your own organisation palette."
            )
          }
        />
      }
      body={body}
      footer={footer}
    />
  );
}
