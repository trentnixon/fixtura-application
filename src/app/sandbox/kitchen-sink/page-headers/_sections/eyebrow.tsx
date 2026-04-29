import {
  TypographyEyebrow,
  TypographyH2,
  TypographyMuted,
  TypographyOverline,
  TypographyPageDescription,
  TypographyPageTitle,
} from "@/components/typography";
import { Section } from "@/components/ui/container";

import { PageHeaderReferenceName } from "../page-header-reference-name";

export function EyebrowHeaderSection() {
  return (
    <Section spacing="none">
      <div className="mb-6">
        <TypographyH2 className="text-xl font-semibold">Eyebrow + title</TypographyH2>
        <TypographyMuted className="mt-1">
          Small labelled prefix above the page title (e.g. &ldquo;Organisation&rdquo; over
          &ldquo;Dashboard&rdquo;). Uses <code className="text-xs">TypographyEyebrow</code> /{" "}
          <code className="text-xs">TypographyOverline</code>.
        </TypographyMuted>
        <div className="mt-3">
          <PageHeaderReferenceName name="page.header.eyebrow" />
        </div>
      </div>
      <div className="bg-card/50 space-y-8 rounded-xl border p-6 sm:p-10">
        <header className="border-border border-b pb-8">
          <div className="space-y-2">
            <TypographyEyebrow>Organisation</TypographyEyebrow>
            <TypographyPageTitle as="h2" className="text-3xl font-bold tracking-tight sm:text-4xl">
              Dashboard
            </TypographyPageTitle>
            <TypographyPageDescription className="max-w-3xl">
              High-level summary of fixtures, teams, and upcoming work. Prefer{" "}
              <code className="text-xs">TypographyEyebrow</code> for category-style labels above the
              route title.
            </TypographyPageDescription>
          </div>
        </header>

        <header className="border-border border-b pb-8">
          <div className="space-y-2">
            <TypographyOverline>Season hub</TypographyOverline>
            <TypographyPageTitle as="h2" className="text-3xl font-bold tracking-tight sm:text-4xl">
              Competitions
            </TypographyPageTitle>
            <TypographyPageDescription className="max-w-3xl">
              Use <code className="text-xs">TypographyOverline</code> when you want a tighter, more
              restrained upper label than the eyebrow.
            </TypographyPageDescription>
          </div>
        </header>
      </div>
    </Section>
  );
}
