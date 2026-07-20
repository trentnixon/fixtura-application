"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { toast } from "sonner";

import { ImageCropDialog, type ImageCropAspectPreset } from "@/components/media/image-crop-dialog";
import {
  TypographyBodySmall,
  TypographyCaption,
  TypographyFinePrint,
  TypographyHelperText,
  TypographyLabel,
} from "@/components/typography";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  blobToFile,
  extensionForFormat,
  getCroppedImageBlob,
  type OutputImageFormat,
} from "@/lib/media/get-cropped-image";
import { validateCroppedOutput } from "@/lib/media/validate-cropped-output";
import { validateImageFile } from "@/lib/media/validate-image-file";
import { cn } from "@/lib/utils";

import type { CroppedOutputValidationRules } from "@/lib/media/validate-cropped-output";
import type {
  ImageFileInspectionMeta,
  ImageFileValidationRules,
} from "@/lib/media/validate-image-file";
import type { Area } from "react-easy-crop";

export type ImageUploaderCropAspectPreset = ImageCropAspectPreset;

export type { ImageFileInspectionMeta };

function clampPresetIndex(index: number, length: number): number {
  if (length <= 0) return 0;
  return Math.min(Math.max(0, index), length - 1);
}

function getInitialPresetIndex(
  presets: ImageCropAspectPreset[] | undefined,
  defaultIdx: number | undefined,
  aspectFallback: number,
): number {
  if (!presets?.length) return 0;
  if (defaultIdx !== undefined) return clampPresetIndex(defaultIdx, presets.length);
  const match = presets.findIndex((p) => Math.abs(p.aspect - aspectFallback) < 1e-6);
  return match >= 0 ? match : 0;
}

function buildValidationHintLine(params: {
  maxMb: number;
  minFileSizeKb?: number;
  minSourceWidth?: number;
  minSourceHeight?: number;
  maxSourceWidth?: number;
  maxSourceHeight?: number;
  minOutputWidth?: number;
  minOutputHeight?: number;
  maxOutputWidth?: number;
  maxOutputHeight?: number;
}): string | null {
  const bits: string[] = [];
  bits.push(`Up to ${params.maxMb}MB`);
  if (params.minFileSizeKb !== undefined) {
    bits.push(`min file ${params.minFileSizeKb}KB`);
  }
  if (params.minSourceWidth !== undefined && params.minSourceHeight !== undefined) {
    bits.push(`source ≥ ${params.minSourceWidth}×${params.minSourceHeight}px`);
  } else {
    if (params.minSourceWidth !== undefined) bits.push(`source ≥ ${params.minSourceWidth}px wide`);
    if (params.minSourceHeight !== undefined)
      bits.push(`source ≥ ${params.minSourceHeight}px tall`);
  }
  if (params.maxSourceWidth !== undefined || params.maxSourceHeight !== undefined) {
    const mw = params.maxSourceWidth;
    const mh = params.maxSourceHeight;
    if (mw !== undefined && mh !== undefined) bits.push(`source ≤ ${mw}×${mh}px`);
    else if (mw !== undefined) bits.push(`source ≤ ${mw}px wide`);
    else if (mh !== undefined) bits.push(`source ≤ ${mh}px tall`);
  }
  if (params.minOutputWidth !== undefined && params.minOutputHeight !== undefined) {
    bits.push(`output ≥ ${params.minOutputWidth}×${params.minOutputHeight}px`);
  } else {
    if (params.minOutputWidth !== undefined) bits.push(`output ≥ ${params.minOutputWidth}px wide`);
    if (params.minOutputHeight !== undefined)
      bits.push(`output ≥ ${params.minOutputHeight}px tall`);
  }
  if (params.maxOutputWidth !== undefined || params.maxOutputHeight !== undefined) {
    const ow = params.maxOutputWidth;
    const oh = params.maxOutputHeight;
    if (ow !== undefined && oh !== undefined) bits.push(`output ≤ ${ow}×${oh}px`);
    else if (ow !== undefined) bits.push(`output ≤ ${ow}px wide`);
    else if (oh !== undefined) bits.push(`output ≤ ${oh}px tall`);
  }
  return bits.join(" · ");
}

