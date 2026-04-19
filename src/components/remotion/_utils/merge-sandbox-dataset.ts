import type { SandboxDatasetOverrides } from "../_types/remotion-sandbox";
import type { FixturaDataset } from "@/vendor/fixtura-remotion-assets/preview";

export function mergeSandboxDataset(
  base: FixturaDataset,
  overrides: SandboxDatasetOverrides,
): FixturaDataset {
  const next = structuredClone(base) as Record<string, unknown>;
  const videoMeta = next["videoMeta"] as Record<string, unknown>;
  const video = videoMeta["video"] as Record<string, unknown>;
  const appearance = video["appearance"] as Record<string, unknown>;
  appearance["template"] = overrides.template;
  return next as FixturaDataset;
}
