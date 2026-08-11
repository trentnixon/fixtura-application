import type { ReactNode } from "react";

export const metadata = {
  title: "Data lab — Template modes (UI endpoint)",
  description:
    "GET /api/template-modes/ui — published template modes for selection (BFF → Strapi).",
};

export default function DataLabTemplateModesUiLayout({ children }: { children: ReactNode }) {
  return children;
}
