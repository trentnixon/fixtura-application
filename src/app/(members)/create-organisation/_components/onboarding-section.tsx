"use client";

import { TypographyCardTitle } from "@/components/typography";
import { cn } from "@/lib/utils";

import type { ReactNode } from "react";

export function OnboardingSection({
  title,
  titleId,
  children,
  className,
}: {
  title: string;
  titleId: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn("border-border/60 bg-muted/20 rounded-lg border p-4 md:p-6", className)}
      aria-labelledby={titleId}
    >
      <TypographyCardTitle as="h2" id={titleId} className="text-base font-semibold tracking-tight">
        {title}
      </TypographyCardTitle>
      <div className="mt-4 flex flex-col gap-4">{children}</div>
    </section>
  );
}
