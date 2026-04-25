/** GET /api/template-noises/ui (Next.js BFF → Strapi). */
export type TemplateNoiseUiType =
  | "default"
  | "subtle"
  | "grain"
  | "wave"
  | "fog"
  | "static"
  | "floatingParticles"
  | "dynamicParticles"
  | "triangleSwarm"
  | "pulsingCircles"
  | "digitalRain"
  | "gradientGrid"
  | "spokes";

export type TemplateNoiseUiItem = {
  id: number;
  name: string | null;
  ui: {
    type: TemplateNoiseUiType | null;
  };
};

export type TemplateNoisesUiResponse = {
  data: TemplateNoiseUiItem[];
};
