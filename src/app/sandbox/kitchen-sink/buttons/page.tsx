import { Loader2, Mail, Plus, ArrowRight, Trash2 } from "lucide-react";

import { TypographyH2, TypographyMuted } from "@/components/typography";
import { Button } from "@/components/ui/button";
import { PageHeader, Section } from "@/components/ui/container";

export default function ButtonsPage() {
  return (
    <div className="space-y-12">
      <PageHeader
        title="Buttons"
        description="Buttons are used to trigger actions and navigation. They should be used consistently throughout the application to signify interactive elements."
      />

      <div className="space-y-16">
        <Section spacing="none">
          <div className="mb-6">
            <TypographyH2 className="text-xl font-semibold">Variants</TypographyH2>
            <TypographyMuted className="mt-1">
              Our standard set of button styles for different hierarchical needs.
            </TypographyMuted>
          </div>
          <div className="bg-card/50 flex flex-wrap items-center gap-4 rounded-xl border p-8">
            <Button variant="default">Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="link">Link</Button>
          </div>
        </Section>

        <Section spacing="none">
          <div className="mb-6">
            <TypographyH2 className="text-xl font-semibold">Sizes</TypographyH2>
            <TypographyMuted className="mt-1">
              Four standard sizes to handle different layout constraints.
            </TypographyMuted>
          </div>
          <div className="bg-card/50 flex flex-wrap items-end gap-4 rounded-xl border p-8">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
            <Button size="icon">
              <Plus className="size-4" />
            </Button>
          </div>
        </Section>

        <Section spacing="none">
          <div className="mb-6">
            <TypographyH2 className="text-xl font-semibold">Brand & Accent Extensions</TypographyH2>
            <TypographyMuted className="mt-1">
              Leveraging our custom secondary (Teal) and accent (Orange) scales.
            </TypographyMuted>
          </div>
          <div className="bg-card/50 flex flex-wrap items-center gap-4 rounded-xl border p-8">
            <Button variant="brand">Teal Brand (Secondary)</Button>
            <Button variant="accent">Orange Accent</Button>
          </div>
        </Section>

        <Section spacing="none">
          <div className="mb-6">
            <TypographyH2 className="text-xl font-semibold">States & Composition</TypographyH2>
            <TypographyMuted className="mt-1">
              Handling loading states, icons, and interactions.
            </TypographyMuted>
          </div>
          <div className="bg-card/50 flex flex-wrap items-center gap-4 rounded-xl border p-8">
            <Button disabled>Disabled</Button>
            <Button>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Please wait
            </Button>
            <Button variant="outline">
              <Mail className="mr-2 h-4 w-4" /> Login with Email
            </Button>
            <Button variant="secondary">
              Next Step <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="destructive">
              <Trash2 className="mr-2 h-5 w-5" /> Delete Account
            </Button>
          </div>
        </Section>
      </div>
    </div>
  );
}
