import { getImageDimensionsFromFile } from "@/lib/media/get-image-dimensions";

export type ImageFileInspectionMeta = {
  fileName: string;
  mimeType: string;
  fileSize: number;
  width: number;
  height: number;
};

export type ImageFileValidationRules = {
  /** Upper bound for file size (MB). */
  maxFileSizeMb: number;
  /** Minimum file size (kilobytes). */
  minFileSizeKb?: number;
  /** If set, `file.type` must be included. */
  allowedMimeTypes?: string[];
  minSourceWidth?: number;
  minSourceHeight?: number;
  maxSourceWidth?: number;
  maxSourceHeight?: number;
};

export type ValidateImageFileResult = {
  ok: boolean;
  errors: string[];
  warnings: string[];
  meta: ImageFileInspectionMeta | null;
};

function formatMb(bytes: number): string {
  return (bytes / (1024 * 1024)).toFixed(1).replace(/\.0$/, "");
}

/**
 * Pre-crop validation: MIME, file size, decodable image, source width/height.
 */
export async function validateImageFile(
  file: File,
  rules: ImageFileValidationRules,
): Promise<ValidateImageFileResult> {
  const errors: string[] = [];
  const warnings: string[] = [];
  const maxBytes = rules.maxFileSizeMb * 1024 * 1024;

  if (rules.allowedMimeTypes?.length && !rules.allowedMimeTypes.includes(file.type)) {
    errors.push("Use a PNG, JPEG, or WebP image.");
    return { ok: false, errors, warnings, meta: null };
  }

  if (file.size > maxBytes) {
    errors.push(`Image exceeds the maximum file size of ${rules.maxFileSizeMb}MB.`);
    return { ok: false, errors, warnings, meta: null };
  }

  if (rules.minFileSizeKb !== undefined) {
    const minBytes = rules.minFileSizeKb * 1024;
    if (file.size < minBytes) {
      errors.push(`Image must be at least ${rules.minFileSizeKb}KB.`);
      return { ok: false, errors, warnings, meta: null };
    }
  }

  let width: number;
  let height: number;
  try {
    const dims = await getImageDimensionsFromFile(file);
    width = dims.width;
    height = dims.height;
  } catch {
    errors.push("Could not read this image. Try another file.");
    return { ok: false, errors, warnings, meta: null };
  }

  if (width < 1 || height < 1) {
    errors.push("This image appears empty or corrupted.");
    return { ok: false, errors, warnings, meta: null };
  }

  if (rules.minSourceWidth !== undefined && width < rules.minSourceWidth) {
    errors.push(`Image must be at least ${rules.minSourceWidth}px wide.`);
  }
  if (rules.minSourceHeight !== undefined && height < rules.minSourceHeight) {
    errors.push(`Image must be at least ${rules.minSourceHeight}px tall.`);
  }
  if (rules.maxSourceWidth !== undefined && width > rules.maxSourceWidth) {
    errors.push(`Image must be at most ${rules.maxSourceWidth}px wide.`);
  }
  if (rules.maxSourceHeight !== undefined && height > rules.maxSourceHeight) {
    errors.push(`Image must be at most ${rules.maxSourceHeight}px tall.`);
  }

  const meta: ImageFileInspectionMeta = {
    fileName: file.name,
    mimeType: file.type,
    fileSize: file.size,
    width,
    height,
  };

  if (errors.length > 0) {
    return { ok: false, errors, warnings, meta };
  }

  const largeThresholdMb = Math.max(rules.maxFileSizeMb * 0.85, 4);
  if (file.size > largeThresholdMb * 1024 * 1024) {
    warnings.push(
      `This file is large (${formatMb(file.size)}MB). It may be slow to process on older devices.`,
    );
  }

  return { ok: true, errors: [], warnings, meta };
}
