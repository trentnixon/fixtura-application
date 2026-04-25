import type { ReactNode } from "react";

export const metadata = {
  title: "Data lab — Template particles (UI endpoint)",
  description:
    "GET /api/template-particles/ui — published template particles for selection (BFF → Strapi).",
};

export default function DataLabTemplateParticlesUiLayout({ children }: { children: ReactNode }) {
  return children;
}
