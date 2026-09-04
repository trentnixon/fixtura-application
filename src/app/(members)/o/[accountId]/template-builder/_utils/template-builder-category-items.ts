import type { TemplateCategoryCatalogItem } from "@/types/api/all-template-options";

export function buildCategoryItemsForEditor({
  catalogCategories,
  categoryOptions,
}: {
  catalogCategories: TemplateCategoryCatalogItem[];
  categoryOptions?: TemplateCategoryCatalogItem[] | null | undefined;
}): TemplateCategoryCatalogItem[] {
  const base = categoryOptions && categoryOptions.length > 0 ? categoryOptions : catalogCategories;
  return base.filter((category) => !category.isPrivate);
}
