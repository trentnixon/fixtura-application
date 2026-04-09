"use client";

import { Info } from "lucide-react";
import Link from "next/link";
import { useCallback, useState } from "react";

import {
  ImageUploaderCrop,
  type ImageFileInspectionMeta,
  type ImageUploaderCropCompletePayload,
} from "@/components/media/image-uploader-crop";
import { TypographyH1, TypographyH2, TypographyMuted } from "@/components/typography";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api/client/api-error";
import { accountApi } from "@/lib/api/services/account.api";
import { ROUTES } from "@/lib/config/routes";
import { SELECTABLE_LOGO_CROP_PRESETS } from "@/lib/media/selectable-logo-crop-presets";
import { cn } from "@/lib/utils";

import type { ReactNode } from "react";

/**
 * Variant B — Tinted surface, info/primary (blue) tint. Aligns with
 * `FeedbackCardTinted` + `kind="info"` in `@/components/ui/feedback-card`.
 */
function DebugOutputTintedCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <Card
      className={cn(
        "gap-0 overflow-hidden py-0 shadow-sm",
        "border-primary/15 bg-primary/6 border",
      )}
    >
      <div className="border-primary/10 flex gap-3 border-b px-4 py-3 sm:px-6">
        <div
          className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-lg"
          aria-hidden
        >
          <Info className="size-5" />
        </div>
        <div className="min-w-0 space-y-0.5">
          <p className="text-foreground text-sm leading-snug font-semibold">{title}</p>
          {subtitle ? <p className="text-muted-foreground text-xs">{subtitle}</p> : null}
        </div>
      </div>
      <div className="text-foreground space-y-2 px-4 py-4 font-mono text-xs sm:px-6">
        {children}
      </div>
    </Card>
  );
}

