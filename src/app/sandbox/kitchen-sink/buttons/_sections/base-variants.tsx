import { TypographyH2, TypographyMuted } from "@/components/typography";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/ui/container";

import { DemoSurface } from "./demo-surface";

export function BaseVariantsSection() {
  return (
    <Section spacing="none">
      <div className="mb-6">
        <TypographyH2 className="text-xl font-semibold">Base variants</TypographyH2>
        <TypographyMuted className="mt-1">
          Standard shadcn-aligned variants extended for Fixtura. Choose by hierarchy, not by colour
          alone.
        </TypographyMuted>
      </div>
      <DemoSurface>
        <Button variant="default">Default</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="link">Link</Button>
      </DemoSurface>
    </Section>
  );
}
