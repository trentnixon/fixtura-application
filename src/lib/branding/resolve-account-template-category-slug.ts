import type { AccountBrandingData } from "@/types/api/account";

/**
 * Template category slug for Remotion / merge: prefers `template.category`, then
 * `template_option.category.slug` (or `name`) when Phase-3 `template` is null.
 */
export function resolveAccountTemplateCategorySlug(
  branding: AccountBrandingData | null | undefined,
): string | null {
  const fromTemplate = branding?.template?.category?.trim();
  if (fromTemplate) return fromTemplate;

  const opt = branding?.template_option;
  if (opt == null || typeof opt !== "object" || Array.isArray(opt)) return null;

  const cat = (opt as Record<string, unknown>)["category"];
  if (cat == null) return null;
  if (typeof cat === "string") {
    const t = cat.trim();
    return t !== "" ? t : null;
  }
  if (typeof cat === "object" && !Array.isArray(cat)) {
    const r = cat as Record<string, unknown>;
    const slug = r["slug"];
    if (typeof slug === "string" && slug.trim() !== "") return slug.trim();
    const name = r["name"];
    if (typeof name === "string" && name.trim() !== "") return name.trim();
  }

  return null;
}
