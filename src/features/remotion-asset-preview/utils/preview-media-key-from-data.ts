import type { FixturaDataset } from "@/vendor/fixtura-remotion-assets/preview";

export function previewMediaKeyFromData(data: FixturaDataset): string {
  const r = data as Record<string, unknown>;
  const vm = r["videoMeta"] as Record<string, unknown> | undefined;
  const video = vm?.["video"] as Record<string, unknown> | undefined;
  const appearance = video?.["appearance"] as Record<string, unknown> | undefined;
  const meta = video?.["metadata"] as Record<string, unknown> | undefined;
  const template = typeof appearance?.["template"] === "string" ? appearance["template"] : "";
  const comp = typeof meta?.["compositionId"] === "string" ? meta["compositionId"] : "";
  return `${template}-${comp}`;
}