export default function InteractionLabImageCropPage() {
  const [lastCrop, setLastCrop] = useState<{
    source: string;
    payload: ImageUploaderCropCompletePayload;
  } | null>(null);

  const [lastPreCrop, setLastPreCrop] = useState<{
    source: string;
    meta: ImageFileInspectionMeta;
  } | null>(null);

  const handleComplete = useCallback((source: string) => {
    return (payload: ImageUploaderCropCompletePayload) => {
      setLastCrop({ source, payload });
    };
  }, []);

  const handlePreCropValidated = useCallback((source: string) => {
    return (meta: ImageFileInspectionMeta) => {
      setLastPreCrop({ source, meta });
    };
  }, []);

  const [accountId, setAccountId] = useState("");
  const [strapiLoading, setStrapiLoading] = useState(false);
  const [strapiResult, setStrapiResult] = useState<string | null>(null);
  const [strapiError, setStrapiError] = useState<string | null>(null);

  const handleStrapiUpload = async () => {
    setStrapiResult(null);
    setStrapiError(null);
    const id = accountId.trim();
    if (!id) {
      setStrapiError("Enter an account ID.");
      return;
    }
    if (!lastCrop?.payload.file) {
      setStrapiError("Crop an image in a section above first.");
      return;
    }
    setStrapiLoading(true);
    try {
      const res = await accountApi.uploadOnboardingStep2Logo(id, lastCrop.payload.file);
      setStrapiResult(`Media id: ${res.data.id}`);
    } catch (e) {
      if (e instanceof ApiError) {
        setStrapiError(`${e.status} — ${e.message}`);
      } else {
        setStrapiError(e instanceof Error ? e.message : "Upload failed.");
      }
    } finally {
      setStrapiLoading(false);
    }
  };

  return (
    <article className="space-y-10">
      <header className="space-y-2">
        <TypographyMuted className="text-xs font-medium tracking-wide uppercase">
          Development only · internal lab
        </TypographyMuted>
        <TypographyH1 className="text-2xl font-semibold tracking-tight">
          Image upload and crop
        </TypographyH1>
        <TypographyMuted className="max-w-3xl leading-relaxed">
          Pre-production testing for validation, aspect-locked cropping, and client-side output.
          Pre-crop rules run before the dialog; post-crop rules run on the exported pixels. Session
          auth is required for the optional Strapi upload (M1).
        </TypographyMuted>
      </header>

      <section className="space-y-3">
        <Card className="w-full max-w-3xl overflow-hidden py-0">
          <div className="from-primary via-brand-secondary to-brand-accent h-2 w-full bg-linear-to-r" />
          <CardHeader className="space-y-1 pb-2">
            <CardTitle className="text-lg">Choose crop ratio</CardTitle>
            <CardDescription className="text-pretty">
              After you choose a file, pick an aspect in the crop dialog — presets: 1:1, 4:5, 5:4,
              9:16, 16:9.{" "}
              <Link
                href={`${ROUTES.kitchenSink}/cards`}
                className="text-foreground/80 underline-offset-4 hover:underline"
              >
                Card patterns reference
              </Link>
              .
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0 pb-4">
            <ImageUploaderCrop
              aspect={1}
              aspectPresets={[...SELECTABLE_LOGO_CROP_PRESETS]}
              defaultAspectPresetIndex={0}
              hideAspectPresetOnUploader
              label=""
              helperText="One image — open crop, then switch ratio in the dialog if needed."
              maxFileSizeMb={8}
              onComplete={handleComplete("Selectable ratio")}
              onPreCropValidated={handlePreCropValidated("Selectable ratio")}
            />
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Square logo (1:1)</CardTitle>
            <CardDescription>Sponsor mark, club logo, avatar</CardDescription>
          </CardHeader>
          <CardContent>
            <ImageUploaderCrop
              aspect={1}
              aspectLabel="1:1"
              label="Upload"
              helperText="Source at least 500×500px; file up to 3MB."
              maxFileSizeMb={3}
              minSourceWidth={500}
              minSourceHeight={500}
              showValidationHints
              onComplete={handleComplete("Square logo")}
              onPreCropValidated={handlePreCropValidated("Square logo")}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Landscape cover (16:9)</CardTitle>
            <CardDescription>Banner, hero, media cover</CardDescription>
          </CardHeader>
          <CardContent>
            <ImageUploaderCrop
              aspect={16 / 9}
              aspectLabel="16:9"
              label="Upload"
              helperText="Source at least 1200×675px; file up to 5MB."
              maxFileSizeMb={5}
              minSourceWidth={1200}
              minSourceHeight={675}
              outputFormat="image/jpeg"
              showValidationHints
              onComplete={handleComplete("Landscape cover")}
              onPreCropValidated={handlePreCropValidated("Landscape cover")}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Portrait (4:5)</CardTitle>
            <CardDescription>Player image, profile art</CardDescription>
          </CardHeader>
          <CardContent>
            <ImageUploaderCrop
              aspect={4 / 5}
              aspectLabel="4:5"
              label="Upload"
              helperText="Source at least 800×1000px; file up to 5MB."
              maxFileSizeMb={5}
              minSourceWidth={800}
              minSourceHeight={1000}
              showValidationHints
              onComplete={handleComplete("Portrait 4:5")}
              onPreCropValidated={handlePreCropValidated("Portrait 4:5")}
            />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Validation stress test</CardTitle>
            <CardDescription>
              Tight source limits — try a small image (pre-crop error) or crop very small (post-crop
              error).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ImageUploaderCrop
              aspect={1}
              aspectLabel="1:1"
              label="Upload"
              helperText="Requires source ≥1200×1200px, max 1MB file; output must be ≥400×400px."
              maxFileSizeMb={1}
              minSourceWidth={1200}
              minSourceHeight={1200}
              minOutputWidth={400}
              minOutputHeight={400}
              showValidationHints
              onComplete={handleComplete("Stress test")}
              onPreCropValidated={handlePreCropValidated("Stress test")}
            />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-3">
        <TypographyH2 className="text-lg font-semibold">Debug / output</TypographyH2>
        <TypographyMuted className="text-sm">
          Last pre-crop inspection and last completed crop update when you upload. The Strapi test
          uses the last successful crop.
        </TypographyMuted>
        {lastPreCrop ? (
          <DebugOutputTintedCard
            title="Last pre-crop pass"
            subtitle="Client validation metadata after file decode"
          >
            <p>
              <span className="text-muted-foreground">Source:</span> {lastPreCrop.source}
            </p>
            <p>
              <span className="text-muted-foreground">File:</span> {lastPreCrop.meta.fileName}
            </p>
            <p>
              <span className="text-muted-foreground">MIME:</span> {lastPreCrop.meta.mimeType}
            </p>
            <p>
              <span className="text-muted-foreground">Size:</span>{" "}
              {lastPreCrop.meta.fileSize.toLocaleString()} bytes
            </p>
            <p>
              <span className="text-muted-foreground">Source dimensions:</span>{" "}
              {lastPreCrop.meta.width}×{lastPreCrop.meta.height}px
            </p>
          </DebugOutputTintedCard>
        ) : (
          <p className="text-muted-foreground text-sm">No pre-crop validation pass recorded yet.</p>
        )}

        {lastCrop ? (
          <DebugOutputTintedCard
            title="Last cropped output"
            subtitle="Exported bitmap and crop rectangle"
          >
            <p>
              <span className="text-muted-foreground">Source:</span> {lastCrop.source}
            </p>
            <p>
              <span className="text-muted-foreground">File:</span> {lastCrop.payload.meta.fileName}
            </p>
            <p>
              <span className="text-muted-foreground">MIME:</span> {lastCrop.payload.meta.mimeType}
            </p>
            <p>
              <span className="text-muted-foreground">Size:</span>{" "}
              {lastCrop.payload.meta.byteSize.toLocaleString()} bytes
            </p>
            <p>
              <span className="text-muted-foreground">Output dimensions:</span>{" "}
              {lastCrop.payload.meta.width}×{lastCrop.payload.meta.height}px
            </p>
            <p>
              <span className="text-muted-foreground">Aspect:</span>{" "}
              {lastCrop.payload.meta.aspectLabel ?? lastCrop.payload.meta.aspectRatio}
            </p>
            <p>
              <span className="text-muted-foreground">Crop (px):</span> x=
              {Math.round(lastCrop.payload.meta.cropAreaPixels.x)} y=
              {Math.round(lastCrop.payload.meta.cropAreaPixels.y)} w=
              {Math.round(lastCrop.payload.meta.cropAreaPixels.width)} h=
              {Math.round(lastCrop.payload.meta.cropAreaPixels.height)}
            </p>
          </DebugOutputTintedCard>
        ) : (
          <p className="text-muted-foreground text-sm">No crop completed yet.</p>
        )}
      </section>

      <section className="space-y-4 rounded-xl border border-dashed p-6">
        <div className="space-y-1">
          <TypographyH2 className="text-lg font-semibold">Strapi smoke test (M1)</TypographyH2>
          <TypographyMuted className="text-sm leading-relaxed">
            Uploads the <strong className="text-foreground font-medium">last cropped file</strong>{" "}
            via{" "}
            <code className="bg-muted rounded px-1 py-0.5 text-xs">
              POST /api/accounts/:accountId/onboarding/step-2/upload
            </code>{" "}
            (onboarding Step 2 logo). You must be signed in; paste an account you own. This is not a
            generic media-library API — it validates BFF + multipart + JWT with a real cropped{" "}
            <code className="bg-muted rounded px-1 py-0.5 text-xs">File</code>.
          </TypographyMuted>
        </div>
        <div className="flex max-w-md flex-col gap-3">
          <div className="space-y-2">
            <Label htmlFor="strapi-account-id">Account ID</Label>
            <Input
              id="strapi-account-id"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              placeholder="e.g. numeric or slug from your account URL"
              autoComplete="off"
            />
          </div>
          <Button
            type="button"
            onClick={handleStrapiUpload}
            disabled={strapiLoading}
            variant="secondary"
          >
            {strapiLoading ? "Uploading…" : "Upload last crop to Strapi (M1)"}
          </Button>
          {strapiResult ? (
            <p className="text-sm text-green-600 dark:text-green-400" role="status">
              {strapiResult}
            </p>
          ) : null}
          {strapiError ? (
            <p className="text-destructive text-sm" role="alert">
              {strapiError}
            </p>
          ) : null}
        </div>
      </section>
    </article>
  );
}
