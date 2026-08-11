import { TypographyH2, TypographyH3, TypographyMuted, TypographyP } from "@/components/typography";
import { PageHeader, Section } from "@/components/ui/container";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { TabberReferenceName } from "./tabber-reference-name";

const underlineTabTriggerClass =
  "text-muted-foreground data-[state=active]:text-foreground rounded-none border-0 border-b-2 border-transparent bg-transparent px-3 py-2 shadow-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none";

const glassTabTriggerClass =
  "rounded-xl px-4 py-2 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm";

const pillTabTriggerClass =
  "rounded-full border border-border/50 bg-muted/25 px-8 py-2 text-muted-foreground shadow-none data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none";

const segmentedBrandSecondaryListClass =
  "grid w-full grid-cols-3 border border-[var(--brand-secondary)]/30 bg-brand-secondary/10 p-1 shadow-none";

const segmentedBrandSecondaryTriggerClass =
  "shadow-none data-[state=active]:bg-[var(--brand-secondary)] data-[state=active]:text-white";

const segmentedBrandAccentListClass =
  "grid w-full grid-cols-3 border border-[var(--brand-accent)]/30 bg-brand-accent/10 p-1 shadow-none";

const segmentedBrandAccentTriggerClass =
  "shadow-none data-[state=active]:bg-[var(--brand-accent)] data-[state=active]:text-white";

const underlineSuccessTriggerClass =
  "text-muted-foreground data-[state=active]:text-success-600 rounded-none border-0 border-b-2 border-transparent bg-transparent px-3 py-2 shadow-none data-[state=active]:border-success-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none";

const pillDestructiveClass =
  "rounded-full border border-destructive/35 bg-destructive/5 px-8 py-2 text-muted-foreground shadow-none data-[state=active]:border-destructive data-[state=active]:bg-destructive data-[state=active]:text-white data-[state=active]:shadow-none";

const pillBrandAccentClass =
  "rounded-full border border-[var(--brand-accent)]/40 bg-brand-accent/10 px-8 py-2 text-muted-foreground shadow-none data-[state=active]:border-[var(--brand-accent)] data-[state=active]:bg-[var(--brand-accent)] data-[state=active]:text-white data-[state=active]:shadow-none";

