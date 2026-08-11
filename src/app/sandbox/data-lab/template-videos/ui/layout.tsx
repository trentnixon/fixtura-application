import type { ReactNode } from "react";

export const metadata = {
  title: "Data lab — Template videos (UI endpoint)",
  description:
    "GET /api/template-videos/ui — published template video configs for selection (BFF → Strapi).",
};

export default function DataLabTemplateVideosUiLayout({ children }: { children: ReactNode }) {
  return children;
}
