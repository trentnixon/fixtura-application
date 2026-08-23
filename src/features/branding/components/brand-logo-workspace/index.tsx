"use client";

import { ImageUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { FixturaAssetColorPreview, PersistentFieldFeedback } from "@/components/brand-color";
import { MetricComparisonCard } from "@/components/cards";
import {
  ImageUploaderCrop,
  type ImageUploaderCropCompletePayload,
  type ImageUploaderCropSessionSource,
} from "@/components/media/image-uploader-crop";
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
import { captureUserAction } from "@/lib/analytics";
import { useUpdateOnboardingStep2 } from "@/lib/api/hooks/account/useUpdateOnboardingStep2";
import { themeColoursFromAccountBrandingTheme } from "@/lib/branding/theme-colours-from-account";
import { SELECTABLE_LOGO_CROP_PRESETS } from "@/lib/media/selectable-logo-crop-presets";
import { SUPPORT_READ_ONLY_FORM_DESCRIPTION } from "@/lib/support/support-read-only-copy";
import { cn } from "@/lib/utils";

import {
  LOGO_MIN_OUTPUT_HEIGHT_PX,
  LOGO_MIN_OUTPUT_WIDTH_PX,
  LOGO_MIN_SOURCE_HEIGHT_PX,
  LOGO_MIN_SOURCE_WIDTH_PX,
} from "./logo-save-validation";
import { onboardingStep2LogoErrorMessage } from "./onboarding-step2-logo-error-message";
import {
  BRANDING_CONTAINER_HEADER_CLASS_NAME,
  BrandingContainerHeaderTitle,
} from "../branding-container-header-title";

import type { AccountBrandingData } from "@/types/api/account";

export type BrandLogoWorkspaceProps = {
  accountId: string;
  data: AccountBrandingData;
  readOnly?: boolean;
};

export type LogoChangeKind = "none" | "first-upload" | "replacement" | "recrop";

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

function templateModeSlugFromData(option: AccountBrandingData["template_option"]): string | null {
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
    default:
      return "—";
  }
}

function deriveLogoChangeKind(params: {
  logoFile: File | null;
  savedLogoUrl: string | null;
  sessionSource: ImageUploaderCropSessionSource | undefined;
  hasNewLogoToSave: boolean;
}): LogoChangeKind {
  const { logoFile, savedLogoUrl, sessionSource, hasNewLogoToSave } = params;

  if (!hasNewLogoToSave || !logoFile) return "none";

  if (sessionSource === "editableUrl" || sessionSource === "recrop") return "recrop";
  if (sessionSource === "dropzone" || sessionSource === undefined) {
    return savedLogoUrl === null ? "first-upload" : "replacement";
  }
  return savedLogoUrl === null ? "first-upload" : "replacement";
}

