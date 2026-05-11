"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { PersistentFieldFeedback } from "@/components/brand-color";
import {
  ImageUploaderCrop,
  type ImageUploaderCropCompletePayload,
  type ImageUploaderCropSessionSource,
} from "@/components/media/image-uploader-crop";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  LOGO_MIN_OUTPUT_HEIGHT_PX,
  LOGO_MIN_OUTPUT_WIDTH_PX,
  LOGO_MIN_SOURCE_HEIGHT_PX,
  LOGO_MIN_SOURCE_WIDTH_PX,
} from "@/features/branding/components/brand-logo-workspace/logo-save-validation";
import { SELECTABLE_LOGO_CROP_PRESETS } from "@/lib/media/selectable-logo-crop-presets";

import type { ManageSponsorsWorkspaceSponsor } from "../../_types/manage-sponsors";

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

function changeKindLabel(kind: "none" | "first-upload" | "replacement" | "recrop"): string {
  switch (kind) {
    case "first-upload":
      return "First upload";
    case "replacement":
      return "Replacement";
    case "recrop":
      return "Recrop";
    default:
      return "-";
  }
}

function deriveLogoChangeKind(params: {
  logoFile: File | null;
  savedLogoUrl: string | null;
  sessionSource: ImageUploaderCropSessionSource | undefined;
}): "none" | "first-upload" | "replacement" | "recrop" {
  const { logoFile, savedLogoUrl, sessionSource } = params;
  if (!logoFile) return "none";
  if (sessionSource === "editableUrl" || sessionSource === "recrop") return "recrop";
  return savedLogoUrl === null ? "first-upload" : "replacement";
}

