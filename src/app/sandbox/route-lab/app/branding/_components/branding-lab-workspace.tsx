"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import {
  BrandColorField,
  FixturaAssetColorPreview,
  PersistentFieldFeedback,
} from "@/components/brand-color";
import { useTemplateModePickerList } from "@/components/pickers/template-mode";
import { templateModeLabel } from "@/components/pickers/template-mode/_utils";
import { TypographyMuted } from "@/components/typography";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/container";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SectionBlock, SectionLabel } from "@/components/ui/section";
import { LAB_BRANDING_ORG_LABEL } from "@/features/route-lab/fixtures/branding";
import {
  bothColorsVeryDark,
  bothColorsVeryLight,
  colorsAreTooSimilar,
  tryNormalizeHex,
} from "@/lib/brand-color";
import { themeColoursFromAccountBrandingTheme } from "@/lib/branding/theme-colours-from-account";
import { cn } from "@/lib/utils";

import { BrandingTemplateModeCardsInput } from "./branding-template-mode-cards-input";

import type { AccountBrandingData } from "@/types/api/account";

export type BrandingLabWorkspaceProps = {
  data: AccountBrandingData;
  mode: "view" | "edit";
  /**
   * When true (route lab), CMS/API persistence does not run; dialog footer mentions lab stub.
   * Omit or false when wiring production saves against real endpoints.
   */
  cmsSaveLabStub?: boolean;
};

