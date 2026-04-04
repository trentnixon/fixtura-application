import {
  TypographyH2,
  TypographyH4,
  TypographyInlineCode,
  TypographyMuted,
} from "@/components/typography";
import { Button } from "@/components/ui/button";
import { Container, Section, PageHeader, Surface } from "@/components/ui/container";

export default function ContainersPage() {
  return (
    <div className="space-y-12">
      <PageHeader
        title="Containers & Layout"
        description="Our structural foundation ensures items are correctly aligned and spaced within the application viewport."
      >
        <Button variant="outline" size="sm">
          Doc Reference
        </Button>
      </PageHeader>

      <section className="space-y-10">
        <div>
          <TypographyH2 className="text-muted-foreground border-border mb-6 border-b pb-2 text-sm font-semibold tracking-wider uppercase">
            Reusable Container Components
          </TypographyH2>
          <div className="max-w-4xl space-y-8">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <code className="bg-muted rounded p-1 px-2 text-xs">{"<PageContainer />"}</code>
                <span className="text-muted-foreground font-mono text-[10px]">
                  Max: 1280px / 7xl
                </span>
              </div>
              <TypographyMuted>
                The standard wrapper for all high-level page content. It handles both responsive
                horizontal padding and the maximum width of the application area.
              </TypographyMuted>
              <div className="border-primary/40 bg-primary/5 rounded-lg border border-dashed p-2">
                <Container className="bg-primary/10 border-primary/20 text-primary rounded border p-4 text-center text-xs font-medium">
                  Actual Page Container Visualized
                </Container>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <code className="bg-muted rounded p-1 px-2 text-xs">{"<Section />"}</code>
                <span className="text-muted-foreground text-success-600 font-mono text-[10px] font-bold">
                  Recommended for spacing
                </span>
              </div>
              <TypographyMuted>
                Used to create consistent vertical rhythm between content blocks. It supports{" "}
                <TypographyInlineCode>sm</TypographyInlineCode>,{" "}
                <TypographyInlineCode>md</TypographyInlineCode>, and{" "}
                <TypographyInlineCode>lg</TypographyInlineCode> spacing variants.
              </TypographyMuted>
              <div className="bg-muted/30 overflow-hidden rounded-lg border">
                <Section
                  spacing="sm"
                  className="bg-success/5 border-success/30 border-b border-dashed px-6"
                >
                  <div className="text-success-700 font-mono text-xs">Section (spacing="sm")</div>
                </Section>
                <Section
                  spacing="md"
                  className="bg-success/10 border-success/30 border-b border-dashed px-6"
                >
                  <div className="text-success-700 font-mono text-xs">
                    Section (spacing="md" - Default)
                  </div>
                </Section>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <code className="bg-muted rounded p-1 px-2 text-xs">{"<Surface />"}</code>
                <span className="text-muted-foreground font-mono text-[10px]">Rounded: 2xl</span>
              </div>
              <TypographyMuted>
                A foundational content block with background color and soft border. Usually placed
                inside Sections.
              </TypographyMuted>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Surface className="text-muted-foreground flex h-32 items-center justify-center text-sm italic">
                  Default Surface
                </Surface>
                <Surface className="bg-secondary border-secondary flex h-32 items-center justify-center">
                  <div className="text-foreground font-semibold">Themed Surface</div>
                </Surface>
              </div>
            </div>
          </div>
        </div>

        <div>
          <TypographyH2 className="text-muted-foreground border-border mb-6 border-b pb-2 text-sm font-semibold tracking-wider uppercase">
            Width Constraints
          </TypographyH2>
          <div className="space-y-8">
            <div className="space-y-2">
              <TypographyH4 className="text-sm font-semibold">Full Width</TypographyH4>
              <TypographyMuted className="mb-4 text-xs">
                Spans the entire available parent width. Use for major structural dividers or
                background bleeds.
              </TypographyMuted>
              <div className="bg-primary/10 border-primary/30 text-primary flex h-12 w-full items-center justify-center border-x font-mono text-[10px] select-none">
                w-full
              </div>
            </div>

            <div className="space-y-4">
              <TypographyH4 className="text-sm font-semibold">Constrained Widths</TypographyH4>
              <TypographyMuted className="mb-4 text-xs">
                Use these utility classes to constrain content for better readability, especially in
                text-heavy or form-focused areas.
              </TypographyMuted>

              <div className="bg-muted/20 space-y-4 rounded-xl border border-dashed p-6">
                <div className="bg-primary/20 border-primary/40 text-primary flex h-10 max-w-6xl items-center rounded border px-4 font-mono text-[10px] shadow-sm">
                  max-w-6xl
                </div>
                <div className="bg-primary/20 border-primary/40 text-primary flex h-10 max-w-3xl items-center rounded border px-4 font-mono text-[10px] shadow-sm">
                  max-w-3xl
                </div>
                <div className="bg-primary/20 border-primary/40 text-primary flex h-10 max-w-2xl items-center rounded border px-4 font-mono text-[10px] shadow-sm">
                  max-w-2xl
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <TypographyH2 className="text-muted-foreground border-border mb-6 border-b pb-2 text-sm font-semibold tracking-wider uppercase">
            Spacing Guidelines
          </TypographyH2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <TypographyH4 className="text-sm font-semibold">Related Elements</TypographyH4>
              <TypographyMuted className="text-xs leading-relaxed">
                Use <code className="font-mono text-xs">gap-2</code> or{" "}
                <code className="font-mono text-xs">gap-4</code> for tightly coupled elements like a
                label and an input, or a set of buttons.
              </TypographyMuted>
            </div>
            <div className="space-y-2">
              <TypographyH4 className="text-sm font-semibold">Sub-sections</TypographyH4>
              <TypographyMuted className="text-xs leading-relaxed">
                Use <code className="font-mono text-xs">space-y-6</code> or{" "}
                <code className="font-mono text-xs">space-y-8</code> for grouping logically related
                content cards or blocks.
              </TypographyMuted>
            </div>
            <div className="space-y-2">
              <TypographyH4 className="text-sm font-semibold">Major Milestones</TypographyH4>
              <TypographyMuted className="text-xs leading-relaxed">
                Use the{" "}
                <code className="text-primary font-mono text-xs font-bold">{"<Section />"}</code>{" "}
                component for page-level breaks, ensuring the vertical rhythm remains stable across
                the whole app.
              </TypographyMuted>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
