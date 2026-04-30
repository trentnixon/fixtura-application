"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { FixturaAssetColorPreview, PersistentFieldFeedback } from "@/components/brand-color";
import {
  ImageUploaderCrop,
  type ImageUploaderCropCompletePayload,
  type ImageUploaderCropSessionSource,
} from "@/components/media/image-uploader-crop";
import { TypographyH3, TypographyMuted } from "@/components/typography";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/container";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SectionBlock } from "@/components/ui/section";
import { LAB_BRANDING_ORG_LABEL } from "@/features/route-lab/fixtures/branding";
import { LAB_LOGO_UPLOADER_SEED_UPLOADED_PREVIEW_URL } from "@/features/route-lab/fixtures/logo-uploader";
import { themeColoursFromAccountBrandingTheme } from "@/lib/branding/theme-colours-from-account";
import { SELECTABLE_LOGO_CROP_PRESETS } from "@/lib/media/selectable-logo-crop-presets";
import { cn } from "@/lib/utils";

import type { AccountBrandingData } from "@/types/api/account";

export type LogoChangeKind = "none" | "first-upload" | "replacement" | "recrop" | "seeded";

export type LogoUploaderLabWorkspaceProps = {
  data: AccountBrandingData;
  mode: "view" | "edit";
  scenarioKey: string;
  seedUploadedPreview: boolean;
  stubSaving: boolean;
  validationScenario?: boolean;
  editableLogoSourceUrl?: string | null;
};

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

function templateModeSlugFromFixture(
  option: AccountBrandingData["template_option"],
): string | null {
  if (!option || typeof option !== "object") return null;
  const slug = option["slug"];
  return typeof slug === "string" ? slug : null;
}

function changeKindLabel(kind: LogoChangeKind): string {
  switch (kind) {
    case "first-upload":
      return "First upload";
    case "replacement":
      return "Replacement";
    case "recrop":
      return "Recrop";
    case "seeded":
      return "Seeded lab preview";
    default:
      return "—";
  }
}

function deriveLogoChangeKind(params: {
  logoFile: File | null;
  logoPreviewUrl: string | null;
  seedUploadedPreview: boolean;
  seedUrl: string;
  savedLogoUrl: string | null;
  sessionSource: ImageUploaderCropSessionSource | undefined;
  hasNewLogoToSave: boolean;
}): LogoChangeKind {
  const {
    logoFile,
    logoPreviewUrl,
    seedUploadedPreview,
    seedUrl,
    savedLogoUrl,
    sessionSource,
    hasNewLogoToSave,
  } = params;

  if (!hasNewLogoToSave) return "none";

  if (seedUploadedPreview && logoPreviewUrl === seedUrl && !logoFile) return "seeded";

  if (logoFile) {
    if (sessionSource === "editableUrl" || sessionSource === "recrop") return "recrop";
    if (sessionSource === "dropzone" || sessionSource === undefined) {
      return savedLogoUrl === null ? "first-upload" : "replacement";
    }
    return savedLogoUrl === null ? "first-upload" : "replacement";
  }

  return "none";
}

