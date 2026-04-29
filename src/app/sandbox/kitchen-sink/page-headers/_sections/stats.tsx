import {
  TypographyH2,
  TypographyMuted,
  TypographyPageDescription,
  TypographyPageTitle,
} from "@/components/typography";
import { Section, Surface } from "@/components/ui/container";

import { PageHeaderReferenceName } from "../page-header-reference-name";

const STATS = [
  { label: "Competitions", value: 8 },
  { label: "Grades", value: 42 },
  { label: "Teams", value: 216 },
  { label: "Fixtures", value: 612 },
] as const;

export function StatsHeaderSection() {
  return (
    <Section spacing="none">
      <div className="mb-6">
        <TypographyH2 className="text-xl font-semibold">Hero header with KPI stats</TypographyH2>
        <TypographyMuted className="mt-1">
          Title alongside a strip of summary stats (Competitions / Grades / Teams / Fixtures). This
          mirrors the inline pattern in the Season Overview route.
        </TypographyMuted>
        <div className="mt-3">
          <PageHeaderReferenceName name="page.header.hero.stats" />
        </div>
      </div>
      <div className="bg-card/50 rounded-xl border p-6 sm:p-10">
        <header className="space-y-6">
          <div className="border-border border-b pb-8">
            <div className="space-y-2">
              <TypographyPageTitle
                as="h2"
                className="text-3xl font-bold tracking-tight sm:text-4xl"
              >
                Season overview
              </TypographyPageTitle>
              <TypographyPageDescription className="max-w-3xl">
                Recon snapshot of competition coverage and match volume for this account.
              </TypographyPageDescription>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {STATS.map((stat) => (
              <Surface
                key={stat.label}
                className="flex min-h-16 items-center gap-3 py-3 shadow-none"
              >
                <span className="text-2xl leading-none font-bold tabular-nums">{stat.value}</span>
                <span className="text-muted-foreground truncate text-sm font-semibold tracking-tight uppercase">
                  {stat.label}
                </span>
              </Surface>
            ))}
          </div>
        </header>
      </div>
    </Section>
  );
}
