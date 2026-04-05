import { ArrowRight, Bell, Pencil, Trash2 } from "lucide-react";

import { TypographyH2, TypographyMuted } from "@/components/typography";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/ui/container";

import { DemoSurface } from "./demo-surface";

export function IconsA11ySection() {
  return (
    <Section spacing="none">
      <div className="mb-6">
        <TypographyH2 className="text-xl font-semibold">Icons and accessibility</TypographyH2>
        <TypographyMuted className="mt-1">
          Leading icons support scanning; trailing icons often signal forward navigation. Icon-only
          buttons must expose a name via <code className="text-xs">aria-label</code> or visually
          hidden text — never rely on the icon glyph alone.
        </TypographyMuted>
      </div>
      <DemoSurface>
        <Button variant="default">
          <Pencil className="size-4" aria-hidden />
          Edit project
        </Button>
        <Button variant="secondary">
          Next step
          <ArrowRight className="size-4" aria-hidden />
        </Button>
        <Button variant="outline" size="icon" aria-label="Edit row">
          <Pencil className="size-4" />
        </Button>
        <Button variant="destructive" size="icon" aria-label="Delete row">
          <Trash2 className="size-4" />
        </Button>
        <Button variant="ghost" size="icon">
          <Bell className="size-4" />
          <span className="sr-only">Open notifications</span>
        </Button>
      </DemoSurface>
    </Section>
  );
}
