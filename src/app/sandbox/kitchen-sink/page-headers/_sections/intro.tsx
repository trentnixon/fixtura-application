import { TypographyH2, TypographyMuted, TypographyP } from "@/components/typography";
import { Section } from "@/components/ui/container";

export function PageHeadersIntro() {
  return (
    <Section spacing="none">
      <div className="mb-6">
        <TypographyH2 className="text-muted-foreground border-border mb-6 border-b pb-2 text-sm font-semibold tracking-wider uppercase">
          About this reference
        </TypographyH2>
        <TypographyP className="max-w-3xl text-sm">
          Every members-area route opens with a title section. This page enumerates the supported
          variants so feature work can pick a pattern instead of hand-rolling a header.
        </TypographyP>
        <TypographyMuted className="mt-2 max-w-3xl text-sm">
          Baseline primitive lives in{" "}
          <code className="text-xs">src/components/ui/container.tsx</code>(
          <code className="text-xs">PageHeader</code>). Typography tokens live in{" "}
          <code className="text-xs">src/components/typography</code>. Breadcrumbs live in{" "}
          <code className="text-xs">src/components/ui/breadcrumb.tsx</code>.
        </TypographyMuted>
        <TypographyMuted className="mt-3 max-w-3xl text-sm">
          Naming convention:{" "}
          <code className="text-xs">page.header.&lt;variant&gt;[.&lt;modifier&gt;]</code>. Each
          variant section includes a copyable reference token, matching the card reference pattern.
        </TypographyMuted>
      </div>
    </Section>
  );
}
