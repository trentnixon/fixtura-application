import {
  TrendingUp,
  Users,
  MoreVertical,
  CircleCheck,
  Clock,
  ImageIcon,
  ListChecks,
  Sparkles,
  SlidersHorizontal,
  PanelTop,
  Filter,
  Info,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Scale,
  Trophy,
  FileText,
  ClipboardCheck,
  ShieldCheck,
} from "lucide-react";

import { MetricComparisonCard } from "@/components/cards";
import { TypographyH2, TypographyH3, TypographyH4, TypographyMuted } from "@/components/typography";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter, CardAction } from "@/components/ui/card";
import { PageHeader, Section, Surface } from "@/components/ui/container";
import { Separator } from "@/components/ui/separator";

import { CardReferenceName } from "./card-reference-name";
import { FeedbackCardsSection } from "./feedback-cards-section";
import { GridCardExplorationSection } from "./grid-card-exploration";

const NAMING_RULES = [
  "card.standard.action",
  "card.surface.settings",
  "card.metric.compact",
  "card.metric.comparison-card",
  "card.metric.comparison-card.body-prose",
  "card.metric.comparison-card.body-checklist",
  "card.metric.comparison-card.body-inline-meta",
  "card.composite.split-action",
  "card.feedback.soft.info",
  "card.grid.default.org-initials",
];

const HEADER_FOOTER_OPTIONS = [
  {
    option: "title",
    defaultValue: "Visible heading, left aligned, foreground color.",
    notes: "Supports alignment and color overrides.",
  },
  {
    option: "subtitle",
    defaultValue: "Optional supporting text, left aligned, muted color.",
    notes: "Supports alignment and color overrides.",
  },
  {
    option: "ctaButton",
    defaultValue: "Optional. Hidden when no action is supplied.",
    notes: "When present, aligns right in the header or footer action area.",
  },
  {
    option: "ctaIcon",
    defaultValue: "Optional. Hidden when no icon action is supplied.",
    notes: "Icon-only action aligns right and must include an accessible label.",
  },
  {
    option: "icon",
    defaultValue: "Optional. Hidden when no decorative or semantic icon is supplied.",
    notes: "Header/footer icon aligns right by default.",
  },
];

function CardSectionSeparator({ label }: { label: string }) {
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

function HeaderFooterOptions() {
  return (
    <Surface className="space-y-4">
      <div>
        <TypographyH2 className="text-xl font-semibold">Header and footer options</TypographyH2>
        <TypographyMuted className="mt-1 max-w-3xl">
          Any card pattern with a header or footer should expose these options with sensible
          defaults. Actions and icons align right by default so the content stack stays predictable.
        </TypographyMuted>
      </div>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {HEADER_FOOTER_OPTIONS.map((item) => (
          <div key={item.option} className="border-border/80 bg-card rounded-lg border p-4">
            <div className="flex items-start justify-between gap-3">
              <code className="bg-muted/50 text-foreground rounded-md px-2 py-1 font-mono text-xs">
                {item.option}
              </code>
              <TypographyMuted className="text-right text-[10px] font-semibold tracking-tight uppercase">
                Default
              </TypographyMuted>
            </div>
            <TypographyMuted className="mt-3 text-sm leading-relaxed">
              {item.defaultValue}
            </TypographyMuted>
            <TypographyMuted className="mt-2 text-xs leading-relaxed">{item.notes}</TypographyMuted>
          </div>
        ))}
      </div>
    </Surface>
  );
}

function NamingConvention() {
  return (
    <Section spacing="none">
      <div className="mb-6">
        <TypographyH2 className="text-xl font-semibold">Naming convention</TypographyH2>
        <TypographyMuted className="mt-1 max-w-3xl">
          Use dot-separated handles in the shape card.family.variant.state. Keep the handle
          lowercase, specific, and stable even when the demo copy changes.
        </TypographyMuted>
      </div>
      <Surface className="space-y-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {NAMING_RULES.map((name) => (
            <CardReferenceName key={name} name={name} />
          ))}
        </div>
      </Surface>
    </Section>
  );
}

