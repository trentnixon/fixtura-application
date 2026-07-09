"use client";

import Link from "next/link";
import { useMemo } from "react";

import { templateModeLabel } from "@/components/pickers/template-mode/_utils";
import { Button } from "@/components/ui/button";
import { readTemplateModeId } from "@/features/branding/components/branding-workspace/_utils";
import { useTemplateModesUi } from "@/lib/api/hooks/template-modes/useTemplateModesUi";
import { themeColoursFromAccountBrandingTheme } from "@/lib/branding/theme-colours-from-account";

import type { AccountBrandingData } from "@/types/api/account";

function OrganizationColourSwatch({ hex, label }: { hex: string; label: string }) {
  return (
    <span
      className="border-border ring-border inline-block size-6 shrink-0 rounded-full border ring-1"
      style={{ backgroundColor: hex }}
      title={`${label}: ${hex}`}
      aria-hidden
    />
  );
}

export function TemplateBuilderColorLayoutBrandingBar({
  accountId,
  branding,
}: {
  accountId: string;
  branding: AccountBrandingData | null;
}) {
  const templateModesQuery = useTemplateModesUi();
  const theme = branding?.theme ?? null;
  const brandColors = useMemo(() => themeColoursFromAccountBrandingTheme(theme), [theme]);

  const contrastModeLabel = useMemo(() => {
    const modes = templateModesQuery.data?.data ?? [];
    const savedId = readTemplateModeId(branding?.template_option ?? null);
    if (savedId === null) return null;
    const mode = modes.find((item) => item.id === savedId);
    return mode ? templateModeLabel(mode) : null;
  }, [branding?.template_option, templateModesQuery.data]);

  const brandingHref = `/o/${encodeURIComponent(accountId)}/branding`;

  return (
    <>
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground shrink-0">Branding:</span>
        <span
          className="inline-flex items-center gap-1.5"
          aria-label={`Primary ${brandColors.primary}, secondary ${brandColors.secondary}`}
        >
          <OrganizationColourSwatch hex={brandColors.primary} label="Primary" />
          <OrganizationColourSwatch hex={brandColors.secondary} label="Secondary" />
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-muted-foreground shrink-0">Contrast:</span>
        <span className="font-medium">{contrastModeLabel ?? "Not set"}</span>
      </div>

      <Button variant="outline" size="sm" asChild>
        <Link href={brandingHref}>Change</Link>
      </Button>
    </>
  );
}
