import {
  TypographyH2,
  TypographyMuted,
  TypographyPageDescription,
  TypographyPageTitle,
} from "@/components/typography";
import { Badge } from "@/components/ui/badge";
import { Section } from "@/components/ui/container";

import { PageHeaderReferenceName } from "../page-header-reference-name";

export function MetaHeaderSection() {
  return (
    <Section spacing="none">
      <div className="mb-6">
        <TypographyH2 className="text-xl font-semibold">Title + metadata row</TypographyH2>
        <TypographyMuted className="mt-1">
          Title with a row of contextual metadata underneath: status badge, last-updated timestamp,
          owner / region.
        </TypographyMuted>
        <div className="mt-3">
          <PageHeaderReferenceName name="page.header.meta.row" />
        </div>
      </div>
      <div className="bg-card/50 rounded-xl border p-6 sm:p-10">
        <header className="border-border border-b pb-8">
          <div className="space-y-2">
            <TypographyPageTitle as="h2" className="text-3xl font-bold tracking-tight sm:text-4xl">
              Season overview
            </TypographyPageTitle>
            <TypographyPageDescription className="max-w-3xl">
              Top-level health and progress across competitions, grades, teams, and fixtures.
            </TypographyPageDescription>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-2 text-xs sm:gap-3">
            <Badge className="bg-success-600 hover:bg-success-600/90 text-white">Active</Badge>
            <span className="text-muted-foreground">Last updated 2m ago</span>
            <span className="text-muted-foreground">Owner: Fixtura Ops</span>
            <span className="text-muted-foreground">Region: AU East</span>
          </div>
        </header>
      </div>
    </Section>
  );
}
