import type { ReactNode } from "react";

export const metadata = {
  title: "Data lab — Template patterns (UI endpoint)",
  description:
    "GET /api/template-patterns/ui — published template patterns for selection (BFF → Strapi).",
};

export default function DataLabTemplatePatternsUiLayout({ children }: { children: ReactNode }) {
  return children;
}
