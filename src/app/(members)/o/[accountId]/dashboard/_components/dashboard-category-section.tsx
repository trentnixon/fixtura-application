import { useId } from "react";

import { TypographyH2, TypographyMuted } from "@/components/typography";

import type { ReactNode } from "react";

type DashboardCategorySectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export function DashboardCategorySection({
  title,
  description,
  children,
}: DashboardCategorySectionProps) {
  const headingId = useId();

  return (
    <section className="grid gap-6" aria-labelledby={headingId}>
      <header id={headingId} className="border-border space-y-1 border-b pb-4">
        <TypographyH2 className="text-xl font-semibold tracking-tight">{title}</TypographyH2>
        {description ? <TypographyMuted className="text-sm">{description}</TypographyMuted> : null}
      </header>
      <div className="grid gap-6">{children}</div>
    </section>
  );
}
