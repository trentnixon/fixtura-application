"use client";

import Link from "next/link";

import { TypographyMuted } from "@/components/typography";
import { Button } from "@/components/ui/button";

type SeasonRowLinkProps = {
  href: string;
  title: string;
  subtitle?: string;
};

export function SeasonRowLink({ href, title, subtitle }: SeasonRowLinkProps) {
  return (
    <Link
      href={href}
      className="border-border hover:bg-muted/40 flex w-full min-w-0 items-center justify-between gap-4 border-b px-6 py-4 transition-colors last:border-b-0"
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{title}</p>
        {subtitle ? (
          <TypographyMuted className="mt-0.5 truncate text-xs">{subtitle}</TypographyMuted>
        ) : null}
      </div>
      <Button asChild variant="accentOutline" size="sm">
        <span>Open</span>
      </Button>
    </Link>
  );
}
