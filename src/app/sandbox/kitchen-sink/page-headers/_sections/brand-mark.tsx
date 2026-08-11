import Image from "next/image";

import {
  TypographyH2,
  TypographyMuted,
  TypographyPageDescription,
  TypographyPageTitle,
} from "@/components/typography";
import { Section } from "@/components/ui/container";

import { PageHeaderReferenceName } from "../page-header-reference-name";

const demoLogo = "/logos/android-chrome-192x192.png";

function BrandMarkDemoImage({ className }: { className?: string }) {
  return (
    <Image
      src={demoLogo}
      alt="Organisation logo"
      width={56}
      height={56}
      className={className}
      sizes="56px"
    />
  );
}

export function BrandMarkHeaderSection() {
  return (
    <Section spacing="none">
      <div className="mb-6">
        <TypographyH2 className="text-xl font-semibold">Title + brand mark (leading)</TypographyH2>
        <TypographyMuted className="mt-1">
          Logo or image sits to the left of the title stack. Stacks vertically on narrow viewports.
        </TypographyMuted>
        <div className="mt-3">
          <PageHeaderReferenceName name="page.header.brand.leading" />
        </div>
      </div>
      <div className="bg-card/50 mb-16 rounded-xl border p-6 sm:p-10">
        <header className="border-border border-b pb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
            <BrandMarkDemoImage className="ring-border shrink-0 rounded-xl ring-1" />
            <div className="min-w-0 space-y-2">
              <TypographyPageTitle
                as="h2"
                className="text-3xl font-bold tracking-tight sm:text-4xl"
              >
                Summerfield Sports Club
              </TypographyPageTitle>
              <TypographyPageDescription className="max-w-3xl">
                Season overview, competitions, and fixture coverage for your association.
              </TypographyPageDescription>
            </div>
          </div>
        </header>
      </div>

      <div className="mb-6">
        <TypographyH2 className="text-xl font-semibold">Title + brand mark (trailing)</TypographyH2>
        <TypographyMuted className="mt-1">
          Logo or image sits to the right of the title block. Useful when the mark balances actions
          or when artwork should trail the headline on desktop.
        </TypographyMuted>
        <div className="mt-3">
          <PageHeaderReferenceName name="page.header.brand.trailing" />
        </div>
      </div>
      <div className="bg-card/50 rounded-xl border p-6 sm:p-10">
        <header className="border-border border-b pb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
            <div className="min-w-0 space-y-2">
              <TypographyPageTitle
                as="h2"
                className="text-3xl font-bold tracking-tight sm:text-4xl"
              >
                Summerfield Sports Club
              </TypographyPageTitle>
              <TypographyPageDescription className="max-w-3xl">
                Season overview, competitions, and fixture coverage for your association.
              </TypographyPageDescription>
            </div>
            <BrandMarkDemoImage className="ring-border shrink-0 rounded-xl ring-1 sm:mt-0" />
          </div>
        </header>
      </div>
    </Section>
  );
}
