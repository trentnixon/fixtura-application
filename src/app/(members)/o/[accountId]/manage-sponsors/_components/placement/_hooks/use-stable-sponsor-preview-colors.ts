import { useRef } from "react";

import { tryNormalizeHex } from "@/lib/brand-color";

import {
  SPONSOR_ENTITY_ASSET_PREVIEW_FALLBACK_PRIMARY,
  SPONSOR_ENTITY_ASSET_PREVIEW_FALLBACK_SECONDARY,
} from "../_constants/sponsor-entity-asset-preview";

export function useStableSponsorPreviewColors({
  primaryHex,
  secondaryHex,
}: {
  primaryHex: string;
  secondaryHex: string;
}) {
  const lastPrimaryRef = useRef<string>(SPONSOR_ENTITY_ASSET_PREVIEW_FALLBACK_PRIMARY);
  const lastSecondaryRef = useRef<string>(SPONSOR_ENTITY_ASSET_PREVIEW_FALLBACK_SECONDARY);

  const normalizedPrimary = tryNormalizeHex(primaryHex);
  const normalizedSecondary = tryNormalizeHex(secondaryHex);

  if (normalizedPrimary) lastPrimaryRef.current = normalizedPrimary;
  if (normalizedSecondary) lastSecondaryRef.current = normalizedSecondary;

  return {
    primary: normalizedPrimary ?? lastPrimaryRef.current,
    secondary: normalizedSecondary ?? lastSecondaryRef.current,
  };
}