export function BrandingLabWorkspace({
  data,
  mode,
  cmsSaveLabStub = true,
}: BrandingLabWorkspaceProps) {
  const {
    selectedMode,
    selectValue,
    isPending: templateModesPending,
  } = useTemplateModePickerList();

  const palette = themeColoursFromAccountBrandingTheme(data.theme);
  const [primary, setPrimary] = useState(palette.primary);
  const [secondary, setSecondary] = useState(palette.secondary);
  const [primaryValid, setPrimaryValid] = useState(true);
  const [secondaryValid, setSecondaryValid] = useState(true);

  const np = tryNormalizeHex(primary);
  const ns = tryNormalizeHex(secondary);
  const duplicate = np !== null && ns !== null && np === ns;

  const formWarnings = useMemo(() => {
    if (!np || !ns || duplicate) return [];
    const out: string[] = [];
    if (colorsAreTooSimilar(np, ns)) {
      out.push("These colors are very similar and may not create enough distinction in assets");
    }
    if (bothColorsVeryLight(np, ns)) {
      out.push("Both colors are extremely light; white text may be hard to read on the gradient");
    }
    if (bothColorsVeryDark(np, ns)) {
      out.push("Both colors are extremely dark; dark text may be hard to read on the gradient");
    }
    return out;
  }, [np, ns, duplicate]);

  const template = data.template;
  const themeName = data.theme?.name ?? "—";
  const templateTitle = template?.frontEndName ?? template?.name ?? "—";
  const interactive = mode === "edit";

  const colorsReady = primaryValid && secondaryValid && np !== null && ns !== null && !duplicate;

  const [confirmedAt, setConfirmedAt] = useState<string | null>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);

  useEffect(() => {
    setConfirmedAt(null);
  }, [primary, secondary, selectValue]);

  const finalizeSaveToCms = () => {
    if (!interactive || !colorsReady || np === null || ns === null) return;
    setSaveDialogOpen(false);
    const time = new Date().toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    setConfirmedAt(time);
    toast.success("Branding saved", {
      description: cmsSaveLabStub
        ? `Colours and template mode validated — CMS/API save runs only outside route lab.${
            selectedMode ? ` (${templateModeLabel(selectedMode)})` : ""
          }`
        : `Primary, secondary, and template mode were saved to your organisation profile.${
            selectedMode ? ` (${templateModeLabel(selectedMode)})` : ""
          }`,
    });
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Branding — ${LAB_BRANDING_ORG_LABEL}`}
        description={`Template: ${templateTitle}. Theme: ${themeName}. Fixture-backed lab (no API).`}
      />

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
          <SectionBlock variant="inset" spacing="md">
            <BrandColorField
              label="Primary brand colour"
              description="Pick visually or enter an exact HEX value."
              value={primary}
              onChange={setPrimary}
              disabled={!interactive}
              required
              requiredErrorMessage="Primary color is required"
              showPreview={false}
              validateContrast={false}
              allowReset={interactive}
              defaultValue={palette.primary}
              onValidChange={setPrimaryValid}
            />

            <BrandColorField
              label="Secondary brand colour"
              description="Must differ from primary. Pair warnings appear beside the fields."
              value={secondary}
              onChange={setSecondary}
              disabled={!interactive}
              required
              requiredErrorMessage="Secondary color is required"
              showPreview={false}
              validateContrast={false}
              allowReset={interactive}
              defaultValue={palette.secondary}
              onValidChange={setSecondaryValid}
            />

            {interactive && duplicate ? (
              <PersistentFieldFeedback variant="error">
                Primary and secondary colors must be different
              </PersistentFieldFeedback>
            ) : null}

            {interactive
              ? formWarnings.map((msg, i) => (
                  <PersistentFieldFeedback key={i} variant="warning">
                    {msg}
                  </PersistentFieldFeedback>
                ))
              : null}

            {!interactive ? (
              <TypographyMuted className="text-xs">
                View mode — switch to edit to change colours.
              </TypographyMuted>
            ) : null}
          </SectionBlock>

          <BrandingTemplateModeCardsInput
            interactive={interactive}
            brandPrimaryHex={primary}
            brandSecondaryHex={secondary}
          />

          {interactive ? (
            <div className="flex flex-col gap-3 border-t pt-4">
              <Button type="button" disabled={!colorsReady} onClick={() => setSaveDialogOpen(true)}>
                Save branding
              </Button>
              {confirmedAt ? (
                <PersistentFieldFeedback variant="success">
                  Saved at {confirmedAt}.{" "}
                  {cmsSaveLabStub ? "Route lab — CMS/API call not executed." : "Colours updated."}
                </PersistentFieldFeedback>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="flex min-w-0 flex-col lg:sticky lg:top-6">
          <FixturaAssetColorPreview
            primaryHex={primary}
            secondaryHex={secondary}
            logoSrc={data.onboardingLogo?.url}
            templateModeSlug={selectedMode?.slug ?? null}
          />
        </div>
      </div>

      {!primaryValid || !secondaryValid ? (
        <TypographyMuted className="text-xs">
          Resolve invalid hex values to sync previews.
        </TypographyMuted>
      ) : null}

      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save branding?</DialogTitle>
            <DialogDescription>
              This updates primary and secondary colours and your template mode on your organisation
              profile so templates and renders use the new palette and contrast preset.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {np !== null && ns !== null ? (
              <div className="border-border space-y-4 rounded-lg border p-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-foreground font-mono text-sm leading-none">
                      Primary {np}
                    </span>
                    <span
                      aria-hidden
                      className="border-border size-7 shrink-0 rounded-md border shadow-sm"
                      style={{ backgroundColor: np }}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-foreground font-mono text-sm leading-none">
                      Secondary {ns}
                    </span>
                    <span
                      aria-hidden
                      className="border-border size-7 shrink-0 rounded-md border shadow-sm"
                      style={{ backgroundColor: ns }}
                    />
                  </div>
                </div>
                <div className="border-border space-y-1 border-t pt-3">
                  <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                    Contrast selector
                  </p>
                  {templateModesPending ? (
                    <p className="text-muted-foreground text-sm">Loading template modes…</p>
                  ) : selectedMode ? (
                    <>
                      <p className="text-foreground text-sm font-medium">
                        {templateModeLabel(selectedMode)}
                      </p>
                      {selectedMode.slug ? (
                        <p className="text-muted-foreground font-mono text-xs">
                          slug <span className="text-foreground">{selectedMode.slug}</span>
                        </p>
                      ) : (
                        <p className="text-destructive text-xs">
                          No slug on this mode — configure in CMS before relying on saves.
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-muted-foreground text-sm">No template mode selected.</p>
                  )}
                </div>
              </div>
            ) : null}
            {cmsSaveLabStub ? (
              <p className="text-muted-foreground text-xs leading-relaxed">
                Route lab: the CMS save request is not sent yet — wire this dialog when branding
                APIs are connected here.
              </p>
            ) : null}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" disabled={!colorsReady} onClick={finalizeSaveToCms}>
              Save to CMS
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
