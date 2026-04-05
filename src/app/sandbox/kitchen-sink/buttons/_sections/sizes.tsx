import { Plus } from "lucide-react";

import { TypographyH2, TypographyMuted } from "@/components/typography";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/ui/container";

import { DemoSurface } from "./demo-surface";

export function SizesSection() {
  return (
    <Section spacing="none">
      <div className="mb-6">
        <TypographyH2 className="text-xl font-semibold">Sizes</TypographyH2>
        <TypographyMuted className="mt-1">
          Default and <code className="text-xs">sm</code> cover most layouts;{" "}
          <code className="text-xs">compact</code> fits dense tables and toolbars;{" "}
          <code className="text-xs">icon</code> for icon-only controls (pair with an accessible
          name).
        </TypographyMuted>
      </div>
      <DemoSurface className="items-end">
        <Button size="compact">Compact</Button>
        <Button size="sm">Small</Button>
        <Button size="default">Default</Button>
        <Button size="lg">Large</Button>
        <Button size="icon" aria-label="Add item">
          <Plus className="size-4" />
        </Button>
      </DemoSurface>
      <div className="mt-6">
        <TypographyMuted className="mb-3 block text-xs font-medium uppercase">
          Full-width (mobile / narrow panels)
        </TypographyMuted>
        <DemoSurface layout="column" className="max-w-md">
          <Button fullWidth variant="default">
            Primary full width
          </Button>
          <Button fullWidth variant="secondary">
            Secondary full width
          </Button>
        </DemoSurface>
      </div>
    </Section>
  );
}
