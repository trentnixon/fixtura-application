import {
  TypographyBreadcrumbText,
  TypographyDataLabel,
  TypographyDataValue,
  TypographyH2,
  TypographyMetricChange,
  TypographyMetricLabel,
  TypographyMetricValue,
  TypographyMuted,
  TypographyNavLabel,
  TypographyNavSectionLabel,
  TypographyTabLabel,
  TypographyTableCell,
  TypographyTableHeading,
  TypographyTableMeta,
  TypographyCodeInline,
  TypographyMonoText,
} from "@/components/typography";
import { Section } from "@/components/ui/container";

export function DataNavSection() {
  return (
    <Section spacing="none">
      <TypographyH2 className="text-muted-foreground border-border mb-6 border-b pb-2 text-sm font-semibold tracking-wider uppercase">
        Data display & navigation
      </TypographyH2>
      <div className="space-y-10">
        <div>
          <TypographyMuted className="mb-3 text-xs">Metrics</TypographyMuted>
          <div className="flex flex-wrap gap-8">
            <div>
              <TypographyMetricLabel className="block">Active seasons</TypographyMetricLabel>
              <TypographyMetricValue>12</TypographyMetricValue>
              <TypographyMetricChange tone="success" className="block">
                +2 this month
              </TypographyMetricChange>
            </div>
            <div>
              <TypographyDataLabel className="block">Fixture ID</TypographyDataLabel>
              <TypographyDataValue>
                <TypographyMonoText>fx_8f2a91</TypographyMonoText>
              </TypographyDataValue>
            </div>
          </div>
        </div>
        <div>
          <TypographyMuted className="mb-3 text-xs">Breadcrumbs & tabs</TypographyMuted>
          <div className="text-muted-foreground flex flex-wrap items-center gap-1 text-sm">
            <TypographyBreadcrumbText as="span" tone="muted">
              App
            </TypographyBreadcrumbText>
            <span aria-hidden>/</span>
            <TypographyBreadcrumbText as="span">Typography</TypographyBreadcrumbText>
          </div>
          <div className="mt-4 flex gap-4 border-b pb-2">
            <TypographyTabLabel as="span">Overview</TypographyTabLabel>
            <TypographyTabLabel as="span" tone="muted">
              Activity
            </TypographyTabLabel>
          </div>
        </div>
        <div>
          <TypographyMuted className="mb-3 text-xs">Sidebar-style nav</TypographyMuted>
          <div className="bg-muted/30 max-w-xs space-y-3 rounded-lg p-4">
            <TypographyNavSectionLabel as="div" className="block">
              Workspace
            </TypographyNavSectionLabel>
            <TypographyNavLabel as="div" className="block">
              Fixtures
            </TypographyNavLabel>
            <TypographyNavLabel as="div" className="block" tone="muted">
              Archive
            </TypographyNavLabel>
          </div>
        </div>
        <div className="overflow-x-auto">
          <TypographyMuted className="mb-3 text-xs">Table</TypographyMuted>
          <table className="w-full min-w-[280px] text-left text-sm">
            <thead>
              <tr>
                <TypographyTableHeading scope="col">Team</TypographyTableHeading>
                <TypographyTableHeading scope="col">Status</TypographyTableHeading>
              </tr>
            </thead>
            <tbody>
              <tr>
                <TypographyTableCell>U12 A</TypographyTableCell>
                <TypographyTableCell>
                  Active
                  <TypographyTableMeta as="span" className="ml-2 block sm:inline">
                    Updated <TypographyCodeInline>2026-04-01</TypographyCodeInline>
                  </TypographyTableMeta>
                </TypographyTableCell>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </Section>
  );
}