export function SponsorEditorSheet({
  sponsor,
  onSaveSponsor,
  mode = "edit",
}: {
  sponsor: ManageSponsorsWorkspaceSponsor | null;
  onSaveSponsor: (params: {
    sponsorId: number | string;
    name: string;
    tagline: string | null;
    description: string | null;
    url: string | null;
    isActive: boolean;
    logoFile: File | null;
    clearLogo: boolean;
  }) => void;
  mode?: "edit" | "create";
}) {
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoCropMeta, setLogoCropMeta] = useState<ImageUploaderCropCompletePayload["meta"] | null>(
    null,
  );
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const [clearLogo, setClearLogo] = useState(false);
  const [lastSessionSource, setLastSessionSource] = useState<ImageUploaderCropSessionSource>();
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [confirmedAt, setConfirmedAt] = useState<string | null>(null);

  useEffect(() => {
    setConfirmedAt(null);
  }, [sponsor?.id]);

  useEffect(() => {
    if (!sponsor) {
      setName("");
      setTagline("");
      setDescription("");
      setUrl("");
      setIsActive(false);
      setLogoFile(null);
      setLogoCropMeta(null);
      setLogoPreviewUrl(null);
      setClearLogo(false);
      setLastSessionSource(undefined);
      return;
    }

    setName(sponsor.name);
    setTagline(sponsor.tagline ?? "");
    setDescription(sponsor.description ?? "");
    setUrl(sponsor.url ?? "");
    setIsActive(sponsor.isActive);
    setLogoFile(null);
    setLogoCropMeta(null);
    setLogoPreviewUrl(null);
    setClearLogo(false);
    setLastSessionSource(undefined);
  }, [sponsor]);

  const savedLogoUrl = sponsor?.logoUrl ?? null;
  const isCreateMode = mode === "create";

  const logoChangeKind = useMemo(
    () =>
      deriveLogoChangeKind({
        logoFile,
        savedLogoUrl,
        sessionSource: lastSessionSource,
      }),
    [lastSessionSource, logoFile, savedLogoUrl],
  );

  const isDirty =
    sponsor != null &&
    (name !== sponsor.name ||
      tagline !== (sponsor.tagline ?? "") ||
      description !== (sponsor.description ?? "") ||
      url !== (sponsor.url ?? "") ||
      isActive !== sponsor.isActive ||
      logoFile !== null ||
      clearLogo);

  function handleLogoCropComplete(payload: ImageUploaderCropCompletePayload) {
    const nextPreviewUrl = URL.createObjectURL(payload.file);
    if (logoPreviewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(logoPreviewUrl);
    }
    setLogoFile(payload.file);
    setLogoCropMeta(payload.meta);
    setLogoPreviewUrl(nextPreviewUrl);
    setClearLogo(false);
    setLastSessionSource(payload.sessionSource);
  }

  function handleLogoReset() {
    if (logoPreviewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(logoPreviewUrl);
    }
    setLogoFile(null);
    setLogoCropMeta(null);
    setLogoPreviewUrl(null);
    setLastSessionSource(undefined);
  }

  function validateBeforeSave(): string | null {
    if (!sponsor) return "No sponsor selected.";
    if (!name.trim()) return "Sponsor name is required.";

    const resultingHasLogo = clearLogo ? false : Boolean(logoFile || savedLogoUrl);
    if (isActive && !resultingHasLogo) {
      return "A logo is required before a sponsor can be marked active.";
    }

    if (url.trim().length > 0) {
      try {
        new URL(url.trim());
      } catch {
        return "Enter a valid URL including http:// or https://.";
      }
    }

    return null;
  }

  function handleOpenSave() {
    const error = validateBeforeSave();
    if (error) {
      toast.error(error);
      return;
    }
    setSaveDialogOpen(true);
  }

  function handleConfirmSave() {
    if (!sponsor) return;

    onSaveSponsor({
      sponsorId: sponsor.id,
      name,
      tagline: tagline.trim() || null,
      description: description.trim() || null,
      url: url.trim() || null,
      isActive,
      logoFile,
      clearLogo,
    });

    setSaveDialogOpen(false);
    setLogoFile(null);
    setLogoCropMeta(null);
    setLastSessionSource(undefined);
    setClearLogo(false);
    if (logoPreviewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(logoPreviewUrl);
    }
    setLogoPreviewUrl(null);
    const stamp = new Date().toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    setConfirmedAt(stamp);
    toast.success("Sponsor saved", {
      description: isCreateMode
        ? "New sponsor was saved locally."
        : sponsor.isDraft
          ? "Draft sponsor changes were saved locally."
          : "Sponsor changes were saved locally in the workspace.",
    });
  }

  useEffect(() => {
    return () => {
      if (logoPreviewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(logoPreviewUrl);
      }
    };
  }, [logoPreviewUrl]);

  return (
    <div className="grid gap-6">
      <div>
        {sponsor ? (
          <div className="grid gap-6">
            <section className="grid gap-4">
              <div className="overflow-hidden rounded-xl border">
                <div className="bg-primary-950 border-b border-white/15 px-6 py-5 text-white">
                  <p className="text-xl leading-none font-semibold text-white">Sponsor logo</p>
                  <p className="mt-2 text-sm leading-relaxed text-white/80">
                    Upload and crop a square sponsor logo so it displays cleanly across your account
                    experience.
                  </p>
                </div>
                <div className="grid gap-6 px-6 py-6 lg:grid-cols-12">
                  <div className="grid gap-6 lg:col-span-7">
                    <ImageUploaderCrop
                      aspect={1}
                      aspectPresets={[...SELECTABLE_LOGO_CROP_PRESETS]}
                      defaultAspectPresetIndex={0}
                      hideAspectPresetOnUploader
                      label=""
                      maxFileSizeMb={8}
                      editableSourceUrl={!clearLogo ? savedLogoUrl : null}
                      minSourceWidth={LOGO_MIN_SOURCE_WIDTH_PX}
                      minSourceHeight={LOGO_MIN_SOURCE_HEIGHT_PX}
                      minOutputWidth={LOGO_MIN_OUTPUT_WIDTH_PX}
                      minOutputHeight={LOGO_MIN_OUTPUT_HEIGHT_PX}
                      onComplete={handleLogoCropComplete}
                      onReset={handleLogoReset}
                    />

                    {logoChangeKind === "replacement" ? (
                      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                        <Badge variant="outline">{changeKindLabel(logoChangeKind)}</Badge>
                      </div>
                    ) : null}

                    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                      PNG, JPEG, or WebP up to 8MB. Source image must be at least 500x500px and
                      cropped output must be at least 400x400px.
                    </div>
                  </div>

                  <div className="grid content-start gap-4 lg:col-span-5">
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="sponsor-name">Sponsor name</Label>
                        <Input
                          id="sponsor-name"
                          value={name}
                          onChange={(event) => setName(event.target.value)}
                          placeholder="Sponsor name"
                        />
                      </div>
                      <label className="flex items-center gap-3 rounded-xl border px-4 py-3 text-sm">
                        <input
                          type="checkbox"
                          className="accent-[var(--primary)]"
                          checked={isActive}
                          onChange={(event) => setIsActive(event.target.checked)}
                        />
                        <span>Mark sponsor active</span>
                      </label>
                      <div className="flex flex-wrap items-center gap-2">
                        {sponsor.isDraft ? <Badge variant="secondary">Draft sponsor</Badge> : null}
                        {isActive ? (
                          <Badge variant="secondary">Active</Badge>
                        ) : (
                          <Badge variant="outline">Inactive</Badge>
                        )}
                        <Badge variant="outline">{sponsor.placementLabel}</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">
            {isCreateMode
              ? "Add sponsor details and logo to create a new sponsor."
              : "Select a sponsor from the pool to inspect it."}
          </p>
        )}
      </div>
      {sponsor ? (
        <div className="flex flex-col gap-3 border-t pt-6">
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
            {!isCreateMode ? (
              <Button type="button" variant="secondary" disabled>
                Archive sponsor
              </Button>
            ) : null}
            <Button type="button" disabled={!isDirty} onClick={handleOpenSave}>
              Save sponsor
            </Button>
          </div>
          {confirmedAt ? (
            <PersistentFieldFeedback variant="success">
              Sponsor saved locally at {confirmedAt}.
            </PersistentFieldFeedback>
          ) : null}
        </div>
      ) : null}

      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent className="max-h-[min(90vh,800px)] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Save sponsor?</DialogTitle>
            <DialogDescription>
              {isCreateMode
                ? "This saves the new sponsor into the local workspace so it can appear in the overview and assignment flows."
                : "This saves your sponsor edits into the workspace state so the pool, preview, and assignment shell all update together."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border-border space-y-2 rounded-lg border p-3">
              <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                Sponsor details
              </p>
              <ul className="text-foreground space-y-1 font-mono text-xs">
                <li>Name: {name.trim() || "-"}</li>
                <li>Active: {isActive ? "true" : "false"}</li>
                <li>URL: {url.trim() || "-"}</li>
              </ul>
            </div>
            <div className="border-border space-y-2 rounded-lg border p-3">
              <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                Logo
              </p>
              {logoCropMeta && logoFile ? (
                <ul className="text-foreground space-y-1 font-mono text-xs">
                  <li>Change type: {changeKindLabel(logoChangeKind)}</li>
                  <li>File: {logoCropMeta.fileName}</li>
                  <li>MIME: {logoCropMeta.mimeType}</li>
                  <li>Size: {formatBytes(logoCropMeta.byteSize)}</li>
                  <li>
                    Output: {logoCropMeta.width}x{logoCropMeta.height}px
                  </li>
                  <li>
                    Aspect:{" "}
                    {logoCropMeta.aspectLabel ??
                      `${logoCropMeta.aspectRatio.toFixed(4)}`.replace(/\.?0+$/, "")}
                  </li>
                </ul>
              ) : clearLogo ? (
                <p className="text-sm">Logo will be removed on save.</p>
              ) : (
                <p className="text-sm">No logo change in this save.</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleConfirmSave}>
              Save sponsor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
