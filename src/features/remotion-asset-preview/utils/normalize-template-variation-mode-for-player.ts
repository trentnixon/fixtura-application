import type { FixturaDataset } from "@/vendor/fixtura-remotion-assets/preview";

/**
 * Remotion `settings.mode` keys are `light`, `dark`, `lightAlt`, `darkAlt` (see fixtura-remotion-assets).
 * Merged datasets may use PascalCase (`Light`, …) to match CMS; normalize at the player boundary.
 */
export function normalizeTemplateVariationModeForPlayerKeys(
  mode: string | null | undefined,
): "light" | "dark" | "lightAlt" | "darkAlt" {
  if (mode == null || mode.trim() === "") return "light";
  const s = mode.trim().toLowerCase().replace(/_/g, "-");

  if (s === "light-alt" || s === "lightalt" || (s.includes("light") && s.includes("alt"))) {
    return "lightAlt";
  }
  if (s === "dark-alt" || s === "darkalt" || (s.includes("dark") && s.includes("alt"))) {
    return "darkAlt";
  }
  if (s === "dark" || s.startsWith("dark")) {
    return "dark";
  }
  if (s === "light" || s.startsWith("light")) {
    return "light";
  }

  return "light";
}

/** Deep-clone dataset and set `video.templateVariation.mode` to Remotion player keys. */
export function withTemplateVariationModeNormalizedForRemotionPlayer(
  data: FixturaDataset,
): FixturaDataset {
  const next = structuredClone(data) as FixturaDataset;
  const vm = next["videoMeta"];
  if (vm == null || typeof vm !== "object" || Array.isArray(vm)) {
    return next;
  }
  const video = (vm as Record<string, unknown>)["video"];
  if (video == null || typeof video !== "object" || Array.isArray(video)) {
    return next;
  }
  const tv = (video as Record<string, unknown>)["templateVariation"];
  if (tv == null || typeof tv !== "object" || Array.isArray(tv)) {
    return next;
  }
  const mode = (tv as Record<string, unknown>)["mode"];
  if (typeof mode !== "string") {
    return next;
  }
  (tv as Record<string, unknown>)["mode"] = normalizeTemplateVariationModeForPlayerKeys(mode);
  return next;
}
