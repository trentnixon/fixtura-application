import type { ReactNode } from "react";

export const metadata = {
  title: "Data lab — Template noises (UI endpoint)",
  description:
    "GET /api/template-noises/ui — published template noises for selection (BFF → Strapi).",
};

export default function DataLabTemplateNoisesUiLayout({ children }: { children: ReactNode }) {
  return children;
}
