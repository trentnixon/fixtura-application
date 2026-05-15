"use client";

import {
  Bell,
  Box,
  ClipboardList,
  FormInput,
  Heading1,
  LayoutGrid,
  LayoutTemplate,
  List,
  Loader2,
  MessageSquare,
  MousePointerClick,
  Navigation,
  Palette,
  Rows4,
  PanelTop,
  Table,
  Type,
  type LucideIcon,
} from "lucide-react";

import { TypographyH1, TypographyMuted } from "@/components/typography";
import { GridCard, GridCardIcon } from "@/components/ui/grid-card";
import { ROUTES } from "@/lib/config/routes";

const K = ROUTES.kitchenSink;

const SECTIONS: {
  title: string;
  description: string;
  href: string;
  linkLabel: string;
  icon: LucideIcon;
}[] = [
  {
    title: "Typography",
    description: "Verify heading and body fonts, weights, and hierarchical sizing.",
    href: `${K}/typography`,
    linkLabel: "View Typography",
    icon: Type,
  },
  {
    title: "Brand Colors",
    description:
      "Showcase the expanded semantic color system including primary, success, error, warning and neutral tones.",
    href: `${K}/brand-colors`,
    linkLabel: "View Brand Colors",
    icon: Palette,
  },
  {
    title: "Containers",
    description:
      "A foundational set of structural components to ensure consistent page layouts, spacing, and rhythm.",
    href: `${K}/containers`,
    linkLabel: "View Containers",
    icon: Box,
  },
  {
    title: "Navigation",
    description:
      "Components for wayfinding and site structure, including nav menus, menubars, and breadcrumbs.",
    href: `${K}/navigation`,
    linkLabel: "View Navigation",
    icon: Navigation,
  },
  {
    title: "Sections & Dividers",
    description:
      "Reusable section wrappers, dividers, separators, and labels for page-level structure and rhythm.",
    href: `${K}/sections-and-dividers`,
    linkLabel: "View Sections & Dividers",
    icon: Rows4,
  },
  {
    title: "Page Headers",
    description:
      "Reference for the title section at the top of every members-area route — title, eyebrow, breadcrumbs, actions, metadata, tabs, and stats variants.",
    href: `${K}/page-headers`,
    linkLabel: "View Page Headers",
    icon: Heading1,
  },
  {
    title: "Buttons",
    description:
      "Essential interaction triggers including secondary, ghost, outline, and destructive variants.",
    href: `${K}/buttons`,
    linkLabel: "View Buttons",
    icon: MousePointerClick,
  },
  {
    title: "Cards",
    description:
      "Versatile content containers for dashboard modules, feed items, and grouped information.",
    href: `${K}/cards`,
    linkLabel: "View Cards",
    icon: LayoutGrid,
  },
  {
    title: "Toasts",
    description:
      "Brief, non-blocking feedback messages including success, error, and contextual alerts.",
    href: `${K}/toasts`,
    linkLabel: "View Toasts",
    icon: Bell,
  },
  {
    title: "Forms",
    description: "Standardized input layouts, validation patterns, and UI for complex data entry.",
    href: `${K}/forms`,
    linkLabel: "View Forms",
    icon: ClipboardList,
  },
  {
    title: "Dialogs",
    description: "Modal overlays for focused actions, alerts, and critical system confirmations.",
    href: `${K}/dialogs`,
    linkLabel: "View Dialogs",
    icon: MessageSquare,
  },
  {
    title: "Tables",
    description:
      "Structured data visualization with sorting, filtering, and standard row-based information density.",
    href: `${K}/tables`,
    linkLabel: "View Tables",
    icon: Table,
  },
  {
    title: "Tabber",
    description:
      "Tabbed views for related content: triggers, panels, and patterns for dense members-area screens.",
    href: `${K}/tabber`,
    linkLabel: "View Tabber",
    icon: LayoutTemplate,
  },
  {
    title: "Popovers",
    description:
      "Floating content panels for contextual information, small forms, and quick settings.",
    href: `${K}/popovers`,
    linkLabel: "View Popovers",
    icon: PanelTop,
  },
  {
    title: "Loading",
    description:
      "Standardized branded loaders, skeleton screens, and progress indicators for the platform.",
    href: `${K}/loading`,
    linkLabel: "View Loading",
    icon: Loader2,
  },
  {
    title: "Lists",
    description:
      "Stacked rows, card lists, avatar rows, menu lists, and searchable command lists for dense UI.",
    href: `${K}/lists`,
    linkLabel: "View Lists",
    icon: List,
  },
  {
    title: "Inputs",
    description:
      "Advanced control elements including Selects, Date Pickers, OTP inputs, and Sliders.",
    href: `${K}/inputs`,
    linkLabel: "View Inputs",
    icon: FormInput,
  },
];

export function KitchenSinkOverviewGrid() {
  return (
    <div className="space-y-6">
      <header className="border-border border-b pb-6">
        <TypographyH1 className="text-3xl font-bold">Design Reference</TypographyH1>
        <TypographyMuted className="mt-2 max-w-2xl text-lg">
          The Kitchen Sink is the live visual source of truth for Fixtura&apos;s UI patterns. It
          references our core design tokens like typography, colors, and primitive components.
        </TypographyMuted>
      </header>

      <div className="grid grid-cols-1 gap-4 pt-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {SECTIONS.map((section) => (
          <GridCard
            key={section.href}
            title={section.title}
            description={section.description}
            ctaLabel={section.linkLabel}
            href={section.href}
            visual={<GridCardIcon icon={section.icon} />}
          />
        ))}
      </div>
    </div>
  );
}
