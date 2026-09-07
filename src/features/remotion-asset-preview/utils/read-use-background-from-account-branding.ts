import type { AccountBrandingData } from "@/types/api/account";

/** `useBackground` selects the background pipeline; lives on `theme.theme` or `template_option`. */
export function readUseBackgroundFromAccountBranding(
  branding: AccountBrandingData | null | undefined,
): string | null {
  const slices = [branding?.template_option, branding?.theme?.theme];
  for (const row of slices) {
    if (row == null || typeof row !== "object" || Array.isArray(row)) continue;
    const raw = (row as Record<string, unknown>)["useBackground"];
    if (typeof raw === "string" && raw.trim() !== "") return raw.trim();
  }
  return null;
}
