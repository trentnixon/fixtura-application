import type { ReactNode } from "react";

export const metadata = {
  title: "Data lab — Template gradients (UI endpoint)",
  description:
    "GET /api/template-gradients/ui — published template gradients for selection (BFF → Strapi).",
};

export default function DataLabTemplateGradientsUiLayout({ children }: { children: ReactNode }) {
  return children;
}
