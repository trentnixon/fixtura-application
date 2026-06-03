import { readTemplateModeId } from "@/features/branding/components/branding-workspace/_utils";

import type { AccountBrandingData } from "@/types/api/account";
import type { TemplateModeUiItem } from "@/types/api/template-modes";

/**
 * Resolve saved template mode slug from account branding + CMS mode list.
 */
export function resolveTemplateModeSlugFromBranding(
  branding: AccountBrandingData | null,
  modes: TemplateModeUiItem[],
): string | null {
  if (branding == null || modes.length === 0) {
    return null;
  }

  const savedId = readTemplateModeId(branding.template_option ?? null);
  if (savedId === null) {
    return null;
  }

  return modes.find((mode) => mode.id === savedId)?.slug ?? null;
}
