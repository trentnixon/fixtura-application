import type { TemplateCategoryCatalogItem } from "@/types/api/account";

export function categoryLabel(cat: TemplateCategoryCatalogItem): string {
  return cat.name ?? `Category ${cat.id}`;
}
