"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";

import { TypographyH2, TypographyH4, TypographyMuted } from "@/components/typography";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader, Section } from "@/components/ui/container";
import { SectionBlock, SectionDivider, SectionLabel } from "@/components/ui/section";

import type { ReactNode } from "react";

const VARIANTS = [
  {
    family: "Section",
    name: "section.block.plain.default",
    use: "Neutral wrapper for standard page sections with no extra visual container.",
  },
  {
    family: "Section",
    name: "section.block.surface.default",
    use: "Prominent grouped area with border and background for scoped content blocks.",
  },
  {
    family: "Section",
    name: "section.block.inset.default",
    use: "Subtle inset treatment when you need grouping without card-level weight.",
  },
  {
    family: "Divider",
    name: "section.divider.line.default",
    use: "Simple horizontal boundary between consecutive sections.",
  },
  {
    family: "Divider",
    name: "section.divider.labeled.default",
    use: "Center-labeled divider for transitions between major content zones.",
  },
  {
    family: "Divider",
    name: "section.divider.inset.default",
    use: "Indented divider that aligns with padded inner content.",
  },
  {
    family: "Label",
    name: "section.label.eyebrow.default",
    use: "Primary eyebrow label above a section heading.",
  },
  {
    family: "Label",
    name: "section.label.kicker.default",
    use: "Neutral kicker label for local subsection titles and module intros.",
  },
];

function VariantReference({ name }: { name: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timeout = window.setTimeout(() => setCopied(false), 1200);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  async function copyName() {
    if (!window.navigator.clipboard) return;
    await window.navigator.clipboard.writeText(name);
    setCopied(true);
  }

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-2 text-xs">
      <span className="text-muted-foreground font-medium">Reference</span>
      <div className="border-border bg-muted/40 text-foreground inline-flex min-w-0 items-center rounded-md border font-mono text-[11px] leading-none">
        <code className="min-w-0 truncate px-2 py-1">{name}</code>
        <button
          type="button"
          className="border-border/70 hover:bg-muted focus-visible:ring-ring/50 inline-flex size-6 shrink-0 items-center justify-center rounded-r-md border-l transition-colors focus-visible:ring-2 focus-visible:outline-none"
          aria-label={`Copy ${name}`}
          title={copied ? "Copied" : "Copy reference name"}
          onClick={copyName}
        >
          {copied ? (
            <Check className="text-success size-3.5" aria-hidden />
          ) : (
            <Copy className="size-3.5" aria-hidden />
          )}
        </button>
      </div>
    </div>
  );
}

function ExampleShell({ name, children }: { name: string; children: ReactNode }) {
  return (
    <div className="space-y-3">
      <VariantReference name={name} />
      {children}
    </div>
  );
}

