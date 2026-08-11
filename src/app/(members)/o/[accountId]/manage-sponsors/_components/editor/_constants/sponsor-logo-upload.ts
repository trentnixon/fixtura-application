import {
  LOGO_MIN_OUTPUT_HEIGHT_PX,
  LOGO_MIN_OUTPUT_WIDTH_PX,
  LOGO_MIN_SOURCE_HEIGHT_PX,
  LOGO_MIN_SOURCE_WIDTH_PX,
} from "@/features/branding/components/brand-logo-workspace/logo-save-validation";
import { SELECTABLE_LOGO_CROP_PRESETS } from "@/lib/media/selectable-logo-crop-presets";

export const SPONSOR_LOGO_UPLOAD_ASPECT = 1;
export const SPONSOR_LOGO_UPLOAD_DEFAULT_ASPECT_PRESET_INDEX = 0;
export const SPONSOR_LOGO_UPLOAD_MAX_FILE_SIZE_MB = 8;

export const SPONSOR_LOGO_UPLOAD_CALLOUT_COPY =
  "PNG, JPEG, or WebP up to 8MB. Source image must be at least 500x500px and cropped output must be at least 400x400px.";

export const SPONSOR_LOGO_UPLOAD_CROP_PRESETS = [...SELECTABLE_LOGO_CROP_PRESETS];

export const SPONSOR_LOGO_UPLOAD_MINIMUMS = {
  minSourceWidth: LOGO_MIN_SOURCE_WIDTH_PX,
  minSourceHeight: LOGO_MIN_SOURCE_HEIGHT_PX,
  minOutputWidth: LOGO_MIN_OUTPUT_WIDTH_PX,
  minOutputHeight: LOGO_MIN_OUTPUT_HEIGHT_PX,
} as const;
