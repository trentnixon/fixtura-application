"use client";

import { FixturaAssetColorPreview } from "@/components/brand-color";

import { SaveBrandingCtas } from "./save-branding-ctas";

import type { SaveBrandingCtasProps } from "./save-branding-ctas";

export type PreviewSidebarProps = {
  primaryHex: string;
  secondaryHex: string;
  logoSrc: string | null;
  templateModeSlug: string | null;
  saveCtasProps: Omit<SaveBrandingCtasProps, "variant">;
};

export function PreviewSidebar({
  primaryHex,
  secondaryHex,
  logoSrc,
  templateModeSlug,
  saveCtasProps,
}: PreviewSidebarProps) {
  return (
    <div className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-6">
      <FixturaAssetColorPreview
        primaryHex={primaryHex}
        secondaryHex={secondaryHex}
        logoSrc={logoSrc}
        templateModeSlug={templateModeSlug}
      />
      <SaveBrandingCtas {...saveCtasProps} variant="mobile" />
    </div>
  );
}
