/** GET /api/template-images/ui (Next.js BFF -> Strapi). */
export interface TemplateImagesUiResponse {
  data: TemplateImageUiItem[];
}

export interface TemplateImageUiItem {
  id: number;
  name: string | null;
  ui: TemplateImageUiConfig;
}

export interface TemplateImageUiConfig {
  type: TemplateImageAnimationType | null;
  direction: TemplateImageAnimationDirection | null;
  overlayStyle: TemplateImageOverlayStyle | null;
  gradientType: TemplateImageGradientType | null;
  overlayOpacity: number | null;
}

export type TemplateImageAnimationType =
  | "none"
  | "zoom"
  | "pan"
  | "kenburns"
  | "breathing"
  | "focusblur";

export type TemplateImageAnimationDirection =
  | "up"
  | "down"
  | "left"
  | "right"
  | "in"
  | "out"
  | "pulse";

export type TemplateImageOverlayStyle =
  | "none"
  | "solid"
  | "gradient"
  | "vignette"
  | "duotone"
  | "pattern"
  | "colorFilter";

export type TemplateImageGradientType = "linear" | "radial";
