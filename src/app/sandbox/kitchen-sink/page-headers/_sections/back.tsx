import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import {
  TypographyH2,
  TypographyMuted,
  TypographyPageDescription,
  TypographyPageTitle,
} from "@/components/typography";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/ui/container";
import { ROUTES } from "@/lib/config/routes";

import { PageHeaderReferenceName } from "../page-header-reference-name";

export function BackHeaderSection() {
  return (
    <Section spacing="none">
      <div className="mb-6">
        <TypographyH2 className="text-xl font-semibold">
          Detail page header with back link
        </TypographyH2>
        <TypographyMuted className="mt-1">
          Used inside drill-down routes: &ldquo;&larr; Back to Competitions&rdquo; above the entity
          title. Pairs well with a metadata row.
        </TypographyMuted>
        <div className="mt-3">
          <PageHeaderReferenceName name="page.header.detail.back-link" />
        </div>
      </div>
      <div className="bg-card/50 rounded-xl border p-6 sm:p-10">
        <header className="border-border border-b pb-8">
          <Button asChild variant="ghost" size="sm" className="mb-4 w-fit">
            <Link href={`${ROUTES.routeLab}/season/575/competitions/18031`}>
              <ArrowLeft className="size-4" aria-hidden />
              Back to competitions
            </Link>
          </Button>

          <div className="space-y-2">
            <TypographyPageTitle as="h2" className="text-3xl font-bold tracking-tight sm:text-4xl">
              Competition: Division One Men
            </TypographyPageTitle>
            <TypographyPageDescription className="max-w-3xl">
              View grade-level breakdown, fixtures density, and status diagnostics for this
              competition.
            </TypographyPageDescription>
          </div>
        </header>
      </div>
    </Section>
  );
}
