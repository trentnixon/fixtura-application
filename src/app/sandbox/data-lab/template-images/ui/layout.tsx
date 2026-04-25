import type { ReactNode } from "react";

export const metadata = {
  title: "Data lab — Template images (UI endpoint)",
  description:
    "GET /api/template-images/ui — published template images for selection (BFF → Strapi).",
};

export default function DataLabTemplateImagesUiLayout({ children }: { children: ReactNode }) {
  return children;
}
