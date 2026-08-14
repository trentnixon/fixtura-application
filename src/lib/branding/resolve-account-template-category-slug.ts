import { readTemplateCategoryId } from "@/features/branding/components/branding-workspace/_utils";

import type { AccountBrandingData, AccountBrandingTemplateOption } from "@/types/api/account";
import type { TemplateCategoryCatalogItem } from "@/types/api/all-template-options";

function slugFromCategoryCatalogItem(category: TemplateCategoryCatalogItem): string | null {
  const slug = category.slug?.trim();
  if (slug) return slug;
  const name = category.name?.trim();
  return name || null;
}

function resolveCategoryFromTemplateOption(
  templateOption: AccountBrandingTemplateOption | null | undefined,
): string | null {
  if (
    templateOption == null ||
    typeof templateOption !== "object" ||
    Array.isArray(templateOption)
  ) {
    return null;
  }

  const cat = (templateOption as Record<string, unknown>)["category"];
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

/**
 * Template category slug for Remotion / merge.
 * Prefers `template_option.category` (saved template-builder selection / render pipeline),
 * then `template.category` on the linked template row.
 */
export function resolveAccountTemplateCategorySlug(
  branding: AccountBrandingData | null | undefined,
  categoryCatalog?: TemplateCategoryCatalogItem[] | null,
): string | null {
  const fromOption = resolveCategoryFromTemplateOption(branding?.template_option);
  if (fromOption) return fromOption;

  const categoryId = readTemplateCategoryId(branding?.template_option ?? null);
  if (categoryId !== null && categoryCatalog != null && categoryCatalog.length > 0) {
    const fromCatalog = categoryCatalog.find((row) => row.id === categoryId);
    if (fromCatalog != null) {
      const slug = slugFromCategoryCatalogItem(fromCatalog);
      if (slug) return slug;
    }
  }

  const fromTemplate = branding?.template?.category?.trim();
  if (fromTemplate) return fromTemplate;

  return null;
}