export default function CardsPage() {
  return (
    <div className="space-y-12">
      <PageHeader
        title="Card Components"
        description="Cards group related information and provide a clear entry point to more detail. Each example has a stable reference name so we can ask for it directly in implementation prompts."
      />

      <div className="space-y-16">
        <CardSectionSeparator label="Standard cards" />

        <Section spacing="none">
          <div className="mb-6">
            <TypographyH2 className="text-xl font-semibold">Standard Card</TypographyH2>
            <TypographyMuted className="mt-1">
              The primary container for grouped content with header, body, and footer support.
            </TypographyMuted>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
            <div className="space-y-3">
              <CardReferenceName name="card.standard.basic" />
              <Card className="shadow-none">
                <CardHeader>
                  <CardAction>
                    <Sparkles className="text-primary size-5" aria-hidden />
                  </CardAction>
                  <TypographyH3 className="text-lg leading-none font-semibold">
                    Basic Summary
                  </TypographyH3>
                  <TypographyMuted>
                    A simple card with a title, subtitle, and body content.
                  </TypographyMuted>
                </CardHeader>
                <CardContent>
                  <TypographyMuted className="leading-relaxed">
                    Use this when the card only needs to hold short grouped content without a
                    persistent action area.
                  </TypographyMuted>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-3">
              <CardReferenceName name="card.standard.action" />
              <Card>
                <CardHeader>
                  <TypographyH3 className="text-lg leading-none font-semibold">
                    Project Overview
                  </TypographyH3>
                  <TypographyMuted>
                    View and manage the details of your current active project.
                  </TypographyMuted>
                  <CardAction>
                    <Button variant="ghost" size="icon" aria-label="More project actions">
                      <MoreVertical className="size-4" />
                    </Button>
                  </CardAction>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-sm">
                      <CircleCheck className="text-success size-4" />
                      <TypographyMuted>Assets verified</TypographyMuted>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Clock className="text-warning size-4" />
                      <TypographyMuted>Pending review (2 items)</TypographyMuted>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/20 border-t pt-6">
                  <Button variant="brand" className="w-full">
                    Manage Project
                  </Button>
                </CardFooter>
              </Card>
            </div>

            <div className="space-y-3">
              <CardReferenceName name="card.standard.promo-premium" />
              <Card className="ring-primary/20 bg-primary/5 border-none ring-1">
                <CardHeader>
                  <TypographyH3 className="text-primary text-lg leading-none font-semibold">
                    Premium Feature
                  </TypographyH3>
                  <TypographyMuted>
                    Upgrade your account to access advanced analytics and reporting tools.
                  </TypographyMuted>
                </CardHeader>
                <CardContent className="py-2">
                  <TypographyMuted className="leading-relaxed">
                    Unlock deep insights into your audience behavior and project performance with
                    our pro dashboard.
                  </TypographyMuted>
                </CardContent>
                <CardFooter>
                  <Button variant="accent">Unlock Pro</Button>
                </CardFooter>
              </Card>
            </div>

            <div className="space-y-3">
              <CardReferenceName name="card.standard.media" />
              <Card className="overflow-hidden">
                <div className="bg-muted flex aspect-video items-center justify-center">
                  <div className="bg-background/80 text-primary flex size-16 items-center justify-center rounded-xl shadow-sm">
                    <ImageIcon className="size-7" aria-hidden />
                  </div>
                </div>
                <CardHeader>
                  <CardAction>
                    <Button variant="ghost" size="icon" aria-label="Open media options">
                      <MoreVertical className="size-4" />
                    </Button>
                  </CardAction>
                  <TypographyH3 className="text-lg leading-none font-semibold">
                    Matchday Assets
                  </TypographyH3>
                  <TypographyMuted>
                    Media-first card for image previews, campaign assets, or templates.
                  </TypographyMuted>
                </CardHeader>
                <CardFooter className="border-t pt-6">
                  <Button variant="outline">Preview asset</Button>
                </CardFooter>
              </Card>
            </div>

            <div className="space-y-3">
              <CardReferenceName name="card.standard.list" />
              <Card>
                <CardHeader>
                  <CardAction>
                    <ListChecks className="text-success size-5" aria-hidden />
                  </CardAction>
                  <TypographyH3 className="text-lg leading-none font-semibold">
                    Setup Checklist
                  </TypographyH3>
                  <TypographyMuted>
                    Short list card for grouped tasks, checks, or content requirements.
                  </TypographyMuted>
                </CardHeader>
                <CardContent>
                  <div className="divide-border divide-y">
                    {["Brand profile", "Team contacts", "Publishing defaults"].map((item) => (
                      <div key={item} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                        <CircleCheck className="text-success size-4" aria-hidden />
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-6">
                  <Button variant="brand" className="w-full">
                    Continue setup
                  </Button>
                </CardFooter>
              </Card>
            </div>

            <div className="space-y-3">
              <CardReferenceName name="card.standard.bg-muted" />
              <Card className="bg-muted/40">
                <CardHeader>
                  <TypographyH3 className="text-lg leading-none font-semibold">
                    Muted Background
                  </TypographyH3>
                  <TypographyMuted>
                    Neutral emphasis for grouped content that should sit quieter than a default
                    card.
                  </TypographyMuted>
                </CardHeader>
                <CardFooter className="border-t pt-6">
                  <Button variant="outline">Review details</Button>
                </CardFooter>
              </Card>
            </div>

            <div className="space-y-3">
              <CardReferenceName name="card.standard.bg-primary" />
              <Card className="border-primary/15 bg-primary/5 ring-primary/10 ring-1">
                <CardHeader>
                  <TypographyH3 className="text-primary text-lg leading-none font-semibold">
                    Primary Background
                  </TypographyH3>
                  <TypographyMuted>
                    Brand-tinted emphasis for featured guidance, active setup steps, or important
                    notices.
                  </TypographyMuted>
                </CardHeader>
                <CardFooter className="border-primary/10 border-t pt-6">
                  <Button variant="brand">Start action</Button>
                </CardFooter>
              </Card>
            </div>

            <div className="space-y-3">
              <CardReferenceName name="card.standard.bg-success" />
              <Card className="border-success/15 bg-success/10 ring-success/10 ring-1">
                <CardHeader>
                  <TypographyH3 className="text-success text-lg leading-none font-semibold">
                    Success Background
                  </TypographyH3>
                  <TypographyMuted>
                    Confirmation surface for completed setup, successful syncs, or healthy states.
                  </TypographyMuted>
                </CardHeader>
                <CardFooter className="border-success/10 border-t pt-6">
                  <Button variant="outline">View outcome</Button>
                </CardFooter>
              </Card>
            </div>

            <div className="space-y-3">
              <CardReferenceName name="card.standard.bg-warning" />
              <Card className="border-warning/20 bg-warning/10 ring-warning/10 ring-1">
                <CardHeader>
                  <TypographyH3 className="text-warning text-lg leading-none font-semibold">
                    Warning Background
                  </TypographyH3>
                  <TypographyMuted>
                    Gentle attention state for missing inputs, pending review, or time-sensitive
                    tasks.
                  </TypographyMuted>
                </CardHeader>
                <CardFooter className="border-warning/10 border-t pt-6">
                  <Button variant="outline">Resolve item</Button>
                </CardFooter>
              </Card>
            </div>

            <div className="space-y-3">
              <CardReferenceName name="card.standard.bg-destructive" />
              <Card className="border-destructive/15 bg-destructive/5 ring-destructive/10 ring-1">
                <CardHeader>
                  <TypographyH3 className="text-destructive text-lg leading-none font-semibold">
                    Destructive Background
                  </TypographyH3>
                  <TypographyMuted>
                    Restrained error surface for failed actions, blocked states, or recovery
                    prompts.
                  </TypographyMuted>
                </CardHeader>
                <CardFooter className="border-destructive/10 border-t pt-6">
                  <Button variant="destructive">Fix issue</Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </Section>

        <CardSectionSeparator label="Surface cards" />

        <Section spacing="none">
          <div className="mb-6">
            <TypographyH2 className="text-xl font-semibold">Surface Cards</TypographyH2>
            <TypographyMuted className="mt-1">
              Surfaces are lighter, simple containers without internal padding constraints.
            </TypographyMuted>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
            <div className="space-y-4">
              <CardReferenceName name="card.surface.settings" />
              <TypographyMuted className="font-mono text-xs tracking-widest uppercase">
                Settings Surface
              </TypographyMuted>
              <Surface className="overflow-hidden p-0">
                <div className="bg-muted flex items-center justify-between border-b px-6 py-4">
                  <TypographyH4 className="text-sm font-semibold">Quick Settings</TypographyH4>
                  <SlidersHorizontal className="text-muted-foreground size-4" aria-hidden />
                </div>
                <div className="space-y-4 p-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Auto-update enabled</span>
                    <div className="bg-success size-4 rounded-full" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Public visibility</span>
                    <div className="bg-muted size-4 rounded-full" />
                  </div>
                </div>
              </Surface>
            </div>

            <div className="space-y-4">
              <CardReferenceName name="card.surface.panel" />
              <TypographyMuted className="font-mono text-xs tracking-widest uppercase">
                Panel Surface
              </TypographyMuted>
              <Surface className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <TypographyH4 className="text-sm font-semibold">Publishing Window</TypographyH4>
                    <TypographyMuted className="mt-1 text-sm">
                      A plain panel for custom layouts without card header or footer rules.
                    </TypographyMuted>
                  </div>
                  <PanelTop className="text-primary size-5 shrink-0" aria-hidden />
                </div>
                <div className="bg-muted/50 grid grid-cols-2 gap-3 rounded-lg p-3">
                  <div>
                    <TypographyMuted className="text-[10px] font-semibold tracking-tight uppercase">
                      Starts
                    </TypographyMuted>
                    <span className="text-sm font-medium">9:00 AM</span>
                  </div>
                  <div>
                    <TypographyMuted className="text-[10px] font-semibold tracking-tight uppercase">
                      Ends
                    </TypographyMuted>
                    <span className="text-sm font-medium">5:00 PM</span>
                  </div>
                </div>
              </Surface>
            </div>

            <div className="space-y-4">
              <CardReferenceName name="card.surface.toolbar" />
              <TypographyMuted className="font-mono text-xs tracking-widest uppercase">
                Toolbar Surface
              </TypographyMuted>
              <Surface className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg">
                    <Filter className="size-4" aria-hidden />
                  </div>
                  <div className="min-w-0">
                    <TypographyH4 className="text-sm font-semibold">Asset filters</TypographyH4>
                    <TypographyMuted className="text-xs">3 filters active</TypographyMuted>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm">
                    Reset
                  </Button>
                  <Button variant="brand" size="sm">
                    Apply
                  </Button>
                </div>
              </Surface>
            </div>

            <div className="space-y-4">
              <CardReferenceName name="card.surface.bg-info" />
              <TypographyMuted className="font-mono text-xs tracking-widest uppercase">
                Info Surface
              </TypographyMuted>
              <Surface className="border-primary/15 bg-primary/5 ring-primary/10 space-y-3 ring-1">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <TypographyH4 className="text-primary text-sm font-semibold">
                      Information palette
                    </TypographyH4>
                    <TypographyMuted className="mt-1 text-sm">
                      Use for guidance, neutral announcements, and contextual helper panels.
                    </TypographyMuted>
                  </div>
                  <Info className="text-primary size-5 shrink-0" aria-hidden />
                </div>
              </Surface>
            </div>

            <div className="space-y-4">
              <CardReferenceName name="card.surface.bg-success" />
              <TypographyMuted className="font-mono text-xs tracking-widest uppercase">
                Success Surface
              </TypographyMuted>
              <Surface className="space-y-3 !bg-[var(--success)]/10 ring-1 ring-[color-mix(in_oklab,var(--success)_18%,transparent)]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <TypographyH4 className="text-success text-sm font-semibold">
                      Success palette
                    </TypographyH4>
                    <TypographyMuted className="mt-1 text-sm">
                      Use for completed states, healthy checks, and positive confirmation panels.
                    </TypographyMuted>
                  </div>
                  <CircleCheck className="text-success size-5 shrink-0" aria-hidden />
                </div>
              </Surface>
            </div>

            <div className="space-y-4">
              <CardReferenceName name="card.surface.bg-warning" />
              <TypographyMuted className="font-mono text-xs tracking-widest uppercase">
                Warning Surface
              </TypographyMuted>
              <Surface className="space-y-3 !bg-[var(--warning)]/10 ring-1 ring-[color-mix(in_oklab,var(--warning)_22%,transparent)]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <TypographyH4 className="text-warning text-sm font-semibold">
                      Warning palette
                    </TypographyH4>
                    <TypographyMuted className="mt-1 text-sm">
                      Use for pending requirements, review states, and non-blocking attention.
                    </TypographyMuted>
                  </div>
                  <AlertTriangle className="text-warning size-5 shrink-0" aria-hidden />
                </div>
              </Surface>
            </div>

            <div className="space-y-4">
              <CardReferenceName name="card.surface.bg-destructive" />
              <TypographyMuted className="font-mono text-xs tracking-widest uppercase">
                Destructive Surface
              </TypographyMuted>
              <Surface className="border-destructive/15 bg-destructive/5 ring-destructive/10 space-y-3 ring-1">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <TypographyH4 className="text-destructive text-sm font-semibold">
                      Destructive palette
                    </TypographyH4>
                    <TypographyMuted className="mt-1 text-sm">
                      Use for failed checks, blocked states, and surfaces that need recovery.
                    </TypographyMuted>
                  </div>
                  <AlertTriangle className="text-destructive size-5 shrink-0" aria-hidden />
                </div>
              </Surface>
            </div>
          </div>
        </Section>

        <CardSectionSeparator label="Stat cards" />

        <Section spacing="none">
          <div className="mb-6">
            <TypographyH2 className="text-xl font-semibold">Stat Cards</TypographyH2>
            <TypographyMuted className="mt-1">
              Compact metric surfaces for dashboards, summaries, and quick health checks.
            </TypographyMuted>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
            <div className="space-y-4">
              <CardReferenceName name="card.metric.compact" />
              <TypographyMuted className="font-mono text-xs tracking-widest uppercase">
                Compact Metric
              </TypographyMuted>
              <Surface className="flex flex-col gap-2">
                <div className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-lg">
                  <Users className="size-4" aria-hidden />
                </div>
                <TypographyH3 className="text-2xl font-bold">1.2k</TypographyH3>
                <TypographyMuted className="text-[10px] font-semibold tracking-tight uppercase">
                  Active Users
                </TypographyMuted>
              </Surface>
            </div>

            <div className="space-y-4">
              <CardReferenceName name="card.metric.trend" />
              <TypographyMuted className="font-mono text-xs tracking-widest uppercase">
                Trend Metric
              </TypographyMuted>
              <Surface className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <TypographyMuted className="text-[10px] font-semibold tracking-tight uppercase">
                      Growth rate
                    </TypographyMuted>
                    <TypographyH3 className="mt-1 text-3xl font-bold">+12%</TypographyH3>
                  </div>
                  <div className="bg-success/10 text-success flex size-9 shrink-0 items-center justify-center rounded-lg">
                    <TrendingUp className="size-4" aria-hidden />
                  </div>
                </div>
                <div className="text-success flex items-center gap-1 text-xs font-medium">
                  <ArrowUpRight className="size-3.5" aria-hidden />
                  4.2% higher than last month
                </div>
                <TypographyMuted className="text-xs">
                  Compared with the previous 30 days.
                </TypographyMuted>
              </Surface>
            </div>

            <div className="space-y-10">
              <div className="space-y-4">
                <CardReferenceName name="card.metric.comparison" />
                <TypographyMuted className="font-mono text-xs tracking-widest uppercase">
                  Comparison Metric (Surface bands)
                </TypographyMuted>
                <MetricComparisonCard
                  layout="surface"
                  title="Content output"
                  icon={<Scale className="text-primary size-5" aria-hidden />}
                  primary={{ label: "Current", value: "86" }}
                  secondary={{ label: "Previous", value: "73" }}
                  footer={
                    <TypographyMuted className="flex items-center gap-1 text-xs">
                      <ArrowDownRight className="text-destructive size-3.5 shrink-0" aria-hidden />
                      Gap to target reduced by 13 items.
                    </TypographyMuted>
                  }
                />
              </div>
              <div className="space-y-4">
                <CardReferenceName name="card.metric.comparison-card" />
                <TypographyMuted className="font-mono text-xs tracking-widest uppercase">
                  Comparison Metric (Card slots)
                </TypographyMuted>
                <MetricComparisonCard
                  layout="card"
                  title="Content output"
                  icon={<Scale className="text-primary size-5" aria-hidden />}
                  primary={{ label: "Current", value: "86" }}
                  secondary={{ label: "Previous", value: "73" }}
                  footer={
                    <TypographyMuted className="flex items-center gap-1 text-xs">
                      <ArrowDownRight className="text-destructive size-3.5 shrink-0" aria-hidden />
                      Gap to target reduced by 13 items.
                    </TypographyMuted>
                  }
                />
              </div>

              <div className="space-y-4">
                <CardReferenceName name="card.metric.comparison-card.body-prose" />
                <TypographyMuted className="font-mono text-xs tracking-widest uppercase">
                  Comparison card shell — prose body
                </TypographyMuted>
                <MetricComparisonCard
                  layout="card"
                  title="Season coverage"
                  icon={<FileText className="text-primary size-5" aria-hidden />}
                  body={
                    <div className="space-y-3">
                      <p className="text-sm leading-relaxed">
                        Fixtures are generated for every grade that has a published draw. Hidden
                        grades stay out of exports until you publish them.
                      </p>
                      <TypographyMuted className="text-xs leading-relaxed">
                        Last synced 12 minutes ago. Changes from your association feed apply on the
                        next sync window.
                      </TypographyMuted>
                    </div>
                  }
                  footer={
                    <TypographyMuted className="text-xs">
                      Tip: publish grades in bulk from the competition settings sheet.
                    </TypographyMuted>
                  }
                />
              </div>

              <div className="space-y-4">
                <CardReferenceName name="card.metric.comparison-card.body-checklist" />
                <TypographyMuted className="font-mono text-xs tracking-widest uppercase">
                  Comparison card shell — checklist body
                </TypographyMuted>
                <MetricComparisonCard
                  layout="card"
                  title="Before you go live"
                  icon={<ListChecks className="text-primary size-5" aria-hidden />}
                  body={
                    <ul className="space-y-2.5 text-sm">
                      <li className="flex gap-2">
                        <CircleCheck className="text-success mt-0.5 size-4 shrink-0" aria-hidden />
                        <span>Billing contact and ABN on file.</span>
                      </li>
                      <li className="flex gap-2">
                        <CircleCheck className="text-success mt-0.5 size-4 shrink-0" aria-hidden />
                        <span>At least one published competition with fixtures.</span>
                      </li>
                      <li className="flex gap-2">
                        <Clock
                          className="text-muted-foreground mt-0.5 size-4 shrink-0"
                          aria-hidden
                        />
                        <span className="text-muted-foreground">
                          Sponsor logos optional — add later from assets.
                        </span>
                      </li>
                    </ul>
                  }
                  footer={
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="text-muted-foreground">2 of 3 complete</span>
                      <span className="bg-muted text-muted-foreground rounded-md px-2 py-0.5 font-medium">
                        Est. 4 min left
                      </span>
                    </div>
                  }
                />
              </div>

              <div className="space-y-4">
                <CardReferenceName name="card.metric.comparison-card.body-inline-meta" />
                <TypographyMuted className="font-mono text-xs tracking-widest uppercase">
                  Comparison card shell — inline meta + action
                </TypographyMuted>
                <MetricComparisonCard
                  layout="card"
                  title="Invoice delivery"
                  icon={<ClipboardCheck className="text-primary size-5" aria-hidden />}
                  body={
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <p className="text-muted-foreground max-w-md text-sm leading-relaxed">
                        Invoices are emailed to the organisation billing address. CC additional
                        recipients from billing settings.
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="shrink-0 self-start"
                      >
                        Manage recipients
                      </Button>
                    </div>
                  }
                  footer={
                    <TypographyMuted className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                      <span>Next run · 04 May, 06:00 AEST</span>
                      <span className="hidden sm:inline" aria-hidden>
                        ·
                      </span>
                      <span>PDF + CSV attached</span>
                    </TypographyMuted>
                  }
                />
              </div>
            </div>

            <div className="space-y-4">
              <CardReferenceName name="card.metric.inline-count" />
              <TypographyMuted className="font-mono text-xs tracking-widest uppercase">
                Inline Count Metric
              </TypographyMuted>
              <Surface className="flex min-h-20 items-center justify-between gap-4 py-4">
                <div className="flex min-w-0 items-baseline gap-3">
                  <span className="text-4xl leading-none font-bold tabular-nums">5</span>
                  <span className="text-muted-foreground truncate text-sm font-semibold tracking-tight uppercase">
                    Competitions
                  </span>
                </div>
                <div className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg">
                  <Trophy className="size-4" aria-hidden />
                </div>
              </Surface>
            </div>

            <div className="space-y-4">
              <CardReferenceName name="card.metric.inline-compact" />
              <TypographyMuted className="font-mono text-xs tracking-widest uppercase">
                Inline Compact Metric
              </TypographyMuted>
              <Surface className="flex min-h-16 items-center gap-3 py-3 shadow-none">
                <span className="text-2xl leading-none font-bold tabular-nums">12</span>
                <span className="text-muted-foreground truncate text-sm font-semibold tracking-tight uppercase">
                  Fixtures
                </span>
              </Surface>
            </div>

            <div className="space-y-4">
              <CardReferenceName name="card.metric.inline-icon" />
              <TypographyMuted className="font-mono text-xs tracking-widest uppercase">
                Inline Icon Metric
              </TypographyMuted>
              <Surface className="flex min-h-16 items-center justify-between gap-4 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="bg-muted text-muted-foreground flex size-8 shrink-0 items-center justify-center rounded-lg">
                    <FileText className="size-4" aria-hidden />
                  </div>
                  <div className="flex min-w-0 items-baseline gap-2">
                    <span className="text-2xl leading-none font-bold tabular-nums">38</span>
                    <span className="text-muted-foreground truncate text-sm font-semibold tracking-tight uppercase">
                      Assets
                    </span>
                  </div>
                </div>
                <TypographyMuted className="text-xs">Ready</TypographyMuted>
              </Surface>
            </div>

            <div className="space-y-4">
              <CardReferenceName name="card.metric.inline-info" />
              <TypographyMuted className="font-mono text-xs tracking-widest uppercase">
                Inline Info Metric
              </TypographyMuted>
              <Surface className="!bg-primary/5 ring-primary/10 flex min-h-16 items-center justify-between gap-4 py-3 ring-1">
                <div className="flex min-w-0 items-baseline gap-3">
                  <span className="text-primary text-2xl leading-none font-bold tabular-nums">
                    8
                  </span>
                  <span className="text-muted-foreground truncate text-sm font-semibold tracking-tight uppercase">
                    Grades
                  </span>
                </div>
                <Info className="text-primary size-4 shrink-0" aria-hidden />
              </Surface>
            </div>

            <div className="space-y-4">
              <CardReferenceName name="card.metric.inline-success" />
              <TypographyMuted className="font-mono text-xs tracking-widest uppercase">
                Inline Success Metric
              </TypographyMuted>
              <Surface className="flex min-h-16 items-center justify-between gap-4 !bg-[var(--success)]/10 py-3 ring-1 ring-[color-mix(in_oklab,var(--success)_18%,transparent)]">
                <div className="flex min-w-0 items-baseline gap-3">
                  <span className="text-success text-2xl leading-none font-bold tabular-nums">
                    24
                  </span>
                  <span className="text-muted-foreground truncate text-sm font-semibold tracking-tight uppercase">
                    Published
                  </span>
                </div>
                <CircleCheck className="text-success size-4 shrink-0" aria-hidden />
              </Surface>
            </div>

            <div className="space-y-4">
              <CardReferenceName name="card.metric.inline-warning" />
              <TypographyMuted className="font-mono text-xs tracking-widest uppercase">
                Inline Warning Metric
              </TypographyMuted>
              <Surface className="flex min-h-16 items-center justify-between gap-4 !bg-[var(--warning)]/10 py-3 ring-1 ring-[color-mix(in_oklab,var(--warning)_22%,transparent)]">
                <div className="flex min-w-0 items-baseline gap-3">
                  <span className="text-warning text-2xl leading-none font-bold tabular-nums">
                    3
                  </span>
                  <span className="text-muted-foreground truncate text-sm font-semibold tracking-tight uppercase">
                    Pending
                  </span>
                </div>
                <AlertTriangle className="text-warning size-4 shrink-0" aria-hidden />
              </Surface>
            </div>

            <div className="space-y-4">
              <CardReferenceName name="card.metric.inline-destructive" />
              <TypographyMuted className="font-mono text-xs tracking-widest uppercase">
                Inline Destructive Metric
              </TypographyMuted>
              <Surface className="!bg-destructive/5 ring-destructive/10 flex min-h-16 items-center justify-between gap-4 py-3 ring-1">
                <div className="flex min-w-0 items-baseline gap-3">
                  <span className="text-destructive text-2xl leading-none font-bold tabular-nums">
                    2
                  </span>
                  <span className="text-muted-foreground truncate text-sm font-semibold tracking-tight uppercase">
                    Blocked
                  </span>
                </div>
                <AlertTriangle className="text-destructive size-4 shrink-0" aria-hidden />
              </Surface>
            </div>
          </div>
        </Section>

        <CardSectionSeparator label="Composite cards" />

        <Section spacing="none">
          <div className="mb-6">
            <TypographyH2 className="text-xl font-semibold">Complex Composition</TypographyH2>
            <TypographyMuted className="mt-1">
              Combining cards and other UI primitives for feature-rich modules.
            </TypographyMuted>
          </div>
          <div className="space-y-8">
            <div className="space-y-3">
              <CardReferenceName name="card.composite.split-action" />
              <Card className="max-w-3xl overflow-hidden">
                <div className="from-primary via-brand-secondary to-brand-accent h-2 w-full bg-gradient-to-r" />
                <div className="flex flex-col md:flex-row">
                  <div className="flex-1 p-8">
                    <TypographyH3 className="mb-2 text-2xl font-bold">
                      Build your first report
                    </TypographyH3>
                    <TypographyMuted className="mb-6">
                      Select a project template below to see how Fixtura can transform your
                      verification workflow seamlessly.
                    </TypographyMuted>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant="outline"
                        className="h-auto flex-col items-start justify-start gap-1 px-4 py-3"
                      >
                        <span className="text-sm font-semibold">Standard Audit</span>
                        <span className="text-[10px] opacity-70">Best for small teams</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-auto flex-col items-start justify-start gap-1 px-4 py-3"
                      >
                        <span className="text-sm font-semibold">Enterprise Scan</span>
                        <span className="text-[10px] opacity-70">Full compliance depth</span>
                      </Button>
                    </div>
                  </div>
                  <div className="bg-muted/30 flex w-full flex-col justify-between border-l p-8 md:w-64">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="bg-brand-accent size-2 rounded-full" />
                        <span className="text-xs font-semibold">Draft mode</span>
                      </div>
                      <TypographyMuted className="text-xs">
                        Created 2 hours ago by Trent Nixon.
                      </TypographyMuted>
                    </div>
                    <Button variant="default" className="mt-8">
                      Configure template
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            <div className="space-y-3">
              <CardReferenceName name="card.composite.workflow" />
              <Card className="max-w-3xl">
                <CardHeader>
                  <CardAction>
                    <ClipboardCheck className="text-primary size-5" aria-hidden />
                  </CardAction>
                  <TypographyH3 className="text-xl leading-none font-semibold">
                    Onboarding workflow
                  </TypographyH3>
                  <TypographyMuted>
                    Multi-step card for setup, review, and handoff flows.
                  </TypographyMuted>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { label: "Organisation profile", state: "Complete", done: true },
                      { label: "Brand assets", state: "Complete", done: true },
                      { label: "Publishing defaults", state: "Needs review", done: false },
                    ].map((step, index) => (
                      <div
                        key={step.label}
                        className="border-border/80 flex items-center justify-between gap-4 rounded-lg border p-3"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div
                            className={
                              step.done
                                ? "bg-success/10 text-success flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                                : "bg-warning/10 text-warning flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                            }
                          >
                            {index + 1}
                          </div>
                          <span className="truncate text-sm font-medium">{step.label}</span>
                        </div>
                        <TypographyMuted className="shrink-0 text-xs">{step.state}</TypographyMuted>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="flex flex-wrap gap-2 border-t pt-6">
                  <Button variant="brand">Continue workflow</Button>
                  <Button variant="outline">View all steps</Button>
                </CardFooter>
              </Card>
            </div>

            <div className="space-y-3">
              <CardReferenceName name="card.composite.summary" />
              <Card className="max-w-3xl">
                <CardHeader>
                  <CardAction>
                    <ShieldCheck className="text-success size-5" aria-hidden />
                  </CardAction>
                  <TypographyH3 className="text-xl leading-none font-semibold">
                    Season module summary
                  </TypographyH3>
                  <TypographyMuted>
                    Summary card with status, metadata, grouped metrics, and action controls.
                  </TypographyMuted>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {[
                      ["Competitions", "5"],
                      ["Fixtures", "128"],
                      ["Assets ready", "86"],
                    ].map(([label, value]) => (
                      <div key={label} className="bg-muted/50 rounded-lg p-3">
                        <TypographyMuted className="text-[10px] font-semibold tracking-tight uppercase">
                          {label}
                        </TypographyMuted>
                        <div className="mt-1 text-2xl font-bold">{value}</div>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-success/10 text-success rounded-full px-2.5 py-1 text-xs font-medium">
                      Healthy
                    </span>
                    <TypographyMuted className="text-xs">Last synced 8 minutes ago</TypographyMuted>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-wrap gap-2 border-t pt-6">
                  <Button variant="brand">Open season hub</Button>
                  <Button variant="ghost">Export summary</Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </Section>

        <CardSectionSeparator label="Feedback cards" />

        <FeedbackCardsSection />

        <CardSectionSeparator label="Grid cards" />

        <GridCardExplorationSection />

        <CardSectionSeparator label="Card API reference" />

        <NamingConvention />

        <Section spacing="none">
          <HeaderFooterOptions />
        </Section>
      </div>
    </div>
  );
}