function VariantCatalog() {
  return (
    <Section spacing="none">
      <div className="mb-6">
        <TypographyH2 className="text-xl font-semibold">Variant catalog</TypographyH2>
        <TypographyMuted className="mt-1 max-w-3xl">
          Stable reference names for section wrappers, dividers, and labels.
        </TypographyMuted>
      </div>

      <div className="bg-card/50 overflow-hidden rounded-lg border">
        <div className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-4 border-b px-4 py-3 text-xs font-medium md:grid-cols-[7rem_minmax(15rem,20rem)_minmax(0,1fr)]">
          <span>Family</span>
          <span>Reference</span>
          <span className="hidden md:block">Use when</span>
        </div>
        <div className="divide-y">
          {VARIANTS.map((variant) => (
            <div
              key={variant.name}
              className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-4 px-4 py-3 md:grid-cols-[7rem_minmax(15rem,20rem)_minmax(0,1fr)]"
            >
              <Badge variant="secondary" className="w-fit self-start font-normal">
                {variant.family}
              </Badge>
              <div className="min-w-0 space-y-2 md:space-y-0">
                <VariantReference name={variant.name} />
                <TypographyMuted className="text-xs md:hidden">{variant.use}</TypographyMuted>
              </div>
              <TypographyMuted className="hidden text-xs leading-relaxed md:block">
                {variant.use}
              </TypographyMuted>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

export default function SectionsAndDividersPage() {
  return (
    <div className="space-y-12 pb-20">
      <PageHeader
        title="Sections And Dividers"
        description="Global section composition patterns for page structure, visual rhythm, and clear boundaries between content groups."
      />

      <div className="space-y-16">
        <Section spacing="none">
          <div className="mb-6">
            <TypographyH2 className="text-xl font-semibold">Section wrappers</TypographyH2>
            <TypographyMuted className="mt-1 max-w-3xl">
              Build page flow with consistent section wrappers before applying heavy card
              structures.
            </TypographyMuted>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <ExampleShell name="section.block.plain.default">
              <SectionBlock variant="plain">
                <SectionLabel variant="eyebrow">Overview</SectionLabel>
                <TypographyH4 className="text-base font-semibold">
                  Season coverage summary
                </TypographyH4>
                <TypographyMuted className="text-sm">
                  Use plain sections for standard body flow where spacing is enough separation.
                </TypographyMuted>
              </SectionBlock>
            </ExampleShell>

            <ExampleShell name="section.block.surface.default">
              <SectionBlock variant="surface">
                <SectionLabel variant="kicker">Tracked Data</SectionLabel>
                <TypographyH4 className="text-base font-semibold">
                  Competition integrity checks
                </TypographyH4>
                <TypographyMuted className="text-sm">
                  Surface sections pull related details into a visually scoped block.
                </TypographyMuted>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Competitions</Badge>
                  <Badge variant="secondary">Grades</Badge>
                  <Badge variant="secondary">Teams</Badge>
                </div>
              </SectionBlock>
            </ExampleShell>

            <ExampleShell name="section.block.inset.default">
              <SectionBlock variant="inset">
                <SectionLabel variant="kicker">Internal Note</SectionLabel>
                <TypographyH4 className="text-base font-semibold">Request preparation</TypographyH4>
                <TypographyMuted className="text-sm">
                  Inset sections are useful for supplemental content that should stay quiet.
                </TypographyMuted>
              </SectionBlock>
            </ExampleShell>
          </div>
        </Section>

        <Section spacing="none">
          <div className="mb-6">
            <TypographyH2 className="text-xl font-semibold">Section dividers</TypographyH2>
            <TypographyMuted className="mt-1 max-w-3xl">
              Divider variants help separate content transitions while preserving layout alignment.
            </TypographyMuted>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <ExampleShell name="section.divider.line.default">
              <div className="space-y-4 rounded-lg border p-5">
                <TypographyH4 className="text-sm font-semibold">Top section</TypographyH4>
                <SectionDivider variant="line" />
                <TypographyH4 className="text-sm font-semibold">Bottom section</TypographyH4>
              </div>
            </ExampleShell>

            <ExampleShell name="section.divider.labeled.default">
              <div className="space-y-4 rounded-lg border p-5">
                <TypographyH4 className="text-sm font-semibold">Coverage checks</TypographyH4>
                <SectionDivider variant="labeled" label="Request Flow" />
                <TypographyH4 className="text-sm font-semibold">Request options</TypographyH4>
              </div>
            </ExampleShell>

            <ExampleShell name="section.divider.inset.default">
              <div className="space-y-4 rounded-lg border py-5">
                <div className="px-5">
                  <TypographyH4 className="text-sm font-semibold">Detail row A</TypographyH4>
                </div>
                <SectionDivider variant="inset" />
                <div className="px-5">
                  <TypographyH4 className="text-sm font-semibold">Detail row B</TypographyH4>
                </div>
              </div>
            </ExampleShell>
          </div>
        </Section>

        <Section spacing="none">
          <div className="mb-6">
            <TypographyH2 className="text-xl font-semibold">Section labels</TypographyH2>
            <TypographyMuted className="mt-1 max-w-3xl">
              Label variants provide lightweight section identity without introducing a full header.
            </TypographyMuted>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <ExampleShell name="section.label.eyebrow.default">
              <SectionBlock variant="surface">
                <SectionLabel variant="eyebrow">Season Route</SectionLabel>
                <TypographyH4 className="text-base font-semibold">Tracking overview</TypographyH4>
                <TypographyMuted className="text-sm">
                  Eyebrow labels are best for high-level category context.
                </TypographyMuted>
              </SectionBlock>
            </ExampleShell>

            <ExampleShell name="section.label.kicker.default">
              <SectionBlock variant="surface">
                <SectionLabel variant="kicker">Lookup Requests</SectionLabel>
                <TypographyH4 className="text-base font-semibold">Next actions</TypographyH4>
                <TypographyMuted className="text-sm">
                  Kicker labels are better for local module naming and tighter UI clusters.
                </TypographyMuted>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline">
                    Fixture lookup
                  </Button>
                  <Button size="sm" variant="outline">
                    Competition lookup
                  </Button>
                </div>
              </SectionBlock>
            </ExampleShell>
          </div>
        </Section>

        <VariantCatalog />
      </div>
    </div>
  );
}