export type ImageUploaderCropMeta = {
  fileName: string;
  mimeType: string;
  byteSize: number;
  width: number;
  height: number;
  aspectRatio: number;
  aspectLabel?: string;
  cropAreaPixels: Area;
  originalFileName: string;
};

/** How the crop session was started (for labs / analytics). */
export type ImageUploaderCropSessionSource = "dropzone" | "editableUrl" | "recrop";

export type ImageUploaderCropCompletePayload = {
  file: File;
  previewUrl: string;
  meta: ImageUploaderCropMeta;
  sessionSource?: ImageUploaderCropSessionSource;
};

export type ImageUploaderCropProps = {
  /** Width / height (used when `aspectPresets` is not set). */
  aspect: number;
  aspectLabel?: string;
  /**
   * Optional list of ratios. If two or more are provided, a crop-ratio selector appears
   * in the crop dialog; optionally also above the drop zone (see `hideAspectPresetOnUploader`).
   * The selected preset drives `aspect` / label.
   */
  aspectPresets?: ImageCropAspectPreset[];
  /** Initial index into `aspectPresets` (default: match `aspect` or 0). */
  defaultAspectPresetIndex?: number;
  /**
   * When `aspectPresets` has multiple entries, hide the ratio `Select` above the drop zone
   * and keep ratio selection only in the crop dialog. Default: false (show both).
   */
  hideAspectPresetOnUploader?: boolean;
  label?: string;
  helperText?: string;
  /** Longer requirements copy shown from `sm` and up when set. */
  helperTextDetail?: string;
  helperTextClassName?: string;
  accept?: Record<string, string[]>;
  /**
   * Max file size (MB). Prefer over `maxSizeMb` (alias).
   * @default 8
   */
  maxFileSizeMb?: number;
  /** @deprecated Use `maxFileSizeMb` — same behavior. */
  maxSizeMb?: number;
  minFileSizeKb?: number;
  minSourceWidth?: number;
  minSourceHeight?: number;
  maxSourceWidth?: number;
  maxSourceHeight?: number;
  minOutputWidth?: number;
  minOutputHeight?: number;
  maxOutputWidth?: number;
  maxOutputHeight?: number;
  outputFormat?: OutputImageFormat;
  /** For JPEG/WebP; ignored for PNG */
  outputQuality?: number;
  /** Show a one-line summary of active limits under the helper text. */
  showValidationHints?: boolean;
  /** Drop zone surface — `primary-dark` uses brand primary-950 with white copy. */
  dropzoneVariant?: "default" | "primary-dark";
  /**
   * Same-origin or CORS-safe URL used for “Recrop existing image” before the user picks a file.
   */
  editableSourceUrl?: string | null;
  onComplete?: (payload: ImageUploaderCropCompletePayload) => void;
  onError?: (message: string) => void;
  /** Called after pre-crop validation passes (before the crop dialog opens). */
  onPreCropValidated?: (meta: ImageFileInspectionMeta) => void;
  /** Called when the user clears or replaces the image (dropzone shown again). */
  onReset?: () => void;
  className?: string;
};

