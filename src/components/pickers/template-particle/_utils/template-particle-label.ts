import type { TemplateParticleUiItem } from "@/types/api/template-particles";

export function templateParticleLabel(particle: TemplateParticleUiItem): string {
  return particle.name?.trim() || `Template particle ${particle.id}`;
}
