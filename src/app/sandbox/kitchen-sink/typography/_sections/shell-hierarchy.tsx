import {
  TypographyCardDescription,
  TypographyCardTitle,
  TypographyDisplay,
  TypographyEyebrow,
  TypographyH2,
  TypographyMuted,
  TypographyOverline,
  TypographyPageDescription,
  TypographyPageTitle,
  TypographySectionDescription,
  TypographySectionTitle,
  TypographySubsectionTitle,
} from "@/components/typography";
import { Section } from "@/components/ui/container";

export function ShellHierarchySection() {
  return (
    <Section spacing="none">
      <TypographyH2 className="text-muted-foreground border-border mb-6 border-b pb-2 text-sm font-semibold tracking-wider uppercase">
        Page & section hierarchy
      </TypographyH2>
      <div className="space-y-12">
        <div className="space-y-2">
          <TypographyMuted className="text-xs">Display (rare)</TypographyMuted>
          <TypographyDisplay as="p">Welcome back</TypographyDisplay>
        </div>
        <div className="space-y-2">
          <TypographyEyebrow>Organisation</TypographyEyebrow>
          <TypographyPageTitle as="h2">Dashboard</TypographyPageTitle>
          <TypographyPageDescription>
            High-level summary of fixtures, teams, and upcoming work. Use one primary page title per
            route; adjust <code className="text-xs">as</code> when the shell already provides an{" "}
            <code className="text-xs">h1</code>.
          </TypographyPageDescription>
        </div>
        <div className="space-y-2">
          <TypographyOverline>Settings</TypographyOverline>
          <TypographySectionTitle as="h3">Notifications</TypographySectionTitle>
          <TypographySectionDescription>
            Choose how Fixtura reaches your team. These options apply to this organisation only.
          </TypographySectionDescription>
        </div>
        <div className="space-y-2">
          <TypographySubsectionTitle as="h4">Email digest</TypographySubsectionTitle>
          <TypographyMuted className="text-sm">
            Subsection titles suit nested panels and multi-step forms.
          </TypographyMuted>
        </div>
        <div className="bg-card border-border max-w-md space-y-2 rounded-xl border p-4">
          <TypographyCardTitle as="h3">Card title</TypographyCardTitle>
          <TypographyCardDescription>
            Card descriptions wrap cleanly and stay muted for supporting copy inside tiles and
            panels.
          </TypographyCardDescription>
        </div>
      </div>
    </Section>
  );
}