export function LogoUploaderLabWorkspace({
  data,
  mode,
  scenarioKey,
  seedUploadedPreview,
  stubSaving,
  validationScenario = false,
  editableLogoSourceUrl = null,
}: LogoUploaderLabWorkspaceProps) {
  const interactive = mode === "edit";

  const palette = useMemo(() => themeColoursFromAccountBrandingTheme(data.theme), [data.theme]);
  const templateModeSlug = useMemo(
    () => templateModeSlugFromFixture(data.template_option),
    [data.template_option],
  );

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoCropMeta, setLogoCropMeta] = useState<ImageUploaderCropCompletePayload["meta"] | null>(
    null,
  );
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(() =>
    seedUploadedPreview ? LAB_LOGO_UPLOADER_SEED_UPLOADED_PREVIEW_URL : null,
  );
  const [lastSessionSource, setLastSessionSource] = useState<
    ImageUploaderCropSessionSource | undefined
  >(undefined);

  const savedLogoUrl = data.onboardingLogo?.url ?? null;
  const effectiveLogoSrc = logoPreviewUrl ?? savedLogoUrl ?? null;
  const noSavedLogo = savedLogoUrl === null;

  const showNewLogo =
    logoPreviewUrl !== null &&
    (logoFile !== null || savedLogoUrl === null || logoPreviewUrl !== savedLogoUrl);

  const hasNewLogoToSave = logoFile !== null || showNewLogo;

  const changeKind = useMemo(
    () =>
      deriveLogoChangeKind({
        logoFile,
        logoPreviewUrl,
        seedUploadedPreview,
        seedUrl: LAB_LOGO_UPLOADER_SEED_UPLOADED_PREVIEW_URL,
        savedLogoUrl,
        sessionSource: lastSessionSource,
        hasNewLogoToSave,
      }),
    [
      logoFile,
      logoPreviewUrl,
      seedUploadedPreview,
      savedLogoUrl,
      lastSessionSource,
      hasNewLogoToSave,
    ],
  );

  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [confirmedAt, setConfirmedAt] = useState<string | null>(null);

  useEffect(() => {
    setConfirmedAt(null);
  }, [logoPreviewUrl, logoFile]);

  function handleLogoCropComplete(payload: ImageUploaderCropCompletePayload) {
    setLogoFile(payload.file);
    setLogoCropMeta(payload.meta);
    setLogoPreviewUrl(payload.previewUrl);
    setLastSessionSource(payload.sessionSource);
  }

  function handleLogoUploaderReset() {
    setLogoFile(null);
    setLogoCropMeta(null);
    setLastSessionSource(undefined);
    setLogoPreviewUrl(seedUploadedPreview ? LAB_LOGO_UPLOADER_SEED_UPLOADED_PREVIEW_URL : null);
  }

  function handleStubConfirmSave() {
    const stamp = new Date().toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    toast.success("Route lab: save not sent", {
      description: `No upload or server update ran. (${stamp})`,
    });
    setSaveDialogOpen(false);
    setConfirmedAt(stamp);
  }

  const saveDisabled = stubSaving || !hasNewLogoToSave;

  const showRecropSourceMissingNote =
    interactive && scenarioKey === "recrop-no-source" && Boolean(savedLogoUrl);

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Logo — ${LAB_BRANDING_ORG_LABEL}`}
        description="Add or replace your organisation logo, crop it, preview how it appears on assets, then save."
      />

      <div
        className={cn("grid gap-8", "lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] lg:items-start")}
      >
        <div className="w-full min-w-0 space-y-4">
          <SectionBlock variant="inset">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
              <div className="min-w-0 space-y-2">
                <TypographyH3 className="text-xl leading-none font-semibold">
                  Organisation logo
                </TypographyH3>
                <TypographyMuted>
                  Upload and crop a single logo for generated assets and account previews.
                </TypographyMuted>
              </div>
              <div className="flex shrink-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-end sm:gap-6">
                <div className="flex flex-col gap-1 sm:items-end">
                  <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase sm:text-right">
                    Saved on account
                  </p>
                  {savedLogoUrl ? (
                    <img
                      src={savedLogoUrl}
                      alt=""
                      className="size-20 rounded-md object-contain sm:ml-auto"
                    />
                  ) : !logoPreviewUrl ? (
                    <div className="flex flex-col items-center gap-2 sm:items-end">
                      <div
                        className="border-muted-foreground/25 bg-muted/40 text-muted-foreground flex size-20 flex-col items-center justify-center rounded-lg border border-dashed text-[10px] font-medium tracking-wide uppercase"
                        aria-hidden
                      >
                        Logo
                      </div>
                      <TypographyMuted className="text-sm sm:text-right">
                        No logo added yet.
                      </TypographyMuted>
                    </div>
                  ) : (
                    <TypographyMuted className="text-sm sm:text-right">
                      Not saved yet
                    </TypographyMuted>
                  )}
                </div>
                {logoFile !== null && logoPreviewUrl !== null ? (
                  <div className="flex flex-col gap-1 sm:items-end">
                    <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase sm:text-right">
                      New image / logo
                    </p>
                    <img
                      src={logoPreviewUrl}
                      alt=""
                      className="border-border ring-primary/30 size-20 rounded-md border object-contain ring-2 sm:ml-auto"
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </SectionBlock>

          <Card className="w-full gap-0 overflow-hidden p-0">
            <CardContent className="p-0">
              {interactive ? (
                <>
                  {showRecropSourceMissingNote ? (
                    <div className="px-6 pt-6">
                      <TypographyMuted className="text-sm leading-relaxed">
                        Recropping needs a full-resolution source file. Upload a new image to
                        replace your logo, or use a scenario that includes an editable source URL.
                      </TypographyMuted>
                    </div>
                  ) : null}
                  <div className="bg-primary-950 w-full border-b border-white/15 px-6 py-5 text-white">
                    <p className="text-xl leading-none font-semibold text-white">Upload logo</p>
                    <p className="mt-2 text-sm leading-relaxed text-white/80">
                      PNG, JPEG, or WebP up to 8MB. Choose a file to crop; you can change the aspect
                      ratio in the dialog.
                    </p>
                  </div>
                  <div className="space-y-5 px-6 pt-5 pb-6">
                    <ImageUploaderCrop
                      aspect={1}
                      aspectPresets={[...SELECTABLE_LOGO_CROP_PRESETS]}
                      defaultAspectPresetIndex={0}
                      hideAspectPresetOnUploader
                      label=""
                      maxFileSizeMb={8}
                      editableSourceUrl={editableLogoSourceUrl ?? null}
                      {...(validationScenario
                        ? {
                            minSourceWidth: 500,
                            minSourceHeight: 500,
                            minOutputWidth: 400,
                            minOutputHeight: 400,
                            showValidationHints: true,
                          }
                        : {})}
                      onComplete={handleLogoCropComplete}
                      onReset={handleLogoUploaderReset}
                    />
                  </div>
                </>
              ) : noSavedLogo ? (
                <div className="px-6 py-6">
                  <TypographyMuted className="text-sm">
                    No logo has been added for this organisation yet. Switch to edit mode to add
                    one.
                  </TypographyMuted>
                </div>
              ) : (
                <div className="px-6 py-6">
                  <TypographyMuted className="text-sm">
                    View mode — switch to edit to upload or crop.
                  </TypographyMuted>
                </div>
              )}
            </CardContent>
            {interactive ? (
              <CardFooter className="flex flex-col gap-3 border-t px-6 pt-6 pb-6">
                <Button
                  type="button"
                  className="w-full sm:ml-auto sm:w-auto sm:self-end"
                  disabled={saveDisabled}
                  onClick={() => setSaveDialogOpen(true)}
                >
                  {stubSaving ? "Saving…" : "Save logo"}
                </Button>
                {confirmedAt ? (
                  <PersistentFieldFeedback variant="success">
                    Confirmed at {confirmedAt}. Route lab — save not sent to the server.
                  </PersistentFieldFeedback>
                ) : null}
              </CardFooter>
            ) : null}
          </Card>
        </div>

        <div className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-6">
          <FixturaAssetColorPreview
            primaryHex={palette.primary}
            secondaryHex={palette.secondary}
            logoSrc={effectiveLogoSrc}
            templateModeSlug={templateModeSlug}
            previewNote="Fixture branding colours for this lab only. Preview is illustrative and may vary by template."
          />
        </div>
      </div>

      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent className="max-h-[min(90vh,800px)] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Save logo?</DialogTitle>
            <DialogDescription>
              Confirm the logo you want to keep. In Route Lab no file is uploaded and no server save
              runs.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border-border space-y-2 rounded-lg border p-3">
              <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                Logo
              </p>
              {logoCropMeta && logoFile ? (
                <ul className="text-foreground space-y-1 font-mono text-xs">
                  <li>Change type: {changeKindLabel(changeKind)}</li>
                  <li>File: {logoCropMeta.fileName}</li>
                  <li>MIME: {logoCropMeta.mimeType}</li>
                  <li>Size: {formatBytes(logoCropMeta.byteSize)}</li>
                  <li>
                    Output: {logoCropMeta.width}×{logoCropMeta.height}px
                  </li>
                  <li>
                    Aspect:{" "}
                    {logoCropMeta.aspectLabel ??
                      `${logoCropMeta.aspectRatio.toFixed(4)}`.replace(/\.?0+$/, "")}
                  </li>
                </ul>
              ) : logoPreviewUrl && seedUploadedPreview && !logoFile ? (
                <TypographyMuted className="text-sm">
                  {changeKindLabel("seeded")} ({LAB_LOGO_UPLOADER_SEED_UPLOADED_PREVIEW_URL}) — no
                  cropped file in memory.
                </TypographyMuted>
              ) : logoPreviewUrl && !logoFile ? (
                <TypographyMuted className="text-sm">
                  Preview active without a new cropped file on disk.
                </TypographyMuted>
              ) : (
                <TypographyMuted className="text-sm">No new cropped file selected.</TypographyMuted>
              )}
            </div>

            <p className="text-muted-foreground text-xs leading-relaxed">
              Route Lab only — connect your upload and branding save endpoints when shipping to
              production.
            </p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" disabled={saveDisabled} onClick={() => handleStubConfirmSave()}>
              Confirm (stub)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
