import { Plus, Upload } from "lucide-react";

import {
  TypographyH2,
  TypographyMuted,
  TypographyPageDescription,
  TypographyPageTitle,
} from "@/components/typography";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/ui/container";

import { PageHeaderReferenceName } from "../page-header-reference-name";

export function ActionsHeaderSection() {
  return (
    <Section spacing="none">
      <div className="mb-6">
        <TypographyH2 className="text-xl font-semibold">Title + trailing actions</TypographyH2>
        <TypographyMuted className="mt-1">
          Title left, primary + secondary buttons right (e.g. &ldquo;New competition&rdquo;,
          &ldquo;Export&rdquo;). Stacks on mobile.
        </TypographyMuted>
        <div className="mt-3">
          <PageHeaderReferenceName name="page.header.actions.trailing" />
        </div>
      </div>
      <div className="bg-card/50 rounded-xl border p-6 sm:p-10">
        <header className="border-border border-b pb-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <TypographyPageTitle
                as="h2"
                className="text-3xl font-bold tracking-tight sm:text-4xl"
              >
                Competitions
              </TypographyPageTitle>
              <TypographyPageDescription className="max-w-3xl">
                Manage competition records, publishing state, and season-level visibility for this
                account.
              </TypographyPageDescription>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Button variant="outline">
                <Upload className="size-4" aria-hidden />
                Export
              </Button>
              <Button variant="accent">
                <Plus className="size-4" aria-hidden />
                New competition
              </Button>
            </div>
          </div>
        </header>
      </div>
    </Section>
  );
}