export default function TabberPage() {
  return (
    <div className="space-y-12">
      <PageHeader
        title="Tabber"
        description="Tabbed interfaces for switching related views without leaving the page. Radix Tabs: neutral recipes, then brand and semantic palette variants aligned with buttons and status colors."
      />

      <div className="space-y-16">
        <Section spacing="none">
          <div className="mb-6">
            <TypographyH2 className="text-xl font-semibold">Segmented control</TypographyH2>
            <TypographyMuted className="mt-1">
              Default primitive: muted rail, raised active trigger. Same family as assign/preview
              strips in manage-sponsors.
            </TypographyMuted>
            <div className="mt-3">
              <TabberReferenceName name="tabber.segmented.rail.default" />
            </div>
          </div>
          <div className="bg-card/50 rounded-xl border p-10">
            <Tabs defaultValue="first" className="w-full max-w-xl">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="first">First</TabsTrigger>
                <TabsTrigger value="second">Second</TabsTrigger>
                <TabsTrigger value="third">Third</TabsTrigger>
              </TabsList>
              <TabsContent value="first">
                <TypographyP className="text-muted-foreground">
                  First tab content — swap this region for real modules, tables, or forms.
                </TypographyP>
              </TabsContent>
              <TabsContent value="second">
                <TypographyP className="text-muted-foreground">
                  Second tab content — keep panel semantics and focus order consistent across tabs.
                </TypographyP>
              </TabsContent>
              <TabsContent value="third">
                <TypographyP className="text-muted-foreground">
                  Third tab content — lazy-load heavy panels here when you wire production routes.
                </TypographyP>
              </TabsContent>
            </Tabs>
          </div>
        </Section>

        <Section spacing="none">
          <div className="mb-6">
            <TypographyH2 className="text-xl font-semibold">Underline subnav</TypographyH2>
            <TypographyMuted className="mt-1">
              Flat strip with a primary bottom border on the active item. Pairs with page headers
              and dense data views where a pill rail would feel heavy.
            </TypographyMuted>
            <div className="mt-3">
              <TabberReferenceName name="tabber.underline.subnav.default" />
            </div>
          </div>
          <div className="bg-card/50 rounded-xl border p-10">
            <Tabs defaultValue="overview" className="w-full max-w-2xl">
              <TabsList className="text-muted-foreground border-border flex h-auto w-full items-center justify-start gap-1 rounded-none border-0 border-b bg-transparent p-0">
                <TabsTrigger value="overview" className={underlineTabTriggerClass}>
                  Overview
                </TabsTrigger>
                <TabsTrigger value="activity" className={underlineTabTriggerClass}>
                  Activity
                </TabsTrigger>
                <TabsTrigger value="settings" className={underlineTabTriggerClass}>
                  Settings
                </TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="mt-6">
                <TypographyP className="text-muted-foreground">
                  Overview panel — use for summary metrics and primary entity context.
                </TypographyP>
              </TabsContent>
              <TabsContent value="activity" className="mt-6">
                <TypographyP className="text-muted-foreground">
                  Activity panel — timelines, audit trails, and comment threads fit well here.
                </TypographyP>
              </TabsContent>
              <TabsContent value="settings" className="mt-6">
                <TypographyP className="text-muted-foreground">
                  Settings panel — forms and toggles; keep the underline strip visible above scroll.
                </TypographyP>
              </TabsContent>
            </Tabs>
          </div>
        </Section>

        <Section spacing="none">
          <div className="mb-6">
            <TypographyH2 className="text-xl font-semibold">Glass strip</TypographyH2>
            <TypographyMuted className="mt-1">
              Fixtura Prime rhythm: large radius, light translucency, and blur so the strip floats
              over page background — aligned with glass surfaces and premium containers.
            </TypographyMuted>
            <div className="mt-3">
              <TabberReferenceName name="tabber.glass.strip.default" />
            </div>
          </div>
          <div className="from-muted/30 to-muted/5 rounded-xl border bg-linear-to-br p-10">
            <Tabs defaultValue="live" className="w-full max-w-xl">
              <TabsList className="text-muted-foreground border-border/80 bg-background/55 flex h-auto w-full flex-wrap items-center justify-start gap-1 rounded-[1.25rem] border p-1.5 shadow-sm backdrop-blur-md">
                <TabsTrigger value="live" className={glassTabTriggerClass}>
                  Live
                </TabsTrigger>
                <TabsTrigger value="draft" className={glassTabTriggerClass}>
                  Draft
                </TabsTrigger>
                <TabsTrigger value="archive" className={glassTabTriggerClass}>
                  Archive
                </TabsTrigger>
              </TabsList>
              <TabsContent value="live" className="mt-5">
                <TypographyP className="text-muted-foreground">
                  Live content — published, customer-visible state.
                </TypographyP>
              </TabsContent>
              <TabsContent value="draft" className="mt-5">
                <TypographyP className="text-muted-foreground">
                  Draft content — WIP; match this strip to other glass cards on the same page.
                </TypographyP>
              </TabsContent>
              <TabsContent value="archive" className="mt-5">
                <TypographyP className="text-muted-foreground">
                  Archive — read-only; optional muted triggers via className if needed.
                </TypographyP>
              </TabsContent>
            </Tabs>
          </div>
        </Section>

        <Section spacing="none">
          <div className="mb-6">
            <TypographyH2 className="text-xl font-semibold">Borderless pills</TypographyH2>
            <TypographyMuted className="mt-1">
              No outer demo card: tabs sit on the page canvas. Each trigger is a full pill
              (rounded-full); inactive chips use a light muted fill, active uses primary.
            </TypographyMuted>
            <div className="mt-3">
              <TabberReferenceName name="tabber.pill.borderless.default" />
            </div>
          </div>
          <Tabs defaultValue="all" className="w-full max-w-xl">
            <TabsList className="flex h-auto flex-wrap items-center gap-2 border-0 bg-transparent p-0 shadow-none">
              <TabsTrigger value="all" className={pillTabTriggerClass}>
                All
              </TabsTrigger>
              <TabsTrigger value="active" className={pillTabTriggerClass}>
                Active
              </TabsTrigger>
              <TabsTrigger value="done" className={pillTabTriggerClass}>
                Done
              </TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-5">
              <TypographyP className="text-muted-foreground">
                All items — use when the tab row should feel lightweight on dashboards or above
                lists.
              </TypographyP>
            </TabsContent>
            <TabsContent value="active" className="mt-5">
              <TypographyP className="text-muted-foreground">
                Active only — pair with filters or table scope without boxing the control.
              </TypographyP>
            </TabsContent>
            <TabsContent value="done" className="mt-5">
              <TypographyP className="text-muted-foreground">
                Completed — pills can wrap on small widths; keep labels short.
              </TypographyP>
            </TabsContent>
          </Tabs>
        </Section>

        <Section spacing="none">
          <div className="mb-8">
            <TypographyH2 className="text-xl font-semibold">Palette variations</TypographyH2>
            <TypographyMuted className="mt-1">
              Same layouts as above, tinted with brand secondary / accent and semantic success /
              destructive tokens. Pair with the matching button variants (brand, accent,
              destructive) and status chips on the same view.
            </TypographyMuted>
          </div>

          <div className="space-y-14">
            <div>
              <div className="mb-4">
                <TypographyH3 className="text-base font-semibold">
                  Segmented · brand secondary
                </TypographyH3>
                <TypographyMuted className="mt-1">
                  Teal rail and fill; mirrors the brand button treatment.
                </TypographyMuted>
                <div className="mt-3">
                  <TabberReferenceName name="tabber.segmented.rail.brand-secondary" />
                </div>
              </div>
              <div className="bg-card/50 rounded-xl border p-10">
                <Tabs defaultValue="a" className="w-full max-w-xl">
                  <TabsList className={segmentedBrandSecondaryListClass}>
                    <TabsTrigger value="a" className={segmentedBrandSecondaryTriggerClass}>
                      Pool
                    </TabsTrigger>
                    <TabsTrigger value="b" className={segmentedBrandSecondaryTriggerClass}>
                      Ladder
                    </TabsTrigger>
                    <TabsTrigger value="c" className={segmentedBrandSecondaryTriggerClass}>
                      Finals
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="a" className="mt-4">
                    <TypographyP className="text-muted-foreground">
                      Brand secondary — use alongside other teal actions in club admin.
                    </TypographyP>
                  </TabsContent>
                  <TabsContent value="b" className="mt-4">
                    <TypographyP className="text-muted-foreground">
                      Same interaction model as the default segmented rail; only chroma changes.
                    </TypographyP>
                  </TabsContent>
                  <TabsContent value="c" className="mt-4">
                    <TypographyP className="text-muted-foreground">
                      Check contrast in both themes; rail uses token opacity, active uses solid
                      `brand-secondary`.
                    </TypographyP>
                  </TabsContent>
                </Tabs>
              </div>
            </div>

            <div>
              <div className="mb-4">
                <TypographyH3 className="text-base font-semibold">
                  Segmented · brand accent
                </TypographyH3>
                <TypographyMuted className="mt-1">
                  Orange rail and fill; pair with accent buttons on the same surface.
                </TypographyMuted>
                <div className="mt-3">
                  <TabberReferenceName name="tabber.segmented.rail.brand-accent" />
                </div>
              </div>
              <div className="bg-card/50 rounded-xl border p-10">
                <Tabs defaultValue="one" className="w-full max-w-xl">
                  <TabsList className={segmentedBrandAccentListClass}>
                    <TabsTrigger value="one" className={segmentedBrandAccentTriggerClass}>
                      Promote
                    </TabsTrigger>
                    <TabsTrigger value="two" className={segmentedBrandAccentTriggerClass}>
                      Hold
                    </TabsTrigger>
                    <TabsTrigger value="three" className={segmentedBrandAccentTriggerClass}>
                      Archive
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="one" className="mt-4">
                    <TypographyP className="text-muted-foreground">
                      Accent — high-energy flows: campaigns, highlights, paid upgrades.
                    </TypographyP>
                  </TabsContent>
                  <TabsContent value="two" className="mt-4">
                    <TypographyP className="text-muted-foreground">
                      Reserve for surfaces that already use orange sparingly so the strip stays
                      legible.
                    </TypographyP>
                  </TabsContent>
                  <TabsContent value="three" className="mt-4">
                    <TypographyP className="text-muted-foreground">
                      Active trigger uses solid `brand-accent` with white label text.
                    </TypographyP>
                  </TabsContent>
                </Tabs>
              </div>
            </div>

            <div>
              <div className="mb-4">
                <TypographyH3 className="text-base font-semibold">Underline · success</TypographyH3>
                <TypographyMuted className="mt-1">
                  Success-600 indicator for verified, published, or healthy sibling views.
                </TypographyMuted>
                <div className="mt-3">
                  <TabberReferenceName name="tabber.underline.subnav.success-600" />
                </div>
              </div>
              <div className="bg-card/50 rounded-xl border p-10">
                <Tabs defaultValue="pub" className="w-full max-w-2xl">
                  <TabsList className="text-muted-foreground border-border flex h-auto w-full items-center justify-start gap-1 rounded-none border-0 border-b bg-transparent p-0">
                    <TabsTrigger value="pub" className={underlineSuccessTriggerClass}>
                      Published
                    </TabsTrigger>
                    <TabsTrigger value="rev" className={underlineSuccessTriggerClass}>
                      In review
                    </TabsTrigger>
                    <TabsTrigger value="arch" className={underlineSuccessTriggerClass}>
                      Archived
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="pub" className="mt-6">
                    <TypographyP className="text-muted-foreground">
                      Published — uses `border-success-600` and `text-success-600` on the active
                      tab.
                    </TypographyP>
                  </TabsContent>
                  <TabsContent value="rev" className="mt-6">
                    <TypographyP className="text-muted-foreground">
                      Same underline mechanics as the neutral variant; only semantic color changes.
                    </TypographyP>
                  </TabsContent>
                  <TabsContent value="arch" className="mt-6">
                    <TypographyP className="text-muted-foreground">
                      Aligns with success chips and `success-600` progress treatments in billing.
                    </TypographyP>
                  </TabsContent>
                </Tabs>
              </div>
            </div>

            <div>
              <div className="mb-4">
                <TypographyH3 className="text-base font-semibold">
                  Borderless pills · destructive
                </TypographyH3>
                <TypographyMuted className="mt-1">
                  Cautionary scope filters: destructive token on selection, light tint when idle.
                </TypographyMuted>
                <div className="mt-3">
                  <TabberReferenceName name="tabber.pill.borderless.destructive" />
                </div>
              </div>
              <div className="bg-card/50 rounded-xl border p-10">
                <Tabs defaultValue="safe" className="w-full max-w-xl">
                  <TabsList className="flex h-auto flex-wrap items-center gap-2 border-0 bg-transparent p-0 shadow-none">
                    <TabsTrigger value="safe" className={pillDestructiveClass}>
                      Safe
                    </TabsTrigger>
                    <TabsTrigger value="risk" className={pillDestructiveClass}>
                      Risky
                    </TabsTrigger>
                    <TabsTrigger value="blocked" className={pillDestructiveClass}>
                      Blocked
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="safe" className="mt-5">
                    <TypographyP className="text-muted-foreground">
                      Idle pills use `destructive` at low opacity; active uses solid destructive
                      with white text.
                    </TypographyP>
                  </TabsContent>
                  <TabsContent value="risk" className="mt-5">
                    <TypographyP className="text-muted-foreground">
                      Use only where destructive actions exist nearby so the affordance stays
                      coherent.
                    </TypographyP>
                  </TabsContent>
                  <TabsContent value="blocked" className="mt-5">
                    <TypographyP className="text-muted-foreground">
                      Optional: pair with a muted page background instead of a card if you need less
                      weight.
                    </TypographyP>
                  </TabsContent>
                </Tabs>
              </div>
            </div>

            <div>
              <div className="mb-4">
                <TypographyH3 className="text-base font-semibold">
                  Borderless pills · brand accent
                </TypographyH3>
                <TypographyMuted className="mt-1">
                  Orange-tinted chips without a rail; complements accent segmented when pills fit
                  better than a grid rail.
                </TypographyMuted>
                <div className="mt-3">
                  <TabberReferenceName name="tabber.pill.borderless.brand-accent" />
                </div>
              </div>
              <div className="bg-card/50 rounded-xl border p-10">
                <Tabs defaultValue="featured" className="w-full max-w-xl">
                  <TabsList className="flex h-auto flex-wrap items-center gap-2 border-0 bg-transparent p-0 shadow-none">
                    <TabsTrigger value="featured" className={pillBrandAccentClass}>
                      Featured
                    </TabsTrigger>
                    <TabsTrigger value="standard" className={pillBrandAccentClass}>
                      Standard
                    </TabsTrigger>
                    <TabsTrigger value="hidden" className={pillBrandAccentClass}>
                      Hidden
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="featured" className="mt-5">
                    <TypographyP className="text-muted-foreground">
                      Brand accent pills — same geometry as `tabber.pill.borderless.default`, accent
                      chroma only.
                    </TypographyP>
                  </TabsContent>
                  <TabsContent value="standard" className="mt-5">
                    <TypographyP className="text-muted-foreground">
                      Good for sponsorship or promotion tiers next to neutral tables.
                    </TypographyP>
                  </TabsContent>
                  <TabsContent value="hidden" className="mt-5">
                    <TypographyP className="text-muted-foreground">
                      Uses `var(--brand-accent)` for border and fill on active state.
                    </TypographyP>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}
