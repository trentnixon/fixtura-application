"use client";

import { useEffect, useMemo, useState } from "react";

import {
  BrandColorField,
  BrandColorObjectDialog,
  BRAND_OBJECT_DARK,
  BRAND_OBJECT_WHITE,
  type BrandColorObject,
  FixturaAssetColorPreview,
  PersistentFieldFeedback,
} from "@/components/brand-color";
import { TypographyH2, TypographyMuted } from "@/components/typography";
import { Button } from "@/components/ui/button";
import { Surface } from "@/components/ui/container";
import {
  bothColorsVeryDark,
  bothColorsVeryLight,
  colorsAreTooSimilar,
  isWeakDarkOnBrandContrast,
  isWeakWhiteOnBrandContrast,
  tryNormalizeHex,
} from "@/lib/brand-color";
import { cn } from "@/lib/utils";

const DEFAULT_PRIMARY = "#79001F";
const DEFAULT_SECONDARY = "#FDBC2C";

const WHITE_ON_GRADIENT_WARNING = "White text may be difficult to read on parts of this gradient";
const DARK_ON_GRADIENT_WARNING = "Dark text may be difficult to read on parts of this gradient";

export function ColorPickerSandbox() {
  const [primary, setPrimary] = useState(DEFAULT_PRIMARY);
  const [secondary, setSecondary] = useState(DEFAULT_SECONDARY);
  const [primaryFieldValid, setPrimaryFieldValid] = useState(true);
  const [secondaryFieldValid, setSecondaryFieldValid] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  const np = tryNormalizeHex(primary);
  const ns = tryNormalizeHex(secondary);
  const duplicate = np !== null && ns !== null && np === ns;

  const canOpenDialog =
    primaryFieldValid && secondaryFieldValid && np !== null && ns !== null && !duplicate;

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

  const previewReadabilityWarnings = useMemo(() => {
    if (!np || !ns || duplicate) return [];
    const out: string[] = [];
    if (isWeakWhiteOnBrandContrast(np) || isWeakWhiteOnBrandContrast(ns)) {
      out.push(WHITE_ON_GRADIENT_WARNING);
    }
    if (isWeakDarkOnBrandContrast(np) || isWeakDarkOnBrandContrast(ns)) {
      out.push(DARK_ON_GRADIENT_WARNING);
    }
    return out;
  }, [np, ns, duplicate]);

  const dialogValue: BrandColorObject | null =
    np && ns && !duplicate
      ? {
          primary: np,
          secondary: ns,
          dark: BRAND_OBJECT_DARK,
          white: BRAND_OBJECT_WHITE,
        }
      : null;

  const handleShowObject = () => {
    if (!canOpenDialog) return;
    setDialogOpen(true);
  };

  useEffect(() => {
    if (dialogOpen && !canOpenDialog) {
      setDialogOpen(false);
    }
  }, [dialogOpen, canOpenDialog]);

  return (
    <div className="space-y-8">
      <Surface className={cn("ring-border overflow-hidden p-0 shadow-sm ring-1")}>
        <header className="border-border space-y-2 border-b px-6 py-5">
          <TypographyMuted className="text-xs font-medium tracking-wide uppercase">
            Development only
          </TypographyMuted>
          <TypographyH2 className="text-2xl font-semibold tracking-tight">
            Brand colour picker
          </TypographyH2>
          <TypographyMuted className="max-w-2xl leading-relaxed">
            Choose primary and secondary brand colours with the visual picker or exact HEX values.
            Preview updates live. Use Show brand object to inspect the normalised CMS payload (no
            backend save). Feedback is inline only (no toasts).
          </TypographyMuted>
        </header>

        <div
          className={cn(
            "grid gap-8 px-6 py-6",
            "lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] lg:items-start",
          )}
        >
          <div className="max-w-xl space-y-6">
            <BrandColorField
              label="Primary brand colour"
              description="Pick visually or enter an exact HEX value."
              value={primary}
              onChange={setPrimary}
              required
              requiredErrorMessage="Primary color is required"
              showPreview={false}
              validateContrast={false}
              allowReset
              defaultValue={DEFAULT_PRIMARY}
              onValidChange={setPrimaryFieldValid}
            />

            <BrandColorField
              label="Secondary brand colour"
              description="Must differ from primary. Pair warnings appear beside the fields; text-on-gradient hints sit under the preview."
              value={secondary}
              onChange={setSecondary}
              required
              requiredErrorMessage="Secondary color is required"
              showPreview={false}
              validateContrast={false}
              allowReset
              defaultValue={DEFAULT_SECONDARY}
              onValidChange={setSecondaryFieldValid}
            />

            {duplicate ? (
              <PersistentFieldFeedback variant="error">
                Primary and secondary colors must be different
              </PersistentFieldFeedback>
            ) : null}

            {formWarnings.map((msg, i) => (
              <PersistentFieldFeedback key={i} variant="warning">
                {msg}
              </PersistentFieldFeedback>
            ))}

            <div className="flex flex-wrap items-center gap-3 border-t pt-4">
              <Button type="button" onClick={handleShowObject} disabled={!canOpenDialog}>
                Show brand object
              </Button>
            </div>
          </div>

          <div className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-6">
            <FixturaAssetColorPreview primaryHex={primary} secondaryHex={secondary} />
            {previewReadabilityWarnings.map((msg, i) => (
              <PersistentFieldFeedback key={i} variant="warning">
                {msg}
              </PersistentFieldFeedback>
            ))}
          </div>
        </div>
      </Surface>

      <BrandColorObjectDialog open={dialogOpen} onOpenChange={setDialogOpen} value={dialogValue} />
    </div>
  );
}
