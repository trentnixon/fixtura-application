import type { FixturaDataset } from "@/vendor/fixtura-remotion-assets/preview";

/**
 * Top-level `frames` on Fixtura dummy/prod JSON: frame indices intended for thumbnails.
 * When missing or empty, callers should fall back to a lab default (e.g. frame 10).
 */
export function getSandboxThumbnailFramesFromData(
  data: FixturaDataset,
  fallbackFrame: number,
): { frames: number[]; fromDataset: boolean } {
  const raw = (data as Record<string, unknown>)["frames"];
  if (!Array.isArray(raw) || raw.length === 0) {
    return { frames: [fallbackFrame], fromDataset: false };
  }

  const ints = raw.filter((x): x is number => typeof x === "number" && Number.isInteger(x));
  if (ints.length === 0) {
    return { frames: [fallbackFrame], fromDataset: false };
  }

  return { frames: ints, fromDataset: true };
}
