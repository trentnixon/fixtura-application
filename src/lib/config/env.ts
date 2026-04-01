/**
 * Strapi base URL (no trailing slash), e.g. `https://api.example.com` or `http://localhost:1337`.
 */
export function getStrapiUrl(): string | null {
  const raw = process.env["STRAPI_URL"];
  if (!raw?.trim()) return null;
  return raw.replace(/\/+$/, "");
}
