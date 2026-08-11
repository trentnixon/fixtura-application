import type { ReactNode } from "react";

export const metadata = {
  title: "Data lab — Template palettes (UI endpoint)",
  description:
    "GET /api/template-palettes/ui — published template palettes for selection (BFF → Strapi).",
};

export default function DataLabTemplatePalettesUiLayout({ children }: { children: ReactNode }) {
  return children;
}