export function BrandLogoWorkspace({ accountId, data, readOnly = false }: BrandLogoWorkspaceProps) {
  const updateStep2 = useUpdateOnboardingStep2(accountId);

  const palette = useMemo(() => themeColoursFromAccountBrandingTheme(data.theme), [data.theme]);
  const templateModeSlug = useMemo(
    () => templateModeSlugFromData(data.template_option),
    [data.template_option],
  );

  const editableSourceUrl = data.onboardingLogo?.url ?? null;

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoCropMeta, setLogoCropMeta] = useState<ImageUploaderCropCompletePayload["meta"] | null>(
    null,
  );
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
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
        savedLogoUrl,
        sessionSource: lastSessionSource,
        hasNewLogoToSave,
      }),
    [logoFile, savedLogoUrl, lastSessionSource, hasNewLogoToSave],
  );

  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
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
    setLogoPreviewUrl(null);
  }

  async function handleConfirmSave() {
    if (!logoFile) {
      toast.error("No logo file to save", {
        description: "Complete the crop step before saving.",
      });
      return;
    }

    try {
      await updateStep2.mutateAsync({ file: logoFile, body: {} });
      captureUserAction("brand_logo_updated", { accountId, action: "upload" });
      const stamp = new Date().toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      setSaveDialogOpen(false);
      setLogoFile(null);
      setLogoCropMeta(null);
      setLastSessionSource(undefined);
      setLogoPreviewUrl(null);
      setConfirmedAt(stamp);
      toast.success("Logo saved", {
        description: "Your organisation logo was updated.",
      });
    } catch (e) {
      toast.error("Could not save logo", {
        description: onboardingStep2LogoErrorMessage(e),
      });
    }
  }

  async function handleConfirmClear() {
    try {
      await updateStep2.mutateAsync({ body: { logoMediaId: null } });
      captureUserAction("brand_logo_updated", { accountId, action: "clear" });
      setClearDialogOpen(false);
      setConfirmedAt(null);
      handleLogoUploaderReset();
      toast.success("Logo removed", {
        description: "Your organisation logo was cleared.",
      });
    } catch (e) {
      toast.error("Could not remove logo", {
        description: onboardingStep2LogoErrorMessage(e),
      });
    }
  }

  const saveDisabled = updateStep2.isPending || !logoFile;
  const canOfferClear = Boolean(savedLogoUrl) && !logoFile;

  return (
    <div className="space-y-8">
      {readOnly ? (
        <div
          role="status"
          className="border-border bg-muted/40 text-muted-foreground rounded-lg border px-4 py-3 text-sm"
        >
          {SUPPORT_READ_ONLY_FORM_DESCRIPTION}
        </div>
      ) : null}

      <PageHeader
        title="Brand logo"
        description={
          readOnly
            ? "Organisation logo as saved for this account (read-only in support view)."
            : "Add or replace your organisation logo, crop it, preview how it appears on assets, then save."
        }
      />

      <div
        className={cn("grid gap-8", "lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] lg:items-start")}
      >
        <div className="w-full min-w-0">
          <MetricComparisonCard
            className="ring-border w-full min-w-0 rounded-2xl border-none shadow-xl ring-1"
            layout="card"
            headerClassName={BRANDING_CONTAINER_HEADER_CLASS_NAME}
            titleRowClassName="items-start"
            title={
              <BrandingContainerHeaderTitle
                icon={<ImageUp className="size-5" aria-hidden />}
                title="1. Upload logo"
                description="Add or replace your organisation logo, then crop it for generated assets."
              />
            }
            body={
              <div className="space-y-5">
                {readOnly ? (
                  effectiveLogoSrc ? (
                    <div className="border-border bg-muted/30 flex justify-center rounded-lg border p-6">
                      <img
                        src={effectiveLogoSrc}
                        alt="Organisation logo"
                        className="max-h-48 max-w-full object-contain"
                      />
                    </div>
                  ) : (
                    <TypographyMuted className="text-sm">
                      No logo uploaded for this account.
                    </TypographyMuted>
                  )
                ) : (
                  <>
                    <div className="space-y-3">
                      <p className="text-sm leading-relaxed">
                        PNG, JPEG, or WebP up to 8MB. Choose a file to crop; you can change the
                        aspect ratio in the dialog.
                      </p>
                    </div>
                    <ImageUploaderCrop
                      aspect={1}
                      aspectPresets={[...SELECTABLE_LOGO_CROP_PRESETS]}
                      defaultAspectPresetIndex={0}
                      hideAspectPresetOnUploader
                      label=""
                      maxFileSizeMb={8}
                      editableSourceUrl={editableSourceUrl}
                      minSourceWidth={LOGO_MIN_SOURCE_WIDTH_PX}
                      minSourceHeight={LOGO_MIN_SOURCE_HEIGHT_PX}
                      minOutputWidth={LOGO_MIN_OUTPUT_WIDTH_PX}
                      minOutputHeight={LOGO_MIN_OUTPUT_HEIGHT_PX}
                      showValidationHints
                      onComplete={handleLogoCropComplete}
                      onReset={handleLogoUploaderReset}
                    />
                  </>
                )}
              </div>
            }
            footer={
              readOnly ? null : (
                <div className="flex w-full min-w-0 flex-col gap-3">
                  <div className="flex w-full flex-col gap-2 sm:ml-auto sm:w-fit sm:flex-row sm:items-center sm:gap-2">
                    {canOfferClear ? (
                      <Button
                        type="button"
                        variant="destructive"
                        className="w-full shrink-0 sm:w-auto"
                        disabled={updateStep2.isPending}
                        onClick={() => setClearDialogOpen(true)}
                      >
                        Remove logo
                      </Button>
                    ) : null}
                    <Button
                      type="button"
                      variant="brand"
                      className="w-full shrink-0 sm:w-auto"
                      disabled={saveDisabled}
                      onClick={() => setSaveDialogOpen(true)}
                    >
                      {updateStep2.isPending ? "Saving…" : "Save logo"}
                    </Button>
                  </div>
                  {confirmedAt ? (
                    <PersistentFieldFeedback variant="success">
                      Saved at {confirmedAt}.
                    </PersistentFieldFeedback>
                  ) : null}
                </div>
              )
            }
          />
        </div>

        <div className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-6">
          <FixturaAssetColorPreview
            primaryHex={palette.primary}
            secondaryHex={palette.secondary}
            logoSrc={effectiveLogoSrc}
            templateModeSlug={templateModeSlug}
            previewNote={
              noSavedLogo && !logoPreviewUrl ? (
                <p className="text-sm leading-relaxed">
                  Colours and template mode come from your branding settings. Add a logo to see it
                  in the asset preview.
                </p>
              ) : undefined
            }
          />
        </div>
      </div>

      {!readOnly ? (
        <>
          <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
            <DialogContent className="max-h-[min(90vh,800px)] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Save logo?</DialogTitle>
                <DialogDescription>
                  This uploads your cropped image and sets it as the logo for your organisation.
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
                  ) : (
                    <TypographyMuted className="text-sm">No cropped file selected.</TypographyMuted>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="brandOutline"
                  onClick={() => setSaveDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="brand"
                  disabled={saveDisabled}
                  onClick={() => void handleConfirmSave()}
                >
                  Save logo
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Remove logo?</DialogTitle>
                <DialogDescription>
                  Your organisation will have no logo until you upload a new one. Generated assets
                  and previews may show a placeholder.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  type="button"
                  variant="brandOutline"
                  onClick={() => setClearDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={updateStep2.isPending}
                  onClick={() => void handleConfirmClear()}
                >
                  {updateStep2.isPending ? "Removing…" : "Remove logo"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      ) : null}
    </div>
  );
}
