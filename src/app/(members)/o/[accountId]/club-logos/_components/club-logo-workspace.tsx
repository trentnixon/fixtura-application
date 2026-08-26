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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  LOGO_MIN_OUTPUT_HEIGHT_PX,
  LOGO_MIN_OUTPUT_WIDTH_PX,
  LOGO_MIN_SOURCE_HEIGHT_PX,
  LOGO_MIN_SOURCE_WIDTH_PX,
} from "@/features/branding/components/brand-logo-workspace/logo-save-validation";
import {
  BRANDING_CONTAINER_HEADER_CLASS_NAME,
  BrandingContainerHeaderTitle,
} from "@/features/branding/components/branding-container-header-title";
import { captureUserAction } from "@/lib/analytics";
import { useUpdateClubLogo } from "@/lib/api/hooks/account/useUpdateClubLogo";
import { themeColoursFromAccountBrandingTheme } from "@/lib/branding/theme-colours-from-account";
import { SELECTABLE_LOGO_CROP_PRESETS } from "@/lib/media/selectable-logo-crop-presets";
import { cn } from "@/lib/utils";

import { CLUB_LOGOS_SCREEN_COPY } from "../_consts";
import { resolveClubLogoErrorMessage } from "../_utils/resolve-club-logo-error-message";

import type { AccountBrandingData, AccountClubLogosDirectoryClub } from "@/types/api/account";

export type ClubLogoWorkspaceProps = {
  accountId: string;
  club: AccountClubLogosDirectoryClub;
  branding: AccountBrandingData | null;
};

type LogoChangeKind = "none" | "first-upload" | "replacement" | "recrop";

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

export function ClubLogoWorkspace({ accountId, club, branding }: ClubLogoWorkspaceProps) {
  const updateClubLogo = useUpdateClubLogo(accountId, club.id);

  const palette = useMemo(
    () => themeColoursFromAccountBrandingTheme(branding?.theme ?? null),
    [branding?.theme],
  );
  const templateModeSlug = useMemo(
    () => templateModeSlugFromData(branding?.template_option ?? null),
    [branding?.template_option],
  );

  const savedLogoUrl =
    typeof club.logoUrl === "string" && club.logoUrl.trim().length > 0 ? club.logoUrl : null;
  const editableSourceUrl = savedLogoUrl;

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoCropMeta, setLogoCropMeta] = useState<ImageUploaderCropCompletePayload["meta"] | null>(
    null,
  );
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const [lastSessionSource, setLastSessionSource] = useState<
    ImageUploaderCropSessionSource | undefined
  >(undefined);

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
        description: "Finish the crop before saving.",
      });
      return;
    }

    try {
      await updateClubLogo.mutateAsync({ file: logoFile });
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
      captureUserAction("club_logo_updated", {
        accountId,
        club_id: club.id,
        change_kind: "upload",
      });
      toast.success("Club logo saved", {
        description: `${club.name} logo updated.`,
      });
    } catch (e) {
      toast.error("Could not save club logo", {
        description: resolveClubLogoErrorMessage(e),
      });
    }
  }

  async function handleConfirmClear() {
    try {
      await updateClubLogo.mutateAsync({ body: { logoMediaId: null } });
      setClearDialogOpen(false);
      setConfirmedAt(null);
      handleLogoUploaderReset();
      captureUserAction("club_logo_updated", {
        accountId,
        club_id: club.id,
        change_kind: "clear",
      });
      toast.success(CLUB_LOGOS_SCREEN_COPY.removeUploadedLogoSuccessTitle, {
        description: CLUB_LOGOS_SCREEN_COPY.removeUploadedLogoSuccessDescription,
      });
    } catch (e) {
      toast.error("Could not remove club logo", {
        description: resolveClubLogoErrorMessage(e),
      });
    }
  }

  const saveDisabled = updateClubLogo.isPending || !logoFile;
  const canOfferClear = Boolean(savedLogoUrl) && !logoFile;

  return (
    <div className="space-y-8">
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
                title="Upload logo"
                description="Crop and save a logo for this club. Association branding stays put."
              />
            }
            body={
              <div className="space-y-5">
                <div className="space-y-3">
                  <p className="text-sm leading-relaxed">
                    PNG, JPEG, or WebP up to 8MB. Pick a file to crop. You can change the aspect
                    ratio in the dialog. This saves to the club, not your association branding.
                  </p>
                </div>
                <ImageUploaderCrop
                  key={`${club.id}-${savedLogoUrl ?? "none"}`}
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
              </div>
            }
            footer={
              <div className="flex w-full min-w-0 flex-col gap-3">
                <div className="flex w-full flex-col gap-2 sm:ml-auto sm:w-fit sm:flex-row sm:items-center sm:gap-2">
                  {canOfferClear ? (
                    <Button
                      type="button"
                      variant="destructive"
                      className="w-full shrink-0 sm:w-auto"
                      disabled={updateClubLogo.isPending}
                      onClick={() => setClearDialogOpen(true)}
                    >
                      {CLUB_LOGOS_SCREEN_COPY.removeUploadedLogoAction}
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    variant="brand"
                    className="w-full shrink-0 sm:w-auto"
                    disabled={saveDisabled}
                    onClick={() => setSaveDialogOpen(true)}
                  >
                    {updateClubLogo.isPending ? "Saving…" : "Save logo"}
                  </Button>
                </div>
                {confirmedAt ? (
                  <PersistentFieldFeedback variant="success">
                    Saved at {confirmedAt}.
                  </PersistentFieldFeedback>
                ) : null}
              </div>
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
                  Colours and template mode come from association branding. Add a club logo to see
                  it in the preview.
                </p>
              ) : undefined
            }
          />
        </div>
      </div>

      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent className="max-h-[min(90vh,800px)] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Save club logo?</DialogTitle>
            <DialogDescription>
              Uploads the cropped image as the logo for {club.name}.
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
                  <li>Club: {club.name}</li>
                  <li>Club ID: {club.id}</li>
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
            <Button type="button" variant="brandOutline" onClick={() => setSaveDialogOpen(false)}>
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
            <DialogTitle>{CLUB_LOGOS_SCREEN_COPY.removeUploadedLogoDialogTitle}</DialogTitle>
            <DialogDescription>
              {CLUB_LOGOS_SCREEN_COPY.removeUploadedLogoDialogDescription}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="brandOutline" onClick={() => setClearDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={updateClubLogo.isPending}
              onClick={() => void handleConfirmClear()}
            >
              {updateClubLogo.isPending
                ? "Removing…"
                : CLUB_LOGOS_SCREEN_COPY.removeUploadedLogoAction}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
