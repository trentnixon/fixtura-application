"use client";

import {
  Archive,
  Calendar,
  ChevronRight,
  Copy,
  FileText,
  Mail,
  MoreHorizontal,
  Plus,
  Settings,
  Trophy,
  User,
} from "lucide-react";
import { useState } from "react";

import { TypographyH2, TypographyH4, TypographyMuted } from "@/components/typography";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command";
import { PageHeader, Section } from "@/components/ui/container";
import {
  DropdownMenu,
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

export default function ListsPage() {
  const [selectedId, setSelectedId] = useState<string>("fixtures");

  return (
    <div className="space-y-12 pb-20">
      <PageHeader
        title="Lists"
        description="Composed list patterns built from cards, separators, avatars, menus, and command surfaces. For tabular data, use the Tables reference."
      />

      <div className="space-y-16">
        <Section spacing="none">
          <div className="mb-6">
            <TypographyH2 className="text-xl font-semibold">Divided stack</TypographyH2>
            <TypographyMuted className="mt-1">
              Minimal read-only rows with a primary line and muted secondary line, separated with
              borders.
            </TypographyMuted>
          </div>
          <div className="bg-card/50 max-w-lg rounded-xl border p-6">
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
        </Section>

        <Section spacing="none">
          <div className="mb-6">
            <TypographyH2 className="text-xl font-semibold">Card row list</TypographyH2>
            <TypographyMuted className="mt-1">
              Inset settings-style rows inside a card: title, description, and trailing affordance.
            </TypographyMuted>
          </div>
          <Card className="max-w-lg py-0 shadow-md ring-1">
            <CardHeader className="border-border border-b pb-4">
              <CardTitle>Organisation</CardTitle>
              <CardDescription>Manage how your club appears to members.</CardDescription>
            </CardHeader>
            <CardContent className="px-0 pb-0">
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
                    <ChevronRight className="text-muted-foreground size-4 shrink-0" aria-hidden />
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </Section>

        <Section spacing="none">
          <div className="mb-6">
            <TypographyH2 className="text-xl font-semibold">Selectable list</TypographyH2>
            <TypographyMuted className="mt-1">
              Single-select rows: click to choose an active item, hover affordance, disabled rows,
              and pointer cursor on enabled items. Uses native buttons for semantics and keyboard
              focus.
            </TypographyMuted>
          </div>
          <div className="bg-card/50 max-w-lg rounded-xl border p-2">
            <ul className="flex flex-col gap-1" role="listbox" aria-label="Report scope">
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
                          : cn(
                              "text-foreground cursor-pointer",
                              isSelected
                                ? "border-primary/25 bg-primary/10 ring-primary/20 hover:bg-primary/15 shadow-sm ring-1"
                                : "hover:border-primary/15 hover:bg-primary/5 border-transparent",
                            ),
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
                        <span
                          className={cn(
                            "block text-sm font-medium",
                            !item.disabled && isSelected && "text-primary",
                          )}
                        >
                          {item.title}
                        </span>
                        <TypographyMuted
                          className={cn(
                            "text-xs",
                            !item.disabled && isSelected && "text-primary/80",
                          )}
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
        </Section>

        <Section spacing="none">
          <div className="mb-6">
            <TypographyH2 className="text-xl font-semibold">Rich row (avatar + meta)</TypographyH2>
            <TypographyMuted className="mt-1">
              Member-style rows with initials, name, role badge, status, and a trailing action.
            </TypographyMuted>
          </div>
          <div className="bg-card/50 max-w-lg divide-y rounded-xl border">
            <ul>
              {MEMBER_ROWS.map((row) => (
                <li key={row.name} className="flex items-center gap-3 p-4">
                  <Avatar className="size-10">
                    <AvatarFallback className="text-xs font-medium">{row.initials}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium">{row.name}</span>
                      <Badge variant="secondary" className="text-[10px] font-normal">
                        {row.role}
                      </Badge>
                    </div>
                    <TypographyMuted className="text-xs">
                      Status:{" "}
                      <span className={row.status === "Active" ? "text-success-600" : undefined}>
                        {row.status}
                      </span>
                    </TypographyMuted>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="shrink-0" aria-label="Actions">
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
        </Section>

        <Section spacing="none">
          <div className="mb-6">
            <TypographyH2 className="text-xl font-semibold">Overlay menu list</TypographyH2>
            <TypographyMuted className="mt-1">
              Compact action list with groups, a separator, and keyboard shortcuts.
            </TypographyMuted>
          </div>
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
        </Section>

        <Section spacing="none">
          <div className="mb-6">
            <TypographyH2 className="text-xl font-semibold">Searchable command list</TypographyH2>
            <TypographyMuted className="mt-1">
              Filterable list (cmdk) inside a popover—useful for pickers and quick jumps.
            </TypographyMuted>
          </div>
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
        </Section>
      </div>
    </div>
  );
}
