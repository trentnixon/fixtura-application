import { TypographyH2, TypographyMuted } from "@/components/typography";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/ui/container";

import { DemoSurface } from "./demo-surface";

export function ExperimentalSection() {
  return (
    <Section spacing="none">
      <div className="mb-6">
        <TypographyH2 className="text-xl font-semibold">Experimental</TypographyH2>
        <TypographyMuted className="mt-1">
          Candidates for future semantic variants — not approved defaults. Validate contrast and
          usage with design before promoting to production or adding new CVA variants.
        </TypographyMuted>
      </div>
      <DemoSurface>
        <Button
          variant="outline"
          className="border-[var(--brand-secondary)]/40 text-[var(--brand-secondary)] hover:bg-[var(--brand-secondary)]/10"
        >
          Subtle teal outline
        </Button>
        <Button
          variant="outline"
          className="border-[var(--brand-accent)]/40 text-[var(--brand-accent)] hover:bg-[var(--brand-accent)]/10"
        >
          Subtle orange outline
        </Button>
        <Button
          variant="ghost"
          className="text-[var(--brand-secondary)] hover:bg-[var(--brand-secondary)]/10"
        >
          Teal ghost
        </Button>
        <Button
          variant="ghost"
          className="text-[var(--brand-accent)] hover:bg-[var(--brand-accent)]/10"
        >
          Orange ghost
        </Button>
      </DemoSurface>
    </Section>
  );
}
