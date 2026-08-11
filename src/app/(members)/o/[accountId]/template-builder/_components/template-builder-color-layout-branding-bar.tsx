"use client";

import Link from "next/link";
import { useMemo } from "react";

import { Button } from "@/components/ui/button";
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
  const theme = branding?.theme ?? null;
  const brandColors = useMemo(() => themeColoursFromAccountBrandingTheme(theme), [theme]);

  const brandingHref = `/o/${encodeURIComponent(accountId)}/branding`;

  return (
    <div className="flex items-center justify-between gap-2 px-1">
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground shrink-0 text-xs font-medium">Branding:</span>
        <span
          className="inline-flex items-center gap-1.5"
          aria-label={`Primary ${brandColors.primary}, secondary ${brandColors.secondary}`}
        >
          <OrganizationColourSwatch hex={brandColors.primary} label="Primary" />
          <OrganizationColourSwatch hex={brandColors.secondary} label="Secondary" />
        </span>
      </div>

      <Button variant="outline" size="sm" asChild>
        <Link href={brandingHref}>Edit colours</Link>
      </Button>
    </div>
  );
}
