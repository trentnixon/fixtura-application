import {
  DEFAULT_REMOTION_SANDBOX_TEMPLATE,
  REMOTION_SANDBOX_TEMPLATE_IDS,
} from "../_constants/remotion-templates";

import type { RemotionSandboxTemplateId } from "../_types/remotion-sandbox";

const TEMPLATE_ID_BY_LOWER = new Map(
  REMOTION_SANDBOX_TEMPLATE_IDS.map((id) => [id.toLowerCase(), id]),
);

/**
 * Map a CMS template-category slug to a vendored preview template id.
 * Uses exact registry match first, then case-insensitive match. Unknown or empty slugs fall back to default.
 */
export function resolveRemotionTemplateFromSlug(slug: string | null | undefined): {
  template: RemotionSandboxTemplateId;
  usedFallback: boolean;
} {
  if (slug == null || slug.trim() === "") {
    return { template: DEFAULT_REMOTION_SANDBOX_TEMPLATE, usedFallback: true };
  }

  const trimmed = slug.trim();
  if ((REMOTION_SANDBOX_TEMPLATE_IDS as readonly string[]).includes(trimmed)) {
    return { template: trimmed as RemotionSandboxTemplateId, usedFallback: false };
  }

  const byLower = TEMPLATE_ID_BY_LOWER.get(trimmed.toLowerCase());
  if (byLower !== undefined) {
    return { template: byLower, usedFallback: false };
  }

  return { template: DEFAULT_REMOTION_SANDBOX_TEMPLATE, usedFallback: true };
}
