/** Resolve CMS upload paths consistently for saved and draft previews. */
export function resolvePreviewMediaUrl(url: string | null | undefined): string | null {
  const trimmed = url?.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;

  const base = process.env["NEXT_PUBLIC_STRAPI_URL"]?.replace(/\/+$/, "");
  if (base && trimmed.startsWith("/")) return `${base}${trimmed}`;

  return trimmed;
}
