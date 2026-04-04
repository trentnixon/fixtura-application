import { TypographyH2, TypographyMuted } from "@/components/typography";
import { Section, Surface } from "@/components/ui/container";
import { GridCard, GridCardVisualSlot } from "@/components/ui/grid-card";
import { cn } from "@/lib/utils";

const GRID_CARD_EXAMPLES = [
  {
    id: "organisation",
    title: "Northern District Cricket Club",
    description: "Manage branding, sponsors, content, and organisation settings.",
    ctaLabel: "Open organisation",
    visual: "org" as const,
  },
  {
    id: "add-organisation",
    title: "Create organisation",
    description: "Add a new club, association, or internal workspace to the members area.",
    ctaLabel: "Start setup",
    visual: "add" as const,
  },
  {
    id: "sandbox-link",
    title: "Route Lab",
    description: "Open the page sandbox for route layouts, states, and flow testing.",
    ctaLabel: "Open sandbox",
    visual: "sandbox" as const,
  },
];

export function GridCardExplorationSection() {
  return (
    <Section spacing="none">
      <div className="mb-6">
        <TypographyH2 className="text-xl font-semibold">Grid card</TypographyH2>
        <TypographyMuted className="mt-1 max-w-3xl">
          Square 1×1 tiles for organisation pickers, create/add, and shortcuts. This is the selected
          pattern (ring, shadow, centered title, icon, CTA). The reusable component lives at{" "}
          <span className="font-mono text-xs">@/components/ui/grid-card</span>.
        </TypographyMuted>
      </div>

      <Surface
        className={cn(
          "border-border/80 from-muted/15 to-card relative overflow-hidden p-6 md:p-8",
          "bg-[linear-gradient(to_bottom,rgba(0,0,0,0.02),transparent_40%),radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/0.06),transparent)]",
          "dark:bg-[linear-gradient(to_bottom,rgba(255,255,255,0.03),transparent_40%),radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/0.08),transparent)]",
        )}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35] dark:opacity-[0.2]"
          style={{
            backgroundImage: `
              linear-gradient(to right, hsl(var(--border) / 0.5) 1px, transparent 1px),
              linear-gradient(to bottom, hsl(var(--border) / 0.5) 1px, transparent 1px)
            `,
            backgroundSize: "24px 24px",
          }}
          aria-hidden
        />

        <div className="relative grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {GRID_CARD_EXAMPLES.map((row) => (
            <GridCard
              key={row.id}
              title={row.title}
              description={row.description}
              ctaLabel={row.ctaLabel}
              visual={<GridCardVisualSlot visual={row.visual} />}
            />
          ))}
        </div>
      </Surface>
    </Section>
  );
}
