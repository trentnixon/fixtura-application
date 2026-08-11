import type { TemplateParticleUiItem } from "@/types/api/template-particles";

/**
 * Resolves the selected particle id string against the current list.
 * Falls back to the first particle when the stored id is missing or invalid.
 */
export function resolveSelectedTemplateParticleIdString(
  particles: TemplateParticleUiItem[],
  selectedId: string | null | undefined,
): string | undefined {
  if (particles.length === 0) return undefined;
  const idSet = new Set(particles.map((particle) => String(particle.id)));
  if (selectedId != null && idSet.has(selectedId)) {
    return selectedId;
  }
  const first = particles[0];
  return first !== undefined ? String(first.id) : undefined;
}
