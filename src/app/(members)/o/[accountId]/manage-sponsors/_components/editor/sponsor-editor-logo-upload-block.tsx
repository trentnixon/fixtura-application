"use client";

import { ImageUploaderCrop } from "@/components/media/image-uploader-crop";

import { SponsorLogoReplacementBadge } from "./logo-upload/sponsor-logo-replacement-badge";
import { SponsorLogoUploadFormatCallout } from "./logo-upload/sponsor-logo-upload-format-callout";
import {
  SPONSOR_LOGO_UPLOAD_ASPECT,
  SPONSOR_LOGO_UPLOAD_CROP_PRESETS,
  SPONSOR_LOGO_UPLOAD_DEFAULT_ASPECT_PRESET_INDEX,
  SPONSOR_LOGO_UPLOAD_MAX_FILE_SIZE_MB,
  SPONSOR_LOGO_UPLOAD_MINIMUMS,
} from "../../_constants/sponsor-logo-upload";

import type { SponsorEditorLogoUploadBlockProps } from "../../_types/sponsor-editor";

export function SponsorEditorLogoUploadBlock({
  savedLogoUrl,
  clearLogo,
  logoChangeKind,
  showFileFormatCallout = true,
  onLogoCropComplete,
  onLogoReset,
}: SponsorEditorLogoUploadBlockProps) {
  return (
    <div className="grid min-w-0 gap-6">
      <ImageUploaderCrop
        aspect={SPONSOR_LOGO_UPLOAD_ASPECT}
        aspectPresets={SPONSOR_LOGO_UPLOAD_CROP_PRESETS}
        defaultAspectPresetIndex={SPONSOR_LOGO_UPLOAD_DEFAULT_ASPECT_PRESET_INDEX}
        hideAspectPresetOnUploader
        label=""
        maxFileSizeMb={SPONSOR_LOGO_UPLOAD_MAX_FILE_SIZE_MB}
        editableSourceUrl={!clearLogo ? savedLogoUrl : null}
        {...SPONSOR_LOGO_UPLOAD_MINIMUMS}
        onComplete={onLogoCropComplete}
        onReset={onLogoReset}
      />

      <SponsorLogoReplacementBadge logoChangeKind={logoChangeKind} />

      {showFileFormatCallout ? <SponsorLogoUploadFormatCallout /> : null}
    </div>
  );
}
