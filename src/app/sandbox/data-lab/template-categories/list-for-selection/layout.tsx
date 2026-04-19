import type { ReactNode } from "react";

export const metadata = {
  title: "Data lab — Template categories (list for selection)",
  description:
    "GET /api/account/template-categories/list-for-selection — live CMS categories for dropdowns (includes private).",
};

export default function DataLabTemplateCategoriesListForSelectionLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