const DEFAULT_ACCEPT: Record<string, string[]> = {
  "image/png": [".png"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/webp": [".webp"],
};

export function ImageUploaderCrop({
  aspect,
  aspectLabel,
  aspectPresets,
  defaultAspectPresetIndex,
  hideAspectPresetOnUploader = false,
  label = "Image",
  helperText,
  helperTextDetail,
  helperTextClassName,
  accept = DEFAULT_ACCEPT,
  maxFileSizeMb,
  maxSizeMb = 8,
  minFileSizeKb,
  minSourceWidth,
  minSourceHeight,
  maxSourceWidth,
  maxSourceHeight,
  minOutputWidth,
  minOutputHeight,
  maxOutputWidth,
  maxOutputHeight,
  outputFormat = "image/png",
  outputQuality = 0.92,
  showValidationHints = false,
  dropzoneVariant = "default",
  editableSourceUrl = null,
  onComplete,
  onError,
  onPreCropValidated,
  onReset,
  className,
}: ImageUploaderCropProps) {
  type Phase = "idle" | "validating" | "cropping" | "cropped";
  const isMobile = useIsMobile();
  const [phase, setPhase] = useState<Phase>("idle");
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [originalName, setOriginalName] = useState<string>("");
  const [cropOpen, setCropOpen] = useState(false);
  const [result, setResult] = useState<ImageUploaderCropCompletePayload | null>(null);
  const sourceFileRef = useRef<File | null>(null);
  const cropSessionSourceRef = useRef<ImageUploaderCropSessionSource>("dropzone");
  const isConfirmingCrop = useRef(false);

  const [selectedPresetIndex, setSelectedPresetIndex] = useState(() =>
    getInitialPresetIndex(aspectPresets, defaultAspectPresetIndex, aspect),
  );

  const hasPresets = Boolean(aspectPresets && aspectPresets.length > 0);
  const showRatioPicker = Boolean(aspectPresets && aspectPresets.length > 1);
  const showUploaderRatioPicker = showRatioPicker && !hideAspectPresetOnUploader;

  const effectiveAspect = useMemo(() => {
    if (hasPresets && aspectPresets) {
      const i = clampPresetIndex(selectedPresetIndex, aspectPresets.length);
      return aspectPresets[i]!.aspect;
    }
    return aspect;
  }, [aspect, aspectPresets, hasPresets, selectedPresetIndex]);

  const effectiveLabel = useMemo(() => {
    if (hasPresets && aspectPresets) {
      const i = clampPresetIndex(selectedPresetIndex, aspectPresets.length);
      return aspectPresets[i]!.label;
    }
    return aspectLabel;
  }, [aspectLabel, aspectPresets, hasPresets, selectedPresetIndex]);

  /** Hint under the dropzone: avoid implying a single ratio when presets are only in the crop dialog. */
  const dropzoneAspectHint = useMemo(() => {
    if (aspectPresets && aspectPresets.length > 1 && hideAspectPresetOnUploader) {
      return "Pick a crop ratio in the next step";
    }
    return effectiveLabel ?? null;
  }, [aspectPresets, effectiveLabel, hideAspectPresetOnUploader]);

  const resolvedMaxMb = maxFileSizeMb ?? maxSizeMb;

  const validationHintLine = useMemo(() => {
    return buildValidationHintLine({
      maxMb: resolvedMaxMb,
      ...(minFileSizeKb !== undefined ? { minFileSizeKb } : {}),
      ...(minSourceWidth !== undefined ? { minSourceWidth } : {}),
      ...(minSourceHeight !== undefined ? { minSourceHeight } : {}),
      ...(maxSourceWidth !== undefined ? { maxSourceWidth } : {}),
      ...(maxSourceHeight !== undefined ? { maxSourceHeight } : {}),
      ...(minOutputWidth !== undefined ? { minOutputWidth } : {}),
      ...(minOutputHeight !== undefined ? { minOutputHeight } : {}),
      ...(maxOutputWidth !== undefined ? { maxOutputWidth } : {}),
      ...(maxOutputHeight !== undefined ? { maxOutputHeight } : {}),
    });
  }, [
    resolvedMaxMb,
    minFileSizeKb,
    minSourceWidth,
    minSourceHeight,
    maxSourceWidth,
    maxSourceHeight,
    minOutputWidth,
    minOutputHeight,
    maxOutputWidth,
    maxOutputHeight,
  ]);

  const maxBytes = resolvedMaxMb * 1024 * 1024;

  const fileValidationRules = useMemo((): ImageFileValidationRules => {
    return {
      maxFileSizeMb: resolvedMaxMb,
      allowedMimeTypes: Object.keys(accept),
      ...(minFileSizeKb !== undefined ? { minFileSizeKb } : {}),
      ...(minSourceWidth !== undefined ? { minSourceWidth } : {}),
      ...(minSourceHeight !== undefined ? { minSourceHeight } : {}),
      ...(maxSourceWidth !== undefined ? { maxSourceWidth } : {}),
      ...(maxSourceHeight !== undefined ? { maxSourceHeight } : {}),
    };
  }, [
    resolvedMaxMb,
    minFileSizeKb,
    accept,
    minSourceWidth,
    minSourceHeight,
    maxSourceWidth,
    maxSourceHeight,
  ]);

  const outputRules = useMemo((): CroppedOutputValidationRules => {
    return {
      ...(minOutputWidth !== undefined ? { minOutputWidth } : {}),
      ...(minOutputHeight !== undefined ? { minOutputHeight } : {}),
      ...(maxOutputWidth !== undefined ? { maxOutputWidth } : {}),
      ...(maxOutputHeight !== undefined ? { maxOutputHeight } : {}),
    };
  }, [minOutputWidth, minOutputHeight, maxOutputWidth, maxOutputHeight]);

  const revoke = useCallback((url: string | null) => {
    if (url?.startsWith("blob:")) {
      URL.revokeObjectURL(url);
    }
  }, []);

  const beginCropFromFile = useCallback(
    async (file: File, sessionSource: ImageUploaderCropSessionSource) => {
      cropSessionSourceRef.current = sessionSource;
      setPhase("validating");
      const res = await validateImageFile(file, fileValidationRules);
      if (!res.ok || !res.meta) {
        const msg = res.errors[0] ?? "Image did not pass validation.";
        toast.error(msg);
        setPhase("idle");
        onError?.(msg);
        return;
      }
      onPreCropValidated?.(res.meta);
      sourceFileRef.current = file;
      revoke(objectUrl);
      const next = URL.createObjectURL(file);
      setObjectUrl(next);
      setOriginalName(file.name);
      setCropOpen(true);
      setPhase("cropping");
    },
    [fileValidationRules, objectUrl, onError, onPreCropValidated, revoke],
  );

  const reset = useCallback(() => {
    cropSessionSourceRef.current = "dropzone";
    revoke(objectUrl);
    revoke(previewUrl);
    sourceFileRef.current = null;
    setObjectUrl(null);
    setPreviewUrl(null);
    setOriginalName("");
    setCropOpen(false);
    setResult(null);
    setPhase("idle");
    setSelectedPresetIndex(getInitialPresetIndex(aspectPresets, defaultAspectPresetIndex, aspect));
    onReset?.();
  }, [aspect, aspectPresets, defaultAspectPresetIndex, objectUrl, previewUrl, revoke, onReset]);

  useEffect(() => {
    return () => {
      revoke(objectUrl);
      revoke(previewUrl);
    };
  }, [objectUrl, previewUrl, revoke]);

  const handleCropCancel = useCallback(() => {
    revoke(objectUrl);
    sourceFileRef.current = null;
    setObjectUrl(null);
    setOriginalName("");
    setPhase("idle");
  }, [objectUrl, revoke]);

  const handleDialogOpenChange = useCallback(
    (open: boolean) => {
      setCropOpen(open);
      if (!open && !isConfirmingCrop.current) {
        handleCropCancel();
      }
    },
    [handleCropCancel],
  );

  const handlePresetIndexChange = useCallback((index: number) => {
    setSelectedPresetIndex(index);
  }, []);

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      if (fileRejections.length > 0) {
        const first = fileRejections[0];
        const code = first?.errors[0]?.code;
        let msg = "File rejected.";
        if (code === "file-too-large") msg = `File is too large (max ${resolvedMaxMb} MB).`;
        else if (code === "file-invalid-type") msg = "Unsupported file type.";
        toast.error(msg);
        setPhase("idle");
        onError?.(msg);
        return;
      }
      const file = acceptedFiles[0];
      if (!file) return;

      const run = async () => {
        await beginCropFromFile(file, "dropzone");
      };
      void run();
    },
    [beginCropFromFile, resolvedMaxMb, onError],
  );

  const handleLoadEditableFromUrl = useCallback(async () => {
    if (!editableSourceUrl) return;
    try {
      const res = await fetch(editableSourceUrl);
      if (!res.ok) throw new Error("Could not load image.");
      const blob = await res.blob();
      const segment = editableSourceUrl.split("/").pop()?.split("?")[0] ?? "logo-source.png";
      const safeName =
        segment.endsWith(".png") ||
        segment.endsWith(".jpg") ||
        segment.endsWith(".jpeg") ||
        segment.endsWith(".webp")
          ? segment
          : `${segment}.png`;
      const file = blobToFile(blob, safeName);
      await beginCropFromFile(file, "editableUrl");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not load image.";
      toast.error(msg);
      setPhase("idle");
      onError?.(msg);
    }
  }, [editableSourceUrl, beginCropFromFile, onError]);

  const dropzoneDisabled = phase === "validating" || (phase === "cropping" && cropOpen);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize: maxBytes,
    multiple: false,
    disabled: dropzoneDisabled,
  });

  const handleCropConfirm = useCallback(
    async (pixelCrop: Area) => {
      const src = objectUrl;
      if (!src) return;
      try {
        const blob = await getCroppedImageBlob(src, pixelCrop, outputFormat, outputQuality);
        const ext = extensionForFormat(outputFormat);
        const base = originalName.replace(/\.[^/.]+$/, "") || "image";
        const fileName = `${base}-cropped.${ext}`;
        const file = blobToFile(blob, fileName);

        const w = pixelCrop.width;
        const h = pixelCrop.height;
        const outCheck = validateCroppedOutput(w, h, outputRules, file.size);
        if (!outCheck.ok) {
          const msg = outCheck.errors[0] ?? "Cropped image did not pass validation.";
          toast.error(msg);
          onError?.(msg);
          return;
        }

        isConfirmingCrop.current = true;
        setCropOpen(false);
        revoke(src);
        setObjectUrl(null);

        revoke(previewUrl);
        const nextPreview = URL.createObjectURL(blob);
        setPreviewUrl(nextPreview);

        const meta: ImageUploaderCropMeta = {
          fileName: file.name,
          mimeType: file.type,
          byteSize: file.size,
          width: Math.round(w),
          height: Math.round(h),
          aspectRatio: effectiveAspect,
          cropAreaPixels: pixelCrop,
          originalFileName: originalName,
          ...(effectiveLabel !== undefined ? { aspectLabel: effectiveLabel } : {}),
        };

        const payload: ImageUploaderCropCompletePayload = {
          file,
          previewUrl: nextPreview,
          meta,
          sessionSource: cropSessionSourceRef.current,
        };
        setResult(payload);
        setPhase("cropped");
        onComplete?.(payload);
        toast.success("Image cropped", {
          description: `${meta.width}×${meta.height}px`,
        });

        queueMicrotask(() => {
          isConfirmingCrop.current = false;
        });
      } catch (e) {
        isConfirmingCrop.current = false;
        const msg = e instanceof Error ? e.message : "Could not crop image.";
        toast.error(msg);
        setPhase("cropping");
        onError?.(msg);
      }
    },
    [
      objectUrl,
      outputFormat,
      outputQuality,
      originalName,
      effectiveAspect,
      effectiveLabel,
      outputRules,
      onComplete,
      onError,
      previewUrl,
      revoke,
    ],
  );

  const handleRecrop = useCallback(() => {
    cropSessionSourceRef.current = "recrop";
    const f = sourceFileRef.current;
    if (!f) return;
    revoke(objectUrl);
    revoke(previewUrl);
    setPreviewUrl(null);
    setResult(null);
    const next = URL.createObjectURL(f);
    setObjectUrl(next);
    setOriginalName(f.name);
    setCropOpen(true);
    setPhase("cropping");
  }, [objectUrl, previewUrl, revoke]);

  const dropzoneClass = useMemo(
    () =>
      cn(
        dropzoneVariant === "primary-dark"
          ? "border-primary-900/80 bg-primary-950 text-white hover:bg-primary-900/90 flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors"
          : "border-border bg-background/50 hover:bg-accent/30 flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors",
        dropzoneVariant === "primary-dark"
          ? isDragActive && "border-white/40 bg-primary-900"
          : isDragActive && "border-primary bg-accent/20",
        phase === "validating" && "pointer-events-none opacity-70",
      ),
    [dropzoneVariant, isDragActive, phase],
  );

  const hasCroppedResult = Boolean(result && previewUrl);
  const showDropzone =
    !hasCroppedResult && phase !== "cropped" && !(phase === "cropping" && cropOpen);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-col gap-1">
        {label ? <TypographyLabel as="div">{label}</TypographyLabel> : null}
        {helperText ? (
          <TypographyHelperText className={helperTextClassName}>{helperText}</TypographyHelperText>
        ) : null}
        {helperTextDetail ? (
          <TypographyHelperText className={cn("hidden sm:block", helperTextClassName)}>
            {helperTextDetail}
          </TypographyHelperText>
        ) : null}
        {showValidationHints && validationHintLine ? (
          <TypographyHelperText>{validationHintLine}</TypographyHelperText>
        ) : null}
      </div>

      {editableSourceUrl && showDropzone ? (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="w-full max-w-sm sm:w-auto"
          disabled={phase === "validating"}
          onClick={() => void handleLoadEditableFromUrl()}
        >
          Recrop existing image
        </Button>
      ) : null}

      {showDropzone && (
        <div className="space-y-3">
          {showUploaderRatioPicker && aspectPresets ? (
            <div className="space-y-2">
              <TypographyLabel
                as="label"
                htmlFor="uploader-aspect-preset"
                tone="muted"
                className="text-xs"
              >
                Crop ratio
              </TypographyLabel>
              <Select
                value={String(selectedPresetIndex)}
                onValueChange={(v) => handlePresetIndexChange(Number(v))}
              >
                <SelectTrigger id="uploader-aspect-preset" className="w-full max-w-sm" size="sm">
                  <SelectValue placeholder="Select ratio" />
                </SelectTrigger>
                <SelectContent>
                  {aspectPresets.map((p, i) => (
                    <SelectItem key={`${p.label}-${i}`} value={String(i)}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}
          <div {...getRootProps()} className={dropzoneClass}>
            <input {...getInputProps()} />
            <TypographyBodySmall
              as="p"
              className={cn("font-medium", dropzoneVariant === "primary-dark" && "text-white")}
            >
              {phase === "validating"
                ? "Checking image…"
                : isMobile
                  ? "Tap to choose a photo"
                  : isDragActive
                    ? "Drop image here"
                    : "Drop an image here, or click to browse"}
            </TypographyBodySmall>
            <TypographyFinePrint
              tone={dropzoneVariant === "primary-dark" ? "default" : "muted"}
              className={cn("mt-1 text-sm", dropzoneVariant === "primary-dark" && "text-white/70")}
            >
              PNG, JPEG, WebP · max {resolvedMaxMb} MB
              {dropzoneAspectHint ? ` · ${dropzoneAspectHint}` : ""}
            </TypographyFinePrint>
          </div>
        </div>
      )}

      {result && previewUrl ? (
        <div className="space-y-3 rounded-xl border p-4">
          <div className="flex flex-wrap items-center gap-2">
            <TypographyCaption
              as="span"
              tone="default"
              className="bg-secondary text-secondary-foreground inline-flex rounded-full px-2 py-0.5 font-medium"
            >
              Cropped
            </TypographyCaption>
            {result.meta.aspectLabel ? (
              <TypographyCaption tone="muted" as="span">
                {result.meta.aspectLabel}
              </TypographyCaption>
            ) : null}
          </div>
          <img
            src={previewUrl}
            alt="Cropped result"
            className="bg-muted max-h-64 w-full rounded-lg object-contain"
          />
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Button
              type="button"
              variant="brandPrimaryOutline"
              size="sm"
              className="w-full sm:w-auto"
              onClick={reset}
            >
              Clear
            </Button>
            <Button
              type="button"
              variant="brandPrimary"
              size="sm"
              className="w-full sm:w-auto"
              onClick={handleRecrop}
            >
              Recrop
            </Button>
            <Button
              type="button"
              variant="brandOutline"
              size="sm"
              className="w-full sm:w-auto"
              onClick={reset}
            >
              Replace image
            </Button>
          </div>
        </div>
      ) : null}

      {objectUrl ? (
        <ImageCropDialog
          open={cropOpen}
          onOpenChange={handleDialogOpenChange}
          imageSrc={objectUrl}
          aspect={effectiveAspect}
          onConfirm={handleCropConfirm}
          {...(showRatioPicker && aspectPresets
            ? {
                aspectPresets,
                selectedPresetIndex,
                onPresetChange: handlePresetIndexChange,
              }
            : {})}
        />
      ) : null}
    </div>
  );
}
