"use client";

import {
  Archive,
  Calendar,
  Check,
  ChevronRight,
  Copy,
  FileText,
  Mail,
  MoreHorizontal,
  Plus,
  Settings,
  ShieldCheck,
  Trophy,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";

import { TypographyH2, TypographyH4, TypographyMuted } from "@/components/typography";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command";
import { PageHeader, Section, Surface } from "@/components/ui/container";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

import type { LucideIcon } from "lucide-react";

const DIVIDED_ITEMS = [
  { title: "Season registration", description: "Closes 30 April · 12 teams" },
  { title: "Fixture publish", description: "Scheduled for next Monday" },
  { title: "Sponsor assets", description: "3 items pending review" },
];

const CARD_ROWS = [
  {
    title: "Email notifications",
    description: "Digest for match results and club news",
  },
  {
    title: "Billing contacts",
    description: "Who receives invoices and receipts",
  },
  {
    title: "API access",
    description: "Keys and webhook endpoints",
  },
];

const CHILD_LIST_GROUPS = [
  {
    title: "Registration setup",
    meta: "3 tasks",
    children: ["Open team nominations", "Review age groups", "Confirm venue access"],
  },
  {
    title: "Fixture publishing",
    meta: "2 tasks",
    children: ["Generate draft rounds", "Send approval notice"],
  },
  {
    title: "Media pack",
    meta: "4 assets",
    children: ["Hero image", "Sponsor lockup", "Round tile", "Social caption"],
  },
];

const SELECTABLE_ITEMS: {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  disabled?: boolean;
}[] = [
  {
    id: "fixtures",
    title: "Fixtures",
    description: "Round-by-round schedule",
    icon: Calendar,
  },
  {
    id: "ladders",
    title: "Ladders",
    description: "Points and standings",
    icon: Trophy,
  },
  {
    id: "archived",
    title: "Archived seasons",
    description: "Read-only history",
    icon: Archive,
    disabled: true,
  },
];

const MEMBER_ROWS = [
  {
    initials: "AC",
    name: "Alex Chen",
    role: "Admin",
    status: "Active" as const,
  },
  {
    initials: "MJ",
    name: "Morgan Jones",
    role: "Editor",
    status: "Pending" as const,
  },
  {
    initials: "SK",
    name: "Sam Kumar",
    role: "Viewer",
    status: "Active" as const,
  },
];

const LIST_NAMING_EXAMPLES = [
  "list.stack.divided.basic",
  "list.card-row.settings.basic",
  "list.nested.children.indented",
  "list.selectable.single.default",
  "list.rich-row.avatar.meta",
  "list.menu.overlay.grouped",
];

function ListReferenceName({ name }: { name: string }) {
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

function ListVariantInventory() {
  return (
    <Section spacing="none">
      <div className="mb-6">
        <TypographyH2 className="text-xl font-semibold">List naming convention</TypographyH2>
        <TypographyMuted className="mt-1 max-w-3xl">
          Use dot-separated handles in the shape list.family.variant.state. Keep names stable so
          future prompts can refer to a list pattern directly.
        </TypographyMuted>
      </div>

      <Surface className="space-y-8">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {LIST_NAMING_EXAMPLES.map((name) => (
            <ListReferenceName key={name} name={name} />
          ))}
        </div>
      </Surface>
    </Section>
  );
}

function ListSectionSeparator({ label }: { label: string }) {
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

export default function ListsPage() {
  const [selectedId, setSelectedId] = useState<string>("fixtures");

  return (
    <div className="space-y-12 pb-20">
      <PageHeader
        title="Lists"
        description="Composed list patterns built from cards, separators, avatars, menus, and command surfaces. For tabular data, use the Tables reference."
      />

      <div className="space-y-16">
        <ListSectionSeparator label="Divided stack lists" />

        <Section spacing="none">
          <div className="mb-6">
            <TypographyH2 className="text-xl font-semibold">Divided stack</TypographyH2>
            <TypographyMuted className="mt-1">
              Minimal read-only rows with a primary line and muted secondary line, separated with
              borders.
            </TypographyMuted>
          </div>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="space-y-3">
              <ListReferenceName name="list.stack.divided.basic" />
              <div className="bg-card/50 rounded-xl border p-6">
                <ul className="flex flex-col gap-0">
                  {DIVIDED_ITEMS.map((item, i) => (
                    <li key={item.title}>
                      {i > 0 ? <Separator className="my-3" /> : null}
                      <div className="space-y-1">
                        <TypographyH4 className="text-sm font-medium">{item.title}</TypographyH4>
                        <TypographyMuted className="text-xs">{item.description}</TypographyMuted>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="space-y-3">
              <ListReferenceName name="list.stack.divided.dense" />
              <div className="bg-card/50 rounded-xl border px-4 py-3">
                <ul className="divide-border divide-y">
                  {["Round setup", "Fixture audit", "Asset export", "Publish queue"].map((item) => (
                    <li key={item} className="py-2">
                      <TypographyH4 className="text-xs font-medium">{item}</TypographyH4>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="space-y-3">
              <ListReferenceName name="list.stack.divided.with-meta" />
              <div className="bg-card/50 rounded-xl border p-6">
                <ul className="divide-border divide-y">
                  {[
                    ["Template review", "Due today", "A. Chen"],
                    ["Media upload", "12 assets", "M. Jones"],
                    ["Season sync", "Updated 8 min ago", "System"],
                  ].map(([title, meta, owner]) => (
                    <li
                      key={title}
                      className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0"
                    >
                      <div className="min-w-0 space-y-1">
                        <TypographyH4 className="text-sm font-medium">{title}</TypographyH4>
                        <TypographyMuted className="text-xs">{meta}</TypographyMuted>
                      </div>
                      <TypographyMuted className="shrink-0 text-xs">{owner}</TypographyMuted>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="space-y-3">
              <ListReferenceName name="list.stack.divided.with-status" />
              <div className="bg-card/50 rounded-xl border p-6">
                <ul className="divide-border divide-y">
                  {[
                    ["Brand profile", "Ready", "success"],
                    ["Payment details", "Review", "warning"],
                    ["API connection", "Blocked", "destructive"],
                  ].map(([title, status, tone]) => (
                    <li
                      key={title}
                      className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <ShieldCheck
                          className={cn(
                            "size-4 shrink-0",
                            tone === "success" && "text-success",
                            tone === "warning" && "text-warning",
                            tone === "destructive" && "text-destructive",
                          )}
                          aria-hidden
                        />
                        <TypographyH4 className="truncate text-sm font-medium">
                          {title}
                        </TypographyH4>
                      </div>
                      <Badge
                        variant={tone === "destructive" ? "destructive" : "secondary"}
                        className={cn(
                          "shrink-0 text-[10px] font-normal",
                          tone === "success" && "bg-success/10 text-success",
                          tone === "warning" && "bg-warning/10 text-warning",
                        )}
                      >
                        {status}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Section>

        <ListSectionSeparator label="Card row lists" />

        <Section spacing="none">
          <div className="mb-6">
            <TypographyH2 className="text-xl font-semibold">Card row list</TypographyH2>
            <TypographyMuted className="mt-1">
              Inset settings-style rows inside a card: title, description, and trailing affordance.
            </TypographyMuted>
          </div>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="space-y-3">
              <ListReferenceName name="list.card-row.settings.basic" />
              <Surface className="overflow-hidden p-0">
                <div className="bg-muted border-b px-6 py-4">
                  <TypographyH4 className="text-sm font-semibold">Organisation</TypographyH4>
                  <TypographyMuted className="mt-1 text-sm">
                    Manage how your club appears to members.
                  </TypographyMuted>
                </div>
                <div className="px-0 pb-0">
                  <ul>
                    {CARD_ROWS.map((row) => (
                      <li
                        key={row.title}
                        className="border-border flex items-center justify-between gap-4 border-b px-6 py-4 last:border-b-0"
                      >
                        <div className="min-w-0 space-y-1">
                          <div className="text-sm font-medium">{row.title}</div>
                          <TypographyMuted className="text-xs">{row.description}</TypographyMuted>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </Surface>
            </div>

            <div className="space-y-3">
              <ListReferenceName name="list.card-row.settings.trailing-icon" />
              <Surface className="overflow-hidden p-0">
                <div className="bg-muted border-b px-6 py-4">
                  <TypographyH4 className="text-sm font-semibold">Navigation rows</TypographyH4>
                  <TypographyMuted className="mt-1 text-sm">
                    Rows that open a nested detail view.
                  </TypographyMuted>
                </div>
                <div className="px-0 pb-0">
                  <ul>
                    {CARD_ROWS.map((row) => (
                      <li
                        key={row.title}
                        className="border-border hover:bg-muted/40 flex cursor-pointer items-center justify-between gap-4 border-b px-6 py-4 transition-colors last:border-b-0"
                      >
                        <div className="min-w-0 space-y-1">
                          <div className="text-sm font-medium">{row.title}</div>
                          <TypographyMuted className="text-xs">{row.description}</TypographyMuted>
                        </div>
                        <ChevronRight
                          className="text-muted-foreground size-4 shrink-0"
                          aria-hidden
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              </Surface>
            </div>

            <div className="space-y-3">
              <ListReferenceName name="list.card-row.settings.toggle" />
              <Surface className="overflow-hidden p-0">
                <div className="bg-muted border-b px-6 py-4">
                  <TypographyH4 className="text-sm font-semibold">
                    Notification toggles
                  </TypographyH4>
                  <TypographyMuted className="mt-1 text-sm">
                    Rows with a right-aligned binary setting.
                  </TypographyMuted>
                </div>
                <div className="px-0 pb-0">
                  <ul>
                    {[
                      ["Weekly digest", "Send a Monday summary", true],
                      ["Fixture changes", "Alert admins when schedules move", true],
                      ["Marketing updates", "Receive product and feature notes", false],
                    ].map(([title, description, checked]) => (
                      <li
                        key={String(title)}
                        className="border-border flex items-center justify-between gap-4 border-b px-6 py-4 last:border-b-0"
                      >
                        <div className="min-w-0 space-y-1">
                          <div className="text-sm font-medium">{title}</div>
                          <TypographyMuted className="text-xs">{description}</TypographyMuted>
                        </div>
                        <Switch
                          defaultChecked={Boolean(checked)}
                          aria-label={`Toggle ${title}`}
                          className="shrink-0"
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              </Surface>
            </div>

            <div className="space-y-3">
              <ListReferenceName name="list.card-row.settings.destructive" />
              <Surface className="border-destructive/15 ring-destructive/10 overflow-hidden p-0">
                <div className="bg-muted border-b px-6 py-4">
                  <TypographyH4 className="text-sm font-semibold">Danger zone</TypographyH4>
                  <TypographyMuted className="mt-1 text-sm">
                    Destructive settings stay visually separated.
                  </TypographyMuted>
                </div>
                <div className="px-0 pb-0">
                  <ul>
                    {[
                      ["Archive organisation", "Move this club out of active workflows"],
                      ["Delete API token", "Revoke integrations using the current key"],
                      ["Remove billing contact", "Stop sending invoices to this recipient"],
                    ].map(([title, description]) => (
                      <li
                        key={title}
                        className="border-border hover:bg-destructive/5 flex items-center justify-between gap-4 border-b px-6 py-4 transition-colors last:border-b-0"
                      >
                        <div className="min-w-0 space-y-1">
                          <div className="text-destructive text-sm font-medium">{title}</div>
                          <TypographyMuted className="text-xs">{description}</TypographyMuted>
                        </div>
                        <Button variant="destructive" size="sm" className="shrink-0">
                          Remove
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              </Surface>
            </div>
          </div>
        </Section>

        <ListSectionSeparator label="Selectable lists" />

        <Section spacing="none">
          <div className="mb-6">
            <TypographyH2 className="text-xl font-semibold">Selectable list</TypographyH2>
            <TypographyMuted className="mt-1">
              Selectable rows for single choice, icon-led choices, disabled states, checkboxes, and
              radio semantics.
            </TypographyMuted>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="space-y-3">
              <ListReferenceName name="list.selectable.single.default" />
              <div className="bg-card/50 rounded-xl border p-2">
                <ul className="flex flex-col gap-1" role="listbox" aria-label="Report scope">
                  {SELECTABLE_ITEMS.filter((item) => !item.disabled).map((item) => {
                    const isSelected = selectedId === item.id;
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => setSelectedId(item.id)}
                          className={cn(
                            "flex w-full items-start rounded-lg border px-3 py-3 text-left transition-colors",
                            "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
                            isSelected
                              ? "border-primary/25 bg-primary/10 ring-primary/20 text-primary shadow-sm ring-1"
                              : "hover:border-primary/15 hover:bg-primary/5 border-transparent",
                          )}
                        >
                          <span className="min-w-0 flex-1 space-y-0.5">
                            <span className="block text-sm font-medium">{item.title}</span>
                            <TypographyMuted
                              className={cn("text-xs", isSelected && "text-primary/80")}
                            >
                              {item.description}
                            </TypographyMuted>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            <div className="space-y-3">
              <ListReferenceName name="list.selectable.single.icon" />
              <div className="bg-card/50 rounded-xl border p-2">
                <ul className="flex flex-col gap-1" role="listbox" aria-label="Content area">
                  {SELECTABLE_ITEMS.filter((item) => !item.disabled).map((item) => {
                    const isSelected = selectedId === item.id;
                    const Icon = item.icon;
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => setSelectedId(item.id)}
                          className={cn(
                            "flex w-full items-start gap-3 rounded-lg border px-3 py-3 text-left transition-colors",
                            "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
                            isSelected
                              ? "border-primary/25 bg-primary/10 ring-primary/20 text-primary shadow-sm ring-1"
                              : "hover:border-primary/15 hover:bg-primary/5 border-transparent",
                          )}
                        >
                          <span
                            className={cn(
                              "border-border bg-card text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-lg border transition-colors",
                              isSelected && "border-primary/40 bg-primary/15 text-primary",
                            )}
                            aria-hidden
                          >
                            <Icon className="size-4 shrink-0" strokeWidth={2} />
                          </span>
                          <span className="min-w-0 flex-1 space-y-0.5">
                            <span className="block text-sm font-medium">{item.title}</span>
                            <TypographyMuted
                              className={cn("text-xs", isSelected && "text-primary/80")}
                            >
                              {item.description}
                            </TypographyMuted>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            <div className="space-y-3">
              <ListReferenceName name="list.selectable.single.disabled" />
              <div className="bg-card/50 rounded-xl border p-2">
                <ul className="flex flex-col gap-1" role="listbox" aria-label="Season views">
                  {SELECTABLE_ITEMS.map((item) => {
                    const isSelected = !item.disabled && selectedId === item.id;
                    const Icon = item.icon;
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          disabled={item.disabled}
                          role="option"
                          aria-selected={isSelected}
                          aria-disabled={item.disabled ? true : undefined}
                          onClick={() => setSelectedId(item.id)}
                          className={cn(
                            "flex w-full items-start gap-3 rounded-lg border px-3 py-3 text-left transition-colors",
                            "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
                            item.disabled
                              ? "border-border/60 text-muted-foreground cursor-not-allowed opacity-60"
                              : isSelected
                                ? "border-primary/25 bg-primary/10 ring-primary/20 text-primary shadow-sm ring-1"
                                : "hover:border-primary/15 hover:bg-primary/5 border-transparent",
                          )}
                        >
                          <span
                            className={cn(
                              "flex size-9 shrink-0 items-center justify-center rounded-lg border transition-colors",
                              item.disabled && "border-border bg-muted/40 text-muted-foreground",
                              !item.disabled &&
                                !isSelected &&
                                "border-border bg-card text-muted-foreground",
                              !item.disabled &&
                                isSelected &&
                                "border-primary/40 bg-primary/15 text-primary",
                            )}
                            aria-hidden
                          >
                            <Icon className="size-4 shrink-0" strokeWidth={2} />
                          </span>
                          <span className="min-w-0 flex-1 space-y-0.5">
                            <span className="block text-sm font-medium">{item.title}</span>
                            <TypographyMuted
                              className={cn("text-xs", isSelected && "text-primary/80")}
                            >
                              {item.description}
                            </TypographyMuted>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            <div className="space-y-3">
              <ListReferenceName name="list.selectable.multi.checkbox" />
              <div className="bg-card/50 rounded-xl border p-2">
                <ul className="flex flex-col gap-1" aria-label="Export modules">
                  {SELECTABLE_ITEMS.filter((item) => !item.disabled).map((item, index) => (
                    <li key={item.id}>
                      <label className="hover:bg-muted/40 flex cursor-pointer items-start gap-3 rounded-lg px-3 py-3 transition-colors">
                        <Checkbox
                          defaultChecked={index === 0}
                          aria-label={`Select ${item.title}`}
                        />
                        <span className="min-w-0 flex-1 space-y-0.5">
                          <span className="block text-sm font-medium">{item.title}</span>
                          <TypographyMuted className="text-xs">{item.description}</TypographyMuted>
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="space-y-3 lg:col-span-2">
              <ListReferenceName name="list.selectable.radio" />
              <div className="bg-card/50 max-w-lg rounded-xl border p-2">
                <fieldset>
                  <legend className="sr-only">Default landing view</legend>
                  <ul className="flex flex-col gap-1">
                    {SELECTABLE_ITEMS.filter((item) => !item.disabled).map((item, index) => (
                      <li key={item.id}>
                        <label className="hover:bg-muted/40 has-checked:border-primary/25 has-checked:bg-primary/10 has-checked:ring-primary/20 flex cursor-pointer items-start gap-3 rounded-lg border border-transparent px-3 py-3 transition-colors has-checked:ring-1">
                          <input
                            type="radio"
                            name="default-list-view"
                            defaultChecked={index === 0}
                            className="border-input text-primary focus-visible:ring-ring/50 mt-0.5 size-4 shrink-0 appearance-none rounded-full border bg-transparent shadow-xs transition-shadow checked:border-[5px] focus-visible:ring-[3px] focus-visible:outline-none"
                          />
                          <span className="min-w-0 flex-1 space-y-0.5">
                            <span className="block text-sm font-medium">{item.title}</span>
                            <TypographyMuted className="text-xs">
                              {item.description}
                            </TypographyMuted>
                          </span>
                        </label>
                      </li>
                    ))}
                  </ul>
                </fieldset>
              </div>
            </div>
          </div>
        </Section>

        <ListSectionSeparator label="Rich row lists" />

        <Section spacing="none">
          <div className="mb-6">
            <TypographyH2 className="text-xl font-semibold">Rich row (avatar + meta)</TypographyH2>
            <TypographyMuted className="mt-1">
              Member-style rows with avatars, metadata, status badges, action menus, and compact
              drawer-friendly spacing.
            </TypographyMuted>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="space-y-3">
              <ListReferenceName name="list.rich-row.avatar.meta" />
              <div className="bg-card/50 divide-y rounded-xl border">
                <ul>
                  {MEMBER_ROWS.map((row) => (
                    <li key={row.name} className="flex items-center gap-3 p-4">
                      <Avatar className="size-10">
                        <AvatarFallback className="text-xs font-medium">
                          {row.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">{row.name}</div>
                        <TypographyMuted className="text-xs">{row.role}</TypographyMuted>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="space-y-3">
              <ListReferenceName name="list.rich-row.avatar.status" />
              <div className="bg-card/50 divide-y rounded-xl border">
                <ul>
                  {MEMBER_ROWS.map((row) => (
                    <li key={row.name} className="flex items-center gap-3 p-4">
                      <Avatar className="size-10">
                        <AvatarFallback className="text-xs font-medium">
                          {row.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">{row.name}</div>
                        <TypographyMuted className="text-xs">{row.role}</TypographyMuted>
                      </div>
                      <Badge
                        variant={row.status === "Active" ? "secondary" : "outline"}
                        className={cn(
                          "shrink-0 text-[10px] font-normal",
                          row.status === "Active" && "bg-success/10 text-success",
                        )}
                      >
                        {row.status}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="space-y-3">
              <ListReferenceName name="list.rich-row.avatar.actions" />
              <div className="bg-card/50 divide-y rounded-xl border">
                <ul>
                  {MEMBER_ROWS.map((row) => (
                    <li key={row.name} className="flex items-center gap-3 p-4">
                      <Avatar className="size-10">
                        <AvatarFallback className="text-xs font-medium">
                          {row.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">{row.name}</div>
                        <TypographyMuted className="text-xs">{row.role}</TypographyMuted>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="shrink-0"
                            aria-label={`Actions for ${row.name}`}
                          >
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem>
                            <Mail className="size-4" />
                            Message
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <User className="size-4" />
                            View profile
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="space-y-3">
              <ListReferenceName name="list.rich-row.compact" />
              <div className="bg-card/50 divide-y rounded-xl border">
                <ul>
                  {MEMBER_ROWS.map((row) => (
                    <li key={row.name} className="flex items-center gap-2 px-3 py-2.5">
                      <Avatar className="size-7">
                        <AvatarFallback className="text-[10px] font-medium">
                          {row.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-xs font-medium">{row.name}</div>
                        <TypographyMuted className="truncate text-[11px]">
                          {row.role}
                        </TypographyMuted>
                      </div>
                      <Badge variant="secondary" className="shrink-0 text-[10px] font-normal">
                        {row.status}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Section>

        <ListSectionSeparator label="Overlay menu lists" />

        <Section spacing="none">
          <div className="mb-6">
            <TypographyH2 className="text-xl font-semibold">Overlay menu list</TypographyH2>
            <TypographyMuted className="mt-1">
              Compact action menus with grouped sections, shortcut hints, destructive separation,
              and checkbox items.
            </TypographyMuted>
          </div>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="space-y-3">
              <ListReferenceName name="list.menu.overlay.grouped" />
              <div className="bg-card/50 flex min-h-[120px] items-center justify-center rounded-xl border border-dashed p-10">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">Open actions</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="start">
                    <DropdownMenuLabel>Quick actions</DropdownMenuLabel>
                    <DropdownMenuGroup>
                      <DropdownMenuItem>
                        <Plus className="size-4" />
                        New bundle
                        <DropdownMenuShortcut>⌘N</DropdownMenuShortcut>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <FileText className="size-4" />
                        Duplicate template
                        <DropdownMenuShortcut>⌘D</DropdownMenuShortcut>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem>
                        <Settings className="size-4" />
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Calendar className="size-4" />
                        Season calendar
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="space-y-3">
              <ListReferenceName name="list.menu.overlay.shortcuts" />
              <div className="bg-card/50 flex min-h-[120px] items-center justify-center rounded-xl border border-dashed p-10">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">Shortcut menu</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="start">
                    <DropdownMenuItem>
                      <Plus className="size-4" />
                      New bundle
                      <DropdownMenuShortcut>Ctrl N</DropdownMenuShortcut>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Copy className="size-4" />
                      Clone from season
                      <DropdownMenuShortcut>Ctrl D</DropdownMenuShortcut>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="size-4" />
                      Open settings
                      <DropdownMenuShortcut>Ctrl ,</DropdownMenuShortcut>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="space-y-3">
              <ListReferenceName name="list.menu.overlay.destructive" />
              <div className="bg-card/50 flex min-h-[120px] items-center justify-center rounded-xl border border-dashed p-10">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">Destructive menu</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="start">
                    <DropdownMenuLabel>Template</DropdownMenuLabel>
                    <DropdownMenuItem>
                      <FileText className="size-4" />
                      Edit details
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Copy className="size-4" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive">
                      <Archive className="size-4" />
                      Archive template
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="space-y-3">
              <ListReferenceName name="list.menu.overlay.checkbox" />
              <div className="bg-card/50 flex min-h-[120px] items-center justify-center rounded-xl border border-dashed p-10">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">Filter menu</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="start">
                    <DropdownMenuLabel>Visible modules</DropdownMenuLabel>
                    <DropdownMenuCheckboxItem checked>Fixtures</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem checked>Ladders</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem>Media assets</DropdownMenuCheckboxItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Settings className="size-4" />
                      Manage filters
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </Section>

        <ListSectionSeparator label="Command/search lists" />

        <Section spacing="none">
          <div className="mb-6">
            <TypographyH2 className="text-xl font-semibold">Searchable command list</TypographyH2>
            <TypographyMuted className="mt-1">
              Filterable list (cmdk) inside a popover—useful for pickers and quick jumps.
            </TypographyMuted>
          </div>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="space-y-3">
              <ListReferenceName name="list.command.search.popover" />
              <div className="bg-card/50 flex min-h-[200px] flex-col items-center justify-center rounded-xl border border-dashed p-10">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="brand">Search actions…</Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[min(100%,22rem)] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Type to filter…" />
                      <CommandList>
                        <CommandEmpty>No results.</CommandEmpty>
                        <CommandGroup heading="Templates">
                          <CommandItem>
                            <FileText className="size-4" />
                            <span>Match day recap</span>
                            <CommandShortcut>↵</CommandShortcut>
                          </CommandItem>
                          <CommandItem>
                            <Copy className="size-4" />
                            <span>Clone from season</span>
                          </CommandItem>
                        </CommandGroup>
                        <CommandGroup heading="Organisation">
                          <CommandItem>
                            <Settings className="size-4" />
                            <span>Branding</span>
                          </CommandItem>
                          <CommandItem>
                            <User className="size-4" />
                            <span>Team roster</span>
                          </CommandItem>
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-3">
              <ListReferenceName name="list.command.search.empty" />
              <div className="bg-card/50 flex min-h-[200px] flex-col justify-center rounded-xl border border-dashed p-10">
                <Command className="border">
                  <CommandInput
                    placeholder="Search archived actions"
                    value="no matching result"
                    readOnly
                  />
                  <CommandList>
                    <CommandEmpty>No actions found.</CommandEmpty>
                  </CommandList>
                </Command>
              </div>
            </div>

            <div className="space-y-3">
              <ListReferenceName name="list.command.search.grouped" />
              <div className="bg-card/50 flex min-h-[200px] flex-col justify-center rounded-xl border border-dashed p-10">
                <Command className="border">
                  <CommandInput placeholder="Search modules" />
                  <CommandList>
                    <CommandGroup heading="Templates">
                      <CommandItem>
                        <FileText className="size-4" />
                        <span>Match day recap</span>
                      </CommandItem>
                      <CommandItem>
                        <Copy className="size-4" />
                        <span>Clone from season</span>
                      </CommandItem>
                    </CommandGroup>
                    <CommandGroup heading="Organisation">
                      <CommandItem>
                        <Settings className="size-4" />
                        <span>Branding</span>
                      </CommandItem>
                      <CommandItem>
                        <User className="size-4" />
                        <span>Team roster</span>
                      </CommandItem>
                    </CommandGroup>
                  </CommandList>
                </Command>
              </div>
            </div>

            <div className="space-y-3">
              <ListReferenceName name="list.command.search.shortcuts" />
              <div className="bg-card/50 flex min-h-[200px] flex-col justify-center rounded-xl border border-dashed p-10">
                <Command className="border">
                  <CommandInput placeholder="Search quick actions" />
                  <CommandList>
                    <CommandGroup heading="Actions">
                      <CommandItem>
                        <Plus className="size-4" />
                        <span>New bundle</span>
                        <CommandShortcut>Ctrl N</CommandShortcut>
                      </CommandItem>
                      <CommandItem>
                        <Copy className="size-4" />
                        <span>Clone from season</span>
                        <CommandShortcut>Ctrl D</CommandShortcut>
                      </CommandItem>
                      <CommandItem>
                        <Settings className="size-4" />
                        <span>Open settings</span>
                        <CommandShortcut>Ctrl ,</CommandShortcut>
                      </CommandItem>
                    </CommandGroup>
                  </CommandList>
                </Command>
              </div>
            </div>
          </div>
        </Section>

        <ListSectionSeparator label="Nested child lists" />

        <Section spacing="none">
          <div className="mb-6">
            <TypographyH2 className="text-xl font-semibold">Nested child lists</TypographyH2>
            <TypographyMuted className="mt-1">
              Parent rows with visible child rows for grouped tasks, expandable detail, and nested
              checklist workflows.
            </TypographyMuted>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="space-y-3">
              <ListReferenceName name="list.nested.children.indented" />
              <div className="bg-card/50 rounded-xl border p-2">
                <ul className="space-y-1">
                  {CHILD_LIST_GROUPS.map((group) => (
                    <li key={group.title} className="rounded-lg px-3 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <TypographyH4 className="truncate text-sm font-medium">
                            {group.title}
                          </TypographyH4>
                          <TypographyMuted className="text-xs">{group.meta}</TypographyMuted>
                        </div>
                        <Badge variant="secondary" className="shrink-0 text-[10px] font-normal">
                          Parent
                        </Badge>
                      </div>
                      <ul className="border-border mt-3 space-y-2 border-l pl-4">
                        {group.children.map((child) => (
                          <li key={child} className="text-muted-foreground text-xs">
                            {child}
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="space-y-3">
              <ListReferenceName name="list.nested.children.collapsible" />
              <div className="bg-card/50 rounded-xl border p-2">
                <ul className="space-y-1">
                  {CHILD_LIST_GROUPS.map((group, index) => (
                    <li key={group.title}>
                      <details
                        className="group open:bg-muted/35 rounded-lg border border-transparent"
                        open={index === 0}
                      >
                        <summary className="focus-visible:ring-ring flex cursor-pointer list-none items-center gap-3 rounded-lg px-3 py-3 focus-visible:ring-2 focus-visible:outline-none">
                          <ChevronRight
                            className="text-muted-foreground size-4 shrink-0 transition-transform group-open:rotate-90"
                            aria-hidden
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium">
                              {group.title}
                            </span>
                            <TypographyMuted className="text-xs">{group.meta}</TypographyMuted>
                          </span>
                        </summary>
                        <ul className="space-y-1 px-10 pb-3">
                          {group.children.map((child) => (
                            <li key={child} className="text-muted-foreground text-xs">
                              {child}
                            </li>
                          ))}
                        </ul>
                      </details>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="space-y-3 lg:col-span-2">
              <ListReferenceName name="list.nested.children.checklist" />
              <div className="bg-card/50 max-w-2xl rounded-xl border p-2">
                <ul className="divide-border divide-y">
                  {CHILD_LIST_GROUPS.slice(0, 2).map((group) => (
                    <li key={group.title} className="px-3 py-4">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <TypographyH4 className="truncate text-sm font-medium">
                            {group.title}
                          </TypographyH4>
                          <TypographyMuted className="text-xs">
                            Child rows with independent completion controls.
                          </TypographyMuted>
                        </div>
                        <Badge variant="outline" className="shrink-0 text-[10px] font-normal">
                          {group.children.length}
                        </Badge>
                      </div>
                      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {group.children.map((child, childIndex) => (
                          <li key={child}>
                            <label className="hover:bg-muted/40 flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 transition-colors">
                              <Checkbox
                                defaultChecked={childIndex === 0}
                                aria-label={`Mark ${child} complete`}
                              />
                              <span className="min-w-0 truncate text-xs">{child}</span>
                            </label>
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Section>

        <ListVariantInventory />
      </div>
    </div>
  );
}
