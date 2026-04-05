import { Loader2, Mail } from "lucide-react";

import { TypographyH2, TypographyMuted } from "@/components/typography";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/ui/container";

import { DemoSurface } from "./demo-surface";

export function StatesSection() {
  return (
    <Section spacing="none">
      <div className="mb-6">
        <TypographyH2 className="text-xl font-semibold">States</TypographyH2>
        <TypographyMuted className="mt-1">
          Disabled state is not communicated by colour alone (opacity + no pointer). Use the{" "}
          <code className="text-xs">loading</code> prop for pending work: it sets{" "}
          <code className="text-xs">aria-busy</code>, disables the control, and shows a spinner.
          Keyboard users should see a clear <code className="text-xs">focus-visible</code> ring —
          tab through the samples below.
        </TypographyMuted>
      </div>
      <DemoSurface>
        <Button variant="default">Default</Button>
        <Button variant="default" disabled>
          Disabled
        </Button>
        <Button loading loadingText="Saving...">
          Save
        </Button>
        <Button variant="outline" loading>
          Continue
        </Button>
        <Button variant="destructive" loading loadingText="Deleting...">
          Delete
        </Button>
      </DemoSurface>
      <div className="mt-6">
        <TypographyMuted className="mb-3 block text-xs font-medium uppercase">
          Manual composition (equivalent to loading prop)
        </TypographyMuted>
        <DemoSurface>
          <Button disabled>
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Please wait
          </Button>
          <Button variant="outline">
            <Mail className="size-4" aria-hidden />
            Login with Email
          </Button>
        </DemoSurface>
      </div>
    </Section>
  );
}
