import { resolvePreviewMediaUrl } from "./resolve-preview-media-url";

export function buildLuminancePreviewConfig(source: string | null | undefined) {
  const url = resolvePreviewMediaUrl(source);
  if (url === null) return null;
  return {
    url,
    map: { kind: "theme", preset: "brand" },
    protection: "none",
    supersampleScale: 1,
  } as const;
}
