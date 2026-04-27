"use client";

import {
  CalendarClock,
  Check,
  ChevronRight,
  Copy,
  FileText,
  Info,
  ListChecks,
  Megaphone,
  Plus,
  ShieldCheck,
  SlidersHorizontal,
  Trophy,
} from "lucide-react";
import { useEffect, useState } from "react";

import { TypographyH2, TypographyH4, TypographyMuted } from "@/components/typography";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader, Section } from "@/components/ui/container";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

import type { ReactNode } from "react";

const NAMING_EXAMPLES = [
  "container.block.plain.default",
  "container.block.subtle.default",
  "container.header.title-subtitle.default",
  "container.group.divided.default",
  "container.strip.toolbar.default",
  "container.callout.info.default",
];

const CONTAINER_VARIATIONS = [
  {
    category: "Block",
    name: "container.block.plain.default",
    use: "Neutral wrapper for compact summaries, small metric groups, and simple page modules.",
  },
  {
    category: "Block",
    name: "container.block.subtle.default",
    use: "Muted/tinted grouping for lightweight notes, queues, and control clusters.",
  },
  {
    category: "Block",
    name: "container.block.bordered.default",
    use: "Dashed boundary for upload areas, placeholders, requirements, and setup prompts.",
  },
  {
    category: "Block",
    name: "container.block.flush.default",
    use: "Bordered shell where the inner content already provides row or grid structure.",
  },
  {
    category: "Header",
    name: "container.header.title-subtitle.default",
    use: "Local title and subtitle above nearby content without introducing a card.",
  },
  {
    category: "Header",
    name: "container.header.action-row.default",
    use: "Title/subtitle plus one primary local action for editing or creation flows.",
  },
  {
    category: "Header",
    name: "container.header.meta-row.default",
    use: "Title/subtitle paired with timing, owner, status, or other compact metadata.",
  },
  {
    category: "Header",
    name: "container.header.stacked-actions.default",
    use: "Header followed by a wrapping action row when multiple controls are needed.",
  },
  {
    category: "Group",
    name: "container.group.divided.default",
    use: "Short related rows separated by borders when a list component would feel too formal.",
  },
  {
    category: "Group",
    name: "container.group.inset.default",
    use: "Inset panel inside a muted parent for small property lists or grouped settings.",
  },
  {
    category: "Group",
    name: "container.group.split.default",
    use: "Two-zone layout pairing explanation with a compact detail rail or summary.",
  },
  {
    category: "Group",
    name: "container.group.summary-grid.default",
    use: "Small metric grid inside a page section where dashboard cards would be too heavy.",
  },
  {
    category: "Strip",
    name: "container.strip.toolbar.default",
    use: "Horizontal utility row for filters, segmented actions, and page-level tools.",
  },
  {
    category: "Strip",
    name: "container.strip.announcement.default",
    use: "Inline announcement or timely prompt that belongs in page flow.",
  },
  {
    category: "Callout",
    name: "container.callout.info.default",
    use: "Low-friction informational feedback that should not interrupt the workflow.",
  },
  {
    category: "Callout",
    name: "container.callout.success.default",
    use: "Positive confirmation or completed-check messaging inside the page.",
  },
  {
    category: "State",
    name: "container.state.empty.default",
    use: "Quiet empty state with a single optional next action.",
  },
];

const summaryRows = [
  ["Fixtures generated", "48"],
  ["Teams matched", "12"],
  ["Venues checked", "6"],
];

const dividedRows = [
  ["Season registration", "Open until 30 April", "Ready"],
  ["Fixture publish", "Draft review required", "Review"],
  ["Sponsor assets", "3 uploads pending", "Pending"],
];

const insetRows = [
  ["Primary contact", "Alex Chen"],
  ["Billing email", "accounts@northside.example"],
  ["Default timezone", "Australia/Sydney"],
];

