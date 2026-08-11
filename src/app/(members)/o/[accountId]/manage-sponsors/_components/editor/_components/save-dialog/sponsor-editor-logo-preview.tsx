import { TypographyEmptyStateDescription } from "@/components/typography";

import { SPONSOR_EDITOR_SAVE_DIALOG_COPY } from "../../_constants/sponsor-editor-save-dialog";

import type { SponsorEditorLogoPreviewProps } from "../../_types/sponsor-editor";

export function SponsorEditorLogoPreview({
  clearLogo,
  logoPreviewUrl,
  savedLogoUrl,
  name,
}: SponsorEditorLogoPreviewProps) {
  if (clearLogo) {
    return (
      <SponsorEditorLogoPreviewEmptyState>
        {SPONSOR_EDITOR_SAVE_DIALOG_COPY.logoRemovalMessage}
      </SponsorEditorLogoPreviewEmptyState>
    );
  }

  if (logoPreviewUrl) {
    return (
      <img
        src={logoPreviewUrl}
        alt={logoAlt(name, SPONSOR_EDITOR_SAVE_DIALOG_COPY.logoPreviewAlt)}
        className="mx-auto block h-auto max-h-48 w-auto max-w-full object-contain"
      />
    );
  }

  if (savedLogoUrl) {
    return (
      <img
        src={savedLogoUrl}
        alt={logoAlt(name, SPONSOR_EDITOR_SAVE_DIALOG_COPY.savedLogoAlt)}
        className="mx-auto block h-auto max-h-48 w-auto max-w-full object-contain"
      />
    );
  }

  return (
    <SponsorEditorLogoPreviewEmptyState>
      {SPONSOR_EDITOR_SAVE_DIALOG_COPY.emptyLogoMessage}
    </SponsorEditorLogoPreviewEmptyState>
  );
}

function SponsorEditorLogoPreviewEmptyState({ children }: { children: string }) {
  return (
    <div className="flex min-h-32 w-[min(100%,18rem)] min-w-48 items-center justify-center p-3">
      <TypographyEmptyStateDescription className="text-center leading-snug">
        {children}
      </TypographyEmptyStateDescription>
    </div>
  );
}

function logoAlt(name: string, fallback: string) {
  const trimmedName = name.trim();

  return trimmedName ? `${trimmedName} logo` : fallback;
}
