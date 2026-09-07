import {
  readRemotionAnimationFromBranding,
  readRemotionImageFromBranding,
  readRemotionTextureFromBranding,
  readRemotionVideoFromBranding,
} from "./read-remotion-background-assets-from-branding";
import { readRemotionGradientFromBranding } from "./read-remotion-gradient-from-branding";
import { readRemotionPaletteKeyFromBranding } from "./read-remotion-palette-key-from-branding";
import { readUseBackgroundFromAccountBranding } from "./read-use-background-from-account-branding";

import type { AccountBrandingData } from "@/types/api/account";

export type SavedBrandingFieldGap = {
  field: string;
  status: "missing" | "partial";
  detail: string;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value == null || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function readTemplateOptionField(
  branding: AccountBrandingData | null | undefined,
  field: string,
): Record<string, unknown> | null {
  return asRecord(branding?.template_option?.[field]);
}

/** Audit saved branding for fields the saved assembly path needs for the active background mode. */
export function auditSavedBrandingCompleteness(
  branding: AccountBrandingData | null | undefined,
): SavedBrandingFieldGap[] {
  const gaps: SavedBrandingFieldGap[] = [];
  const useBackground = readUseBackgroundFromAccountBranding(branding);

  if (useBackground === null) {
    gaps.push({
      field: "useBackground",
      status: "missing",
      detail: "Neither template_option nor theme.theme defines useBackground.",
    });
    return gaps;
  }

  const categoryId = branding?.template_option?.["categoryId"];
  if (categoryId == null) {
    gaps.push({
      field: "categoryId",
      status: "missing",
      detail: "template_option.categoryId is required to resolve template slug.",
    });
  }

  if (readRemotionPaletteKeyFromBranding(branding) === null) {
    gaps.push({
      field: "palette",
      status: "missing",
      detail: "Expanded palette value missing on template_option or theme.",
    });
  }

  switch (useBackground) {
    case "Gradient":
      if (readRemotionGradientFromBranding(branding) === null) {
        gaps.push({
          field: "gradient",
          status: "missing",
          detail: "Gradient type/direction not readable from saved branding.",
        });
      }
      break;
    case "Texture": {
      const texture = readRemotionTextureFromBranding(branding);
      if (texture === null) {
        gaps.push({
          field: "texture",
          status: "missing",
          detail: "Texture url/name not readable from saved branding.",
        });
      } else if (texture.url == null || texture.url.trim() === "") {
        gaps.push({
          field: "texture.url",
          status: "partial",
          detail: "Texture row exists but media url is missing or unresolved.",
        });
      }
      break;
    }
    case "Image": {
      const image = readRemotionImageFromBranding(branding);
      if (image === null) {
        gaps.push({
          field: "image",
          status: "missing",
          detail: "Image treatment preset not readable from saved branding.",
        });
      } else if (image.type == null) {
        gaps.push({
          field: "image.type",
          status: "partial",
          detail: "Image animationType/type missing on saved branding.",
        });
      }
      break;
    }
    case "Video": {
      const video = readRemotionVideoFromBranding(branding);
      if (video === null) {
        gaps.push({
          field: "video",
          status: "missing",
          detail: "Video preset not readable from saved branding.",
        });
      } else if (video.url == null || video.url.trim() === "") {
        gaps.push({
          field: "video.url",
          status: "partial",
          detail: "Video preset exists but url is missing (may be runtime media).",
        });
      }
      break;
    }
    case "Animated": {
      const animation = readRemotionAnimationFromBranding(branding);
      if (animation === null) {
        gaps.push({
          field: "animation",
          status: "missing",
          detail: "animation.type not present — builder expands this from catalog preset.",
        });
      } else if (typeof animation.type !== "string" || animation.type.trim() === "") {
        gaps.push({
          field: "animation.type",
          status: "partial",
          detail: "animation row exists but type/presetId is missing.",
        });
      }
      break;
    }
    default:
      break;
  }

  const optionRow = readTemplateOptionField(branding, "mode");
  const themeRow = asRecord(branding?.theme?.theme);
  if (optionRow?.["mode"] == null && themeRow?.["mode"] == null) {
    gaps.push({
      field: "mode",
      status: "missing",
      detail: "Contrast mode slug missing on template_option and theme.",
    });
  }

  return gaps;
}

export function isSavedBrandingCompleteForRemotionPreview(
  branding: AccountBrandingData | null | undefined,
): boolean {
  return auditSavedBrandingCompleteness(branding).length === 0;
}
