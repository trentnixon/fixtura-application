import { Search, SlidersHorizontal } from "lucide-react";

import {
  TypographyH2,
  TypographyMuted,
  TypographyPageDescription,
  TypographyPageTitle,
} from "@/components/typography";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/ui/container";
import { Input } from "@/components/ui/input";

import { PageHeaderReferenceName } from "../page-header-reference-name";

export function SearchHeaderSection() {
  return (
    <Section spacing="none">
      <div className="mb-6">
        <TypographyH2 className="text-xl font-semibold">
          Title + inline search / filter
        </TypographyH2>
        <TypographyMuted className="mt-1">
          Index-page header with a search input or filter trigger pinned next to the title.
        </TypographyMuted>
        <div className="mt-3">
          <PageHeaderReferenceName name="page.header.search.inline" />
        </div>
      </div>
      <div className="bg-card/50 rounded-xl border p-6 sm:p-10">
        <header className="border-border border-b pb-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <TypographyPageTitle
                as="h2"
                className="text-3xl font-bold tracking-tight sm:text-4xl"
              >
                Team directory
              </TypographyPageTitle>
              <TypographyPageDescription className="max-w-3xl">
                Search and filter teams by grade, status, and venue assignment before opening a
                detail route.
              </TypographyPageDescription>
            </div>
            <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
              <div className="relative min-w-0 sm:min-w-[280px]">
                <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                <Input placeholder="Search teams..." className="pl-9" aria-label="Search teams" />
              </div>
              <Button variant="outline">
                <SlidersHorizontal className="size-4" aria-hidden />
                Filters
              </Button>
            </div>
          </div>
        </header>
      </div>
    </Section>
  );
}
