import type { TemplatePatternUiItem } from "@/types/api/template-patterns";

export function patternLabel(pattern: TemplatePatternUiItem): string {
  return pattern.name ?? `Template pattern ${pattern.id}`;
}
