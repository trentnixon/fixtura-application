"use client";

import { Building2, LayoutGrid, Route } from "lucide-react";

import { TypographyH2, TypographyH3, TypographyMuted } from "@/components/typography";
import { Section, Surface } from "@/components/ui/container";
import {
  GridCard,
  GridCardIcon,
  GridCardSelectOrganisation,
  GridCardVisualSlot,
  type GridCardTone,
} from "@/components/ui/grid-card";
import { ROUTES } from "@/lib/config/routes";
import { cn } from "@/lib/utils";

import { CardReferenceName } from "./card-reference-name";

import type { ReactNode } from "react";

const DEMO_HREF = `${ROUTES.kitchenSink}/cards`;

const TONES: GridCardTone[] = ["default", "mute", "error", "success", "warning", "loading"];

const TONE_CAPTION: Record<GridCardTone, string> = {
  default: "Neutral surface; use for standard choices.",
  mute: "De-emphasised or secondary actions.",
  error: "Validation or failure context.",
  success: "Confirmation or positive state.",
  warning: "Needs attention without being an error.",
  loading: "In-flight; tile is non-interactive (pulse).",
};

function GridCardShowcaseSurface({ children }: { children: ReactNode }) {
  return (
    <Surface
      className={cn(
        "border-border/80 from-muted/15 to-card relative overflow-hidden border p-6 ring-0 md:p-8",
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
      <div className="relative space-y-10">{children}</div>
    </Surface>
  );
}

function Subsection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div>
        <TypographyH3 className="text-base font-semibold">{title}</TypographyH3>
        <TypographyMuted className="mt-1 max-w-3xl text-sm">{description}</TypographyMuted>
      </div>
      {children}
    </div>
  );
}

