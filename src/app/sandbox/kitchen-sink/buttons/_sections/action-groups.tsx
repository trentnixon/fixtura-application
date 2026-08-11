import { TypographyH2, TypographyMuted } from "@/components/typography";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/ui/container";

import { DemoSurface } from "./demo-surface";

export function ActionGroupsSection() {
  return (
    <Section spacing="none">
      <div className="mb-6">
        <TypographyH2 className="text-xl font-semibold">Action groups</TypographyH2>
        <TypographyMuted className="mt-1">
          Use a single primary per group. In dialogs, secondary actions sit before primary (reading
          order); destructive pairs often use outline/ghost cancel and destructive confirm. Leave
          comfortable gap between adjacent actions (<code className="text-xs">gap-2</code> to{" "}
          <code className="text-xs">gap-3</code>).
        </TypographyMuted>
      </div>
      <div className="space-y-8">
        <div>
          <TypographyMuted className="mb-3 block text-xs font-medium uppercase">
            Cancel / save
          </TypographyMuted>
          <DemoSurface>
            <Button variant="secondary">Cancel</Button>
            <Button variant="default">Save changes</Button>
          </DemoSurface>
        </div>
        <div>
          <TypographyMuted className="mb-3 block text-xs font-medium uppercase">
            Back / continue
          </TypographyMuted>
          <DemoSurface>
            <Button variant="outline">Back</Button>
            <Button variant="default">Continue</Button>
          </DemoSurface>
        </div>
        <div>
          <TypographyMuted className="mb-3 block text-xs font-medium uppercase">
            Dismiss / retry
          </TypographyMuted>
          <DemoSurface>
            <Button variant="ghost">Dismiss</Button>
            <Button variant="brand">Retry</Button>
          </DemoSurface>
        </div>
        <div>
          <TypographyMuted className="mb-3 block text-xs font-medium uppercase">
            Cancel / delete
          </TypographyMuted>
          <DemoSurface>
            <Button variant="secondary">Cancel</Button>
            <Button variant="destructive">Delete</Button>
          </DemoSurface>
        </div>
        <div>
          <TypographyMuted className="mb-3 block text-xs font-medium uppercase">
            Stacked (narrow / mobile)
          </TypographyMuted>
          <DemoSurface layout="column" className="max-w-xs">
            <Button fullWidth variant="destructive">
              Delete project
            </Button>
            <Button fullWidth variant="secondary">
              Cancel
            </Button>
          </DemoSurface>
        </div>
      </div>
    </Section>
  );
}
