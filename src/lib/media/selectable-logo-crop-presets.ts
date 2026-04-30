/** Shared presets for selectable-ratio logo cropping (onboarding + image-crop lab). */
export const SELECTABLE_LOGO_CROP_PRESETS: { aspect: number; label: string }[] = [
  { aspect: 1, label: "1:1 — Square" },
  { aspect: 4 / 3, label: "4:3 — Landscape" },
  { aspect: 3 / 4, label: "3:4 — Portrait" },
  { aspect: 4 / 5, label: "4:5 — Portrait" },
  { aspect: 5 / 4, label: "5:4 — Landscape" },
  { aspect: 9 / 16, label: "9:16 — Story" },
  { aspect: 16 / 9, label: "16:9 — Wide" },
];