export function GridCardExplorationSection() {
  return (
    <Section spacing="none">
      <div className="mb-6">
        <TypographyH2 className="text-xl font-semibold">Grid cards</TypographyH2>
        <TypographyMuted className="mt-1 max-w-3xl">
          Square and tall tiles for organisation pickers, create/add shortcuts, and sandbox links.
          Primitives: <span className="font-mono text-xs">GridCard</span>,{" "}
          <span className="font-mono text-xs">GridCardSelectOrganisation</span>,{" "}
          <span className="font-mono text-xs">GridCardVisualSlot</span> (presets{" "}
          <span className="font-mono text-xs">org</span>,{" "}
          <span className="font-mono text-xs">add</span>,{" "}
          <span className="font-mono text-xs">sandbox</span>), and{" "}
          <span className="font-mono text-xs">GridCardIcon</span>. Source:{" "}
          <span className="font-mono text-xs">@/components/ui/grid-card</span>.
        </TypographyMuted>
      </div>

      <GridCardShowcaseSurface>
        <Subsection
          title="Visual presets"
          description="Org initials, org with logo image, add (dashed), sandbox (route glyph), and a Lucide icon via GridCardIcon - all on the default variant and tone."
        >
          <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <CardReferenceName name="card.grid.default.org-initials" />
            <CardReferenceName name="card.grid.default.org-logo" />
            <CardReferenceName name="card.grid.default.add-shortcut" />
            <CardReferenceName name="card.grid.default.sandbox-shortcut" />
            <CardReferenceName name="card.grid.default.custom-icon" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <GridCard
              title="Northern District"
              description="Initials when no logo URL is available."
              ctaLabel="Open"
              href={DEMO_HREF}
              visual={<GridCardVisualSlot visual="org" initials="ND" />}
            />
            <GridCard
              title="With logo"
              description="Passes imageSrc into the org preset."
              ctaLabel="Open"
              href={DEMO_HREF}
              visual={
                <GridCardVisualSlot
                  visual="org"
                  imageSrc="/globe.svg"
                  imageAlt="Sample organisation logo"
                />
              }
            />
            <GridCard
              title="Create organisation"
              description="Dashed border tile for add flows."
              ctaLabel="Start setup"
              href={DEMO_HREF}
              visual={<GridCardVisualSlot visual="add" />}
            />
            <GridCard
              title="Route Lab"
              description="Sandbox shortcut preset."
              ctaLabel="Open"
              href={DEMO_HREF}
              visual={<GridCardVisualSlot visual="sandbox" />}
            />
            <GridCard
              title="Custom icon"
              description="Any Lucide icon in the standard media frame."
              ctaLabel="Open"
              href={DEMO_HREF}
              visual={<GridCardIcon icon={Building2} />}
            />
          </div>
        </Subsection>

        <Subsection
          title="Layout variant"
          description="default uses the card surface; reverse fills with primary for emphasis (same pattern as create-org on select-organisation)."
        >
          <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <CardReferenceName name="card.grid.default.sandbox" />
            <CardReferenceName name="card.grid.reverse.sandbox" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <GridCard
              variant="default"
              title="Default variant"
              description="Muted card background and primary accents."
              ctaLabel="Action"
              href={DEMO_HREF}
              visual={<GridCardVisualSlot visual="sandbox" />}
            />
            <GridCard
              variant="reverse"
              title="Reverse variant"
              description="Primary fill with contrasting foreground."
              ctaLabel="Action"
              href={DEMO_HREF}
              visual={<GridCardVisualSlot visual="sandbox" />}
            />
          </div>
        </Subsection>

        <Subsection
          title="Semantic tones (default variant)"
          description="tone composes on top of variant for mute, error, success, warning, and loading states."
        >
          <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {TONES.map((tone) => (
              <CardReferenceName key={`ref-default-${tone}`} name={`card.grid.default.${tone}`} />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TONES.map((tone) => (
              <GridCard
                key={`def-${tone}`}
                variant="default"
                tone={tone}
                title={tone === "default" ? "Tone: default" : `Tone: ${tone}`}
                description={TONE_CAPTION[tone]}
                ctaLabel="Action"
                {...(tone === "loading" ? {} : { href: DEMO_HREF })}
                {...(tone === "loading" ? { onClick: () => undefined } : {})}
                visual={<GridCardVisualSlot visual="org" initials="AB" />}
              />
            ))}
          </div>
        </Subsection>

        <Subsection
          title="Semantic tones (reverse variant)"
          description="Same tones on the primary-filled tile for high-contrast contexts."
        >
          <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {TONES.map((tone) => (
              <CardReferenceName key={`ref-reverse-${tone}`} name={`card.grid.reverse.${tone}`} />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TONES.map((tone) => (
              <GridCard
                key={`rev-${tone}`}
                variant="reverse"
                tone={tone}
                title={tone === "default" ? "Tone: default" : `Tone: ${tone}`}
                description={TONE_CAPTION[tone]}
                ctaLabel="Action"
                {...(tone === "loading" ? {} : { href: DEMO_HREF })}
                {...(tone === "loading" ? { onClick: () => undefined } : {})}
                visual={<GridCardVisualSlot visual="org" initials="AB" />}
              />
            ))}
          </div>
        </Subsection>

        <Subsection
          title="Visual slot emphasis"
          description='emphasis="strong" (default) is the members-area default: larger glyph and stronger hover ring. emphasis="default" is lighter.'
        >
          <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <CardReferenceName name="card.grid.sandbox.strong" />
            <CardReferenceName name="card.grid.sandbox.default" />
            <CardReferenceName name="card.grid.add.strong" />
            <CardReferenceName name="card.grid.add.default" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <GridCard
              title="Sandbox / strong"
              description="Default emphasis."
              ctaLabel="Open"
              href={DEMO_HREF}
              visual={<GridCardVisualSlot visual="sandbox" emphasis="strong" />}
            />
            <GridCard
              title="Sandbox / default"
              description="Smaller icon, subtler hover."
              ctaLabel="Open"
              href={DEMO_HREF}
              visual={<GridCardVisualSlot visual="sandbox" emphasis="default" />}
            />
            <GridCard
              title="Add / strong"
              description="Default emphasis."
              ctaLabel="Add"
              href={DEMO_HREF}
              visual={<GridCardVisualSlot visual="add" emphasis="strong" />}
            />
            <GridCard
              title="Add / default"
              description="Lighter plus mark."
              ctaLabel="Add"
              href={DEMO_HREF}
              visual={<GridCardVisualSlot visual="add" emphasis="default" />}
            />
          </div>
        </Subsection>

        <Subsection
          title="Select organisation tile"
          description="GridCardSelectOrganisation is the square tile used on /select-organisation: title, optional sport line, visual, optional Active/Setup rows, and CTA."
        >
          <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <CardReferenceName name="card.grid-select.org-active" />
            <CardReferenceName name="card.grid-select.org-pending" />
            <CardReferenceName name="card.grid-select.create" />
            <CardReferenceName name="card.grid-select.loading" />
          </div>
          <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 2xl:grid-cols-6">
            <GridCardSelectOrganisation
              className="mx-0 w-full"
              title="Eastern Suburbs FC"
              sport="Football"
              isActive
              isSetup
              ctaLabel="Open dashboard"
              href={DEMO_HREF}
              visual={
                <GridCardVisualSlot visual="org" initials="ES" imageSrc="/globe.svg" imageAlt="" />
              }
            />
            <GridCardSelectOrganisation
              className="mx-0 w-full"
              title="Westside Netball"
              sport="Netball"
              isActive={false}
              isSetup={false}
              ctaLabel="View organisation"
              href={DEMO_HREF}
              visual={<GridCardVisualSlot visual="org" initials="WN" />}
            />
            <GridCardSelectOrganisation
              className="mx-0 w-full"
              variant="reverse"
              tone="mute"
              title="Create organisation"
              ctaLabel="Create organisation"
              href={DEMO_HREF}
              visual={<GridCardVisualSlot visual="add" />}
            />
            <GridCardSelectOrganisation
              className="mx-0 w-full"
              tone="loading"
              title="Loading state"
              ctaLabel="Please wait"
              onClick={() => undefined}
              visual={<GridCardVisualSlot visual="org" initials=".." />}
            />
          </div>
        </Subsection>

        <Subsection
          title="Icon tile (sandbox portal pattern)"
          description="Same composition as the /sandbox portal: title, short CTA, GridCardIcon, and optional description for assistive copy."
        >
          <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            <CardReferenceName name="card.grid-icon.kitchen-sink" />
            <CardReferenceName name="card.grid-icon.route-lab" />
            <CardReferenceName name="card.grid-icon.disabled" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <GridCard
              title="Kitchen Sink"
              description="Design reference sections."
              ctaLabel="Open"
              href={ROUTES.kitchenSink}
              visual={<GridCardIcon icon={LayoutGrid} />}
            />
            <GridCard
              title="Route Lab"
              description="Flow and layout experiments."
              ctaLabel="Open"
              href={ROUTES.routeLab}
              visual={<GridCardIcon icon={Route} />}
            />
            <GridCard
              title="Coming Soon"
              description="Unavailable shortcut tile."
              ctaLabel="Unavailable"
              disabled
              visual={<GridCardIcon icon={Building2} />}
            />
          </div>
        </Subsection>
      </GridCardShowcaseSurface>
    </Section>
  );
}