function ContainerReferenceName({ name }: { name: string }) {
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

function CatalogSeparator({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4 py-2" aria-hidden>
      <Separator className="flex-1" />
      <span className="text-muted-foreground font-mono text-[10px] tracking-widest uppercase">
        {label}
      </span>
      <Separator className="flex-1" />
    </div>
  );
}

function ExampleShell({
  name,
  children,
  className,
}: {
  name: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-3", className)}>
      <ContainerReferenceName name={name} />
      {children}
    </div>
  );
}

function LocalHeading({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
      <div className="min-w-0 space-y-1">
        <TypographyH4 className="text-sm font-semibold">{title}</TypographyH4>
        {subtitle ? <TypographyMuted className="text-xs">{subtitle}</TypographyMuted> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

function NamingGuidance() {
  return (
    <Section spacing="none">
      <div className="mb-6">
        <TypographyH2 className="text-xl font-semibold">Container naming convention</TypographyH2>
        <TypographyMuted className="mt-1 max-w-3xl">
          Use dot-separated handles in the shape container.category.variant.state. The category
          should describe the job, the variant should describe the visual treatment, and the state
          should stay stable even as copy or example data changes.
        </TypographyMuted>
      </div>

      <div className="bg-card/50 space-y-6 rounded-lg border p-6">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {NAMING_EXAMPLES.map((name) => (
            <ContainerReferenceName key={name} name={name} />
          ))}
        </div>
        <Separator />
        <TypographyMuted className="max-w-3xl text-xs">
          Use these when a card would add unnecessary weight: small groupings, lightweight module
          boundaries, local section headers, inline status areas, toolbar rows, and simple state
          messages. Prefer cards when the whole block is a distinct object, entry point, or repeated
          item.
        </TypographyMuted>
      </div>
    </Section>
  );
}

function VariationList() {
  return (
    <Section spacing="none">
      <div className="mb-6">
        <TypographyH2 className="text-xl font-semibold">Container variation list</TypographyH2>
        <TypographyMuted className="mt-1 max-w-3xl">
          Built variants that can be referenced directly in prompts. Each row maps to a live example
          above.
        </TypographyMuted>
      </div>

      <div className="bg-card/50 overflow-hidden rounded-lg border">
        <div className="grid grid-cols-[7rem_minmax(0,1fr)] gap-4 border-b px-4 py-3 text-xs font-medium md:grid-cols-[8rem_minmax(16rem,22rem)_minmax(0,1fr)]">
          <span>Family</span>
          <span>Reference</span>
          <span className="hidden md:block">Use when</span>
        </div>
        <div className="divide-y">
          {CONTAINER_VARIATIONS.map((variation) => (
            <div
              key={variation.name}
              className="grid grid-cols-[7rem_minmax(0,1fr)] gap-4 px-4 py-3 md:grid-cols-[8rem_minmax(16rem,22rem)_minmax(0,1fr)]"
            >
              <Badge variant="secondary" className="w-fit self-start font-normal">
                {variation.category}
              </Badge>
              <div className="min-w-0 space-y-2 md:space-y-0">
                <ContainerReferenceName name={variation.name} />
                <TypographyMuted className="text-xs md:hidden">{variation.use}</TypographyMuted>
              </div>
              <TypographyMuted className="hidden text-xs leading-relaxed md:block">
                {variation.use}
              </TypographyMuted>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

export default function ContainersPage() {
  return (
    <div className="space-y-12 pb-20">
      <PageHeader
        title="Containers"
        description="Lightweight structural patterns for grouping content when a full card is too heavy. Each example has a stable reference name for future implementation prompts."
      />

      <div className="space-y-16">
        <CatalogSeparator label="Basic content blocks" />

        <Section spacing="none">
          <div className="mb-6">
            <TypographyH2 className="text-xl font-semibold">Content block containers</TypographyH2>
            <TypographyMuted className="mt-1 max-w-3xl">
              Low-emphasis containers for grouping a few related elements without creating a strong
              card object.
            </TypographyMuted>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <ExampleShell name="container.block.plain.default">
              <div className="bg-background rounded-lg border p-5">
                <LocalHeading
                  title="Publishing summary"
                  subtitle="Small neutral wrapper for compact page modules."
                />
                <div className="mt-5 grid grid-cols-3 gap-3">
                  {summaryRows.map(([label, value]) => (
                    <div key={label} className="space-y-1">
                      <div className="text-2xl font-semibold tracking-tight">{value}</div>
                      <TypographyMuted className="text-xs">{label}</TypographyMuted>
                    </div>
                  ))}
                </div>
              </div>
            </ExampleShell>

            <ExampleShell name="container.block.subtle.default">
              <div className="bg-muted/35 rounded-lg border border-transparent p-5">
                <LocalHeading
                  title="Review queue"
                  subtitle="Tinted boundary for related controls or lightweight dashboard notes."
                  action={<Badge variant="secondary">3 open</Badge>}
                />
                <div className="mt-5 flex flex-wrap gap-2">
                  {["Fixture draft", "Venue map", "Sponsor lockup"].map((item) => (
                    <Badge key={item} variant="outline" className="font-normal">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            </ExampleShell>

            <ExampleShell name="container.block.bordered.default">
              <div className="bg-background rounded-lg border border-dashed p-5">
                <LocalHeading
                  title="Upload requirements"
                  subtitle="Dashed treatment for drop zones, setup requirements, or placeholders."
                />
                <div className="text-muted-foreground mt-5 flex items-center gap-3 text-xs">
                  <FileText className="size-4 shrink-0" aria-hidden />
                  PNG, JPG, or SVG up to 8 MB
                </div>
              </div>
            </ExampleShell>

            <ExampleShell name="container.block.flush.default">
              <div className="bg-background rounded-lg border">
                <div className="px-5 py-4">
                  <LocalHeading
                    title="Fixture checks"
                    subtitle="Flush content when the interior already supplies row structure."
                  />
                </div>
                <Separator />
                <div className="grid grid-cols-3 divide-x text-center">
                  {["Conflicts", "Byes", "Venues"].map((label, index) => (
                    <div key={label} className="px-3 py-4">
                      <div className="text-sm font-semibold">{index === 0 ? "0" : index + 1}</div>
                      <TypographyMuted className="text-[11px]">{label}</TypographyMuted>
                    </div>
                  ))}
                </div>
              </div>
            </ExampleShell>
          </div>
        </Section>

        <CatalogSeparator label="Title and subtitle containers" />

        <Section spacing="none">
          <div className="mb-6">
            <TypographyH2 className="text-xl font-semibold">Header containers</TypographyH2>
            <TypographyMuted className="mt-1 max-w-3xl">
              Use these when a local title and subtitle need to introduce nearby content without the
              weight of a card header.
            </TypographyMuted>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <ExampleShell name="container.header.title-subtitle.default">
              <div className="space-y-4 rounded-lg border-b pb-5">
                <LocalHeading
                  title="Season setup"
                  subtitle="A simple heading group above a form, list, or generated preview."
                />
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">League</Badge>
                  <Badge variant="secondary">Teams</Badge>
                  <Badge variant="secondary">Venues</Badge>
                </div>
              </div>
            </ExampleShell>

            <ExampleShell name="container.header.action-row.default">
              <div className="bg-background rounded-lg border px-5 py-4">
                <LocalHeading
                  title="Template bundle"
                  subtitle="Header plus one clear action for local editing flows."
                  action={
                    <Button size="sm" variant="outline">
                      <Plus className="size-4" />
                      Add
                    </Button>
                  }
                />
              </div>
            </ExampleShell>

            <ExampleShell name="container.header.meta-row.default">
              <div className="bg-background rounded-lg border p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <LocalHeading
                    title="Round 4 publishing"
                    subtitle="Metadata sits beside the heading when timing or ownership matters."
                  />
                  <div className="text-muted-foreground flex items-center gap-2 text-xs">
                    <CalendarClock className="size-4" aria-hidden />
                    Monday 9:00 AM
                  </div>
                </div>
              </div>
            </ExampleShell>

            <ExampleShell name="container.header.stacked-actions.default">
              <div className="bg-background rounded-lg border p-5">
                <LocalHeading
                  title="Organisation profile"
                  subtitle="Use a wrapping action row when secondary controls may overflow."
                />
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button size="sm" variant="brand">
                    Save
                  </Button>
                  <Button size="sm" variant="outline">
                    Preview
                  </Button>
                  <Button size="sm" variant="ghost">
                    Reset
                  </Button>
                </div>
              </div>
            </ExampleShell>
          </div>
        </Section>

        <CatalogSeparator label="Grouped content containers" />

        <Section spacing="none">
          <div className="mb-6">
            <TypographyH2 className="text-xl font-semibold">
              Grouped content containers
            </TypographyH2>
            <TypographyMuted className="mt-1 max-w-3xl">
              Containers for small sets of related rows, summaries, and split content blocks.
            </TypographyMuted>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <ExampleShell name="container.group.divided.default">
              <div className="bg-background rounded-lg border">
                {dividedRows.map(([title, description, status], index) => (
                  <div key={title}>
                    {index > 0 ? <Separator /> : null}
                    <div className="flex items-center justify-between gap-4 px-5 py-4">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">{title}</div>
                        <TypographyMuted className="text-xs">{description}</TypographyMuted>
                      </div>
                      <Badge
                        variant={status === "Ready" ? "secondary" : "outline"}
                        className="shrink-0 font-normal"
                      >
                        {status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </ExampleShell>

            <ExampleShell name="container.group.inset.default">
              <div className="bg-muted/30 rounded-lg p-2">
                <div className="bg-background rounded-md border">
                  {insetRows.map(([label, value], index) => (
                    <div key={label}>
                      {index > 0 ? <Separator /> : null}
                      <div className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
                        <span className="text-muted-foreground">{label}</span>
                        <span className="min-w-0 truncate font-medium">{value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ExampleShell>

            <ExampleShell name="container.group.split.default">
              <div className="bg-background rounded-lg border p-5">
                <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_14rem]">
                  <LocalHeading
                    title="Match day content"
                    subtitle="Split containers pair a short description with a compact detail rail."
                  />
                  <div className="bg-muted/40 rounded-md p-4">
                    <div className="text-sm font-semibold">8 assets</div>
                    <TypographyMuted className="text-xs">Ready for export</TypographyMuted>
                  </div>
                </div>
              </div>
            </ExampleShell>

            <ExampleShell name="container.group.summary-grid.default">
              <div className="bg-background rounded-lg border p-5">
                <LocalHeading
                  title="Club health"
                  subtitle="A compact metric group inside a page."
                />
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {[
                    ["Active teams", "24"],
                    ["Open tasks", "7"],
                    ["Scheduled posts", "16"],
                    ["Failed syncs", "0"],
                  ].map(([label, value]) => (
                    <div key={label} className="bg-muted/35 rounded-md px-3 py-3">
                      <div className="text-lg font-semibold">{value}</div>
                      <TypographyMuted className="text-[11px]">{label}</TypographyMuted>
                    </div>
                  ))}
                </div>
              </div>
            </ExampleShell>
          </div>
        </Section>

        <CatalogSeparator label="Operational containers" />

        <Section spacing="none">
          <div className="mb-6">
            <TypographyH2 className="text-xl font-semibold">Operational containers</TypographyH2>
            <TypographyMuted className="mt-1 max-w-3xl">
              Lightweight wrappers for page tools, inline feedback, and empty states.
            </TypographyMuted>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <ExampleShell name="container.strip.toolbar.default">
              <div className="bg-muted/35 flex flex-wrap items-center justify-between gap-3 rounded-lg border px-4 py-3">
                <div className="flex min-w-0 items-center gap-2">
                  <SlidersHorizontal className="text-muted-foreground size-4" aria-hidden />
                  <span className="truncate text-sm font-medium">Filter generated assets</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline">
                    Draft
                  </Button>
                  <Button size="sm" variant="outline">
                    Published
                  </Button>
                </div>
              </div>
            </ExampleShell>

            <ExampleShell name="container.callout.info.default">
              <div className="border-primary/20 bg-primary/5 text-primary rounded-lg border px-5 py-4">
                <div className="flex gap-3">
                  <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
                  <div className="min-w-0 space-y-1">
                    <div className="text-sm font-semibold">Sync scheduled</div>
                    <p className="text-primary/80 text-xs leading-relaxed">
                      Fixture updates will be pulled into the publishing queue at the next interval.
                    </p>
                  </div>
                </div>
              </div>
            </ExampleShell>

            <ExampleShell name="container.callout.success.default">
              <div className="border-success/25 bg-success/5 text-success rounded-lg border px-5 py-4">
                <div className="flex gap-3">
                  <ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden />
                  <div className="min-w-0 space-y-1">
                    <div className="text-sm font-semibold">All checks passed</div>
                    <p className="text-success/80 text-xs leading-relaxed">
                      The selected bundle can be published without manual review.
                    </p>
                  </div>
                </div>
              </div>
            </ExampleShell>

            <ExampleShell name="container.state.empty.default">
              <div className="bg-background rounded-lg border border-dashed px-6 py-8 text-center">
                <div className="bg-muted mx-auto flex size-10 items-center justify-center rounded-full">
                  <ListChecks className="text-muted-foreground size-5" aria-hidden />
                </div>
                <TypographyH4 className="mt-4 text-sm font-semibold">No tasks queued</TypographyH4>
                <TypographyMuted className="mx-auto mt-1 max-w-sm text-xs">
                  Empty state containers should be quiet, centered, and only offer an action when
                  the next step is obvious.
                </TypographyMuted>
                <Button className="mt-4" size="sm" variant="outline">
                  <Plus className="size-4" />
                  Add task
                </Button>
              </div>
            </ExampleShell>

            <ExampleShell name="container.strip.announcement.default" className="lg:col-span-2">
              <div className="from-primary/10 via-background to-success/10 rounded-lg border bg-gradient-to-r px-5 py-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <Megaphone className="text-primary size-4 shrink-0" aria-hidden />
                    <div className="min-w-0">
                      <div className="text-sm font-semibold">Round templates are ready</div>
                      <TypographyMuted className="text-xs">
                        Use announcement strips for timely information that belongs in page flow.
                      </TypographyMuted>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    <Trophy className="size-4" />
                    Review
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            </ExampleShell>
          </div>
        </Section>

        <VariationList />

        <NamingGuidance />
      </div>
    </div>
  );
}
