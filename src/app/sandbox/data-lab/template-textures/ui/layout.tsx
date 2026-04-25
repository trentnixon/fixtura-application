import type { ReactNode } from "react";

export const metadata = {
  title: "Data lab — Template textures (UI endpoint)",
  description:
    "GET /api/template-textures/ui — published template textures for selection (BFF → Strapi).",
};

export default function DataLabTemplateTexturesUiLayout({ children }: { children: ReactNode }) {
  return children;
}
