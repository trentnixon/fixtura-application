import {
  TypographyH2,
  TypographyMuted,
  TypographyPageDescription,
  TypographyPageTitle,
} from "@/components/typography";
import { Section } from "@/components/ui/container";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { PageHeaderReferenceName } from "../page-header-reference-name";

export function TabsHeaderSection() {
  return (
    <Section spacing="none">
      <div className="mb-6">
        <TypographyH2 className="text-xl font-semibold">Title + sub-nav tabs</TypographyH2>
        <TypographyMuted className="mt-1">
          Title block followed by a tab strip for sibling sub-routes (e.g. Overview / Competitions /
          Settings inside a season).
        </TypographyMuted>
        <div className="mt-3">
          <PageHeaderReferenceName name="page.header.tabs.subnav" />
        </div>
      </div>
      <div className="bg-card/50 rounded-xl border p-6 sm:p-10">
        <header className="border-border border-b pb-8">
          <div className="space-y-2">
            <TypographyPageTitle as="h2" className="text-3xl font-bold tracking-tight sm:text-4xl">
              Season hub
            </TypographyPageTitle>
            <TypographyPageDescription className="max-w-3xl">
              Navigate between sibling season views without leaving the current route context.
            </TypographyPageDescription>
          </div>
          <div className="mt-6">
            <Tabs defaultValue="overview">
              <TabsList className="h-auto flex-wrap justify-start gap-1 p-1">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="competitions">Competitions</TabsTrigger>
                <TabsTrigger value="grades">Grades</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </header>
      </div>
    </Section>
  );
}
