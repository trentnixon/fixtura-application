export type ParticleType = "lines" | "dots" | "bubbles" | "snow" | "confetti";

export type ParticleDirection = "up" | "down" | "left" | "right" | "random";

export type ParticleAnimation = "scale" | "fade" | "slide" | "none";

export interface TemplateParticlesUiResponse {
  data: TemplateParticleUiItem[];
}

export interface TemplateParticleUiItem {
  id: number;
  name: string | null;
  ui: TemplateParticleUiFields;
}

export interface TemplateParticleUiFields {
  type: ParticleType | null;
  particleCount: number | null;
  speed: number | null;
  direction: ParticleDirection | null;
  animation: ParticleAnimation | null;
}
