import { TypographyH2, TypographyMuted } from "@/components/typography";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/ui/container";

import { DemoSurface } from "./demo-surface";

export function BrandExtensionsSection() {
  return (
    <Section spacing="none">
      <div className="mb-6">
        <TypographyH2 className="text-xl font-semibold">Brand extensions</TypographyH2>
        <TypographyMuted className="mt-1">
          Level 5 emphasis: <strong className="text-foreground">brand</strong> for product-forward
          CTAs; <strong className="text-foreground">accent</strong> for promotional or upgrade-style
          moments. Do not use accent for destructive work.
        </TypographyMuted>
      </div>
      <DemoSurface>
        <Button variant="brand">Teal brand CTA</Button>
        <Button variant="accent">Orange accent CTA</Button>
      </DemoSurface>
    </Section>
  );
}
