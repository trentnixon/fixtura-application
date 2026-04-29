import { TypographyH2, TypographyMuted } from "@/components/typography";
import { PageHeader, Section } from "@/components/ui/container";

import { PageHeaderReferenceName } from "../page-header-reference-name";

export function BasicHeaderSection() {
  return (
    <Section spacing="none">
      <div className="mb-6">
        <TypographyH2 className="text-xl font-semibold">Basic title + subtitle</TypographyH2>
        <TypographyMuted className="mt-1">
          Baseline header: page title and supporting description. This preview is the shared{" "}
          <code className="text-xs">PageHeader</code> from{" "}
          <code className="text-xs">src/components/ui/container.tsx</code>.
        </TypographyMuted>
        <div className="mt-3">
          <PageHeaderReferenceName name="page.header.basic" />
        </div>
      </div>
      <div className="bg-card/50 rounded-xl border p-6 sm:p-10">
        <PageHeader
          className="mb-0"
          title="Competition settings"
          description="Manage grades, fixtures, and visibility for this competition. Changes apply to this season only."
        />
      </div>
    </Section>
  );
}
