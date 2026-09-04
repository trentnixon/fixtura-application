import { isForbiddenLegacyUseBackground } from "@/types/api/template-options";

import { normalizeUseBackgroundFromApi } from "./template-builder-use-background-helpers";

import type { TemplateUseBackgroundRead } from "@/types/api/template-options";

export function getSavedUseBackgroundRequiresMigration(
  useBackground: unknown,
): TemplateUseBackgroundRead | null {
  const normalized = normalizeUseBackgroundFromApi(useBackground);
  if (normalized === null) return null;
  if (isForbiddenLegacyUseBackground(normalized)) return normalized;
  return null;
}

export function getLegacyBackgroundMigrationMessage(legacyMode: TemplateUseBackgroundRead): string {
  return `This account uses the legacy "${legacyMode}" background, which can no longer be saved. Choose a new background type (Animated recommended) before saving changes.`;
}

export function isSaveBlockedByLegacyBackground(useBackground: unknown): boolean {
  return getSavedUseBackgroundRequiresMigration(useBackground) !== null;
}
