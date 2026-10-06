"use client";

import { addMonths, differenceInCalendarDays, differenceInMonths, startOfDay } from "date-fns";

import { TypographyCaption } from "@/components/typography";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GridCardVisualSlot } from "@/components/ui/grid-card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

import type { SupportDirectoryMeta, SupportDirectoryRow } from "@/types/api/account";

type StatusTone = "success" | "muted" | "attention" | "danger" | "neutral";

const badgeClassName = "h-5 max-w-full min-w-0 truncate px-1.5 py-0 text-[11px] font-medium";

const toneClassName: Record<Exclude<StatusTone, "danger" | "neutral">, string> = {
  success: "border-transparent bg-success-600/10 text-success-600",
  muted: "border-transparent bg-muted text-muted-foreground",
  attention:
    "border-transparent bg-[var(--warning-100)] text-[var(--warning-800)] dark:bg-[var(--warning-950)] dark:text-[var(--warning-200)]",
};

export function formatStatusLabel(value: string | null | undefined): string {
  if (!value) return "";
  return value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatJoined(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function pluralUnit(count: number, unit: string): string {
  return `${count} ${unit}${count === 1 ? "" : "s"}`;
}

export function formatJoinedAgo(iso: string, referenceDate = new Date()): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  const start = startOfDay(date);
  const today = startOfDay(referenceDate);
  const days = differenceInCalendarDays(today, start);
  if (days < 0) return "";
  if (days === 0) return "Today";
  if (days === 1) return "1 day ago";

  const months = differenceInMonths(today, start);
  if (months < 1) return `${days} days ago`;

  const remainderDays = differenceInCalendarDays(today, addMonths(start, months));
  const monthLabel = pluralUnit(months, "month");
  if (remainderDays <= 0) return `${monthLabel} ago`;
  return `${monthLabel}, ${pluralUnit(remainderDays, "day")} ago`;
}

function JoinedValue({ iso }: { iso: string }) {
  const ago = formatJoinedAgo(iso);

  return (
    <div className="min-w-0">
      <p className="text-sm tabular-nums">{formatJoined(iso)}</p>
      {ago ? <p className="text-muted-foreground text-xs leading-snug">{ago}</p> : null}
    </div>
  );
}

function progressTone(status: string): StatusTone {
  if (status === "failed") return "danger";
  if (status === "completed") return "success";
  if (status === "not_started") return "muted";
  return "neutral";
}

function StatusBadge({ label, tone }: { label: string; tone: StatusTone }) {
  if (tone === "danger") {
    return (
      <Badge variant="destructive" className={badgeClassName} title={label}>
        {label}
      </Badge>
    );
  }

  if (tone === "neutral") {
    return (
      <Badge variant="outline" className={badgeClassName} title={label}>
        {label}
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className={cn(badgeClassName, toneClassName[tone])} title={label}>
      {label}
    </Badge>
  );
}

export function accountDisplayName(name: string | null | undefined): string {
  const trimmed = name?.trim() ?? "";
  return trimmed.length > 0 ? trimmed : "Unnamed account";
}

function initialsFromName(name: string | null | undefined): string {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return (parts[0] ?? "").slice(0, 2).toUpperCase();
  const first = parts[0]?.[0] ?? "";
  const last = parts[parts.length - 1]?.[0] ?? "";
  return `${first}${last}`.toUpperCase();
}

function directoryLogoSrc(row: SupportDirectoryRow): string | undefined {
  const value = row.logoUrl?.trim() || row.ParentLogo?.trim() || "";
  return value || undefined;
}

function AccountIdentity({ row }: { row: SupportDirectoryRow }) {
  const logoSrc = directoryLogoSrc(row);
  const displayName = accountDisplayName(row.name);

  return (
    <div className="flex min-w-0 items-center gap-3">
      <GridCardVisualSlot
        visual="org"
        className="!size-9 shrink-0"
        initials={initialsFromName(displayName)}
        {...(logoSrc ? { imageSrc: logoSrc, imageAlt: displayName } : {})}
      />
      <div className="min-w-0 space-y-0.5">
        <p className="truncate text-sm font-medium" title={displayName}>
          {displayName}
        </p>
        <p className="text-muted-foreground truncate text-xs" title={row.ownerEmail ?? undefined}>
          {row.ownerEmail ?? "No owner email"}
        </p>
        {row.sport ? (
          <p className="text-muted-foreground truncate text-xs" title={row.sport}>
            {row.sport}
          </p>
        ) : null}
      </div>
    </div>
  );
}

type StatusField = {
  key: string;
  heading: string;
  label: string;
  tone: StatusTone;
};

function statusFields(row: SupportDirectoryRow): StatusField[] {
  return [
    {
      key: "active",
      heading: "Active",
      label: row.isActive ? "Active" : "Inactive",
      tone: row.isActive ? "success" : "muted",
    },
    {
      key: "setup",
      heading: "Setup",
      label: row.isSetup ? "Set up" : "Not set up",
      tone: row.isSetup ? "neutral" : "attention",
    },
    {
      key: "onboarding",
      heading: "Onboarding",
      label: formatStatusLabel(row.onboardingStatus),
      tone: progressTone(row.onboardingStatus),
    },
  ];
}

const STATUS_COLUMNS = [
  { key: "active", heading: "Active" },
  { key: "setup", heading: "Setup" },
  { key: "onboarding", heading: "Onboarding" },
] as const;

const columnHeadClass = "h-10 px-2 tracking-normal";
const columnCellClass = "px-2 py-3 align-middle whitespace-normal";

function OpenAccountButton({
  row,
  onOpen,
}: {
  row: SupportDirectoryRow;
  onOpen: (row: SupportDirectoryRow) => void;
}) {
  return (
    <Button
      type="button"
      size="compact"
      variant="brandPrimaryOutline"
      aria-label={`Open ${accountDisplayName(row.name)}`}
      onClick={(event) => {
        event.stopPropagation();
        onOpen(row);
      }}
    >
      Open
    </Button>
  );
}

export function SupportAccountsTable({
  rows,
  meta,
  onOpen,
  onPageChange,
}: {
  rows: SupportDirectoryRow[];
  meta?: SupportDirectoryMeta;
  onOpen: (row: SupportDirectoryRow) => void;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="bg-background overflow-hidden rounded-lg border">
      <div className="divide-border divide-y lg:hidden">
        {rows.map((row) => (
          <div key={row.id} className="flex flex-col gap-3 px-3 py-3">
            <div className="flex items-start justify-between gap-3">
              <AccountIdentity row={row} />
              <OpenAccountButton row={row} onOpen={onOpen} />
            </div>
            <dl className="grid grid-cols-2 gap-x-3 gap-y-2 sm:grid-cols-3">
              <div className="min-w-0 space-y-1">
                <TypographyCaption as="dt">Type</TypographyCaption>
                <dd className="truncate text-sm" title={row.accountType}>
                  {row.accountType}
                </dd>
              </div>
              <div className="min-w-0 space-y-1">
                <TypographyCaption as="dt">Joined</TypographyCaption>
                <dd>
                  <JoinedValue iso={row.createdAt} />
                </dd>
              </div>
              {statusFields(row).map((field) => (
                <div key={field.key} className="min-w-0 space-y-1">
                  <TypographyCaption as="dt">{field.heading}</TypographyCaption>
                  <dd>
                    <StatusBadge label={field.label} tone={field.tone} />
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>

      <div className="hidden lg:block">
        <Table className="table-fixed">
          <colgroup>
            <col className="w-[30%]" />
            <col className="w-[12%]" />
            <col className="w-[14%]" />
            <col className="w-[12%]" />
            <col className="w-[13%]" />
            <col className="w-[12%]" />
            <col className="w-[7%]" />
          </colgroup>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="h-10 px-3">Account</TableHead>
              <TableHead className={columnHeadClass}>Type</TableHead>
              <TableHead className={columnHeadClass}>Joined</TableHead>
              {STATUS_COLUMNS.map((field) => (
                <TableHead key={field.key} className={columnHeadClass}>
                  {field.heading}
                </TableHead>
              ))}
              <TableHead className="h-10 px-2 text-right tracking-normal">
                <span className="sr-only">Action</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id} className="cursor-pointer" onClick={() => onOpen(row)}>
                <TableCell className="max-w-0 px-3 py-3 align-middle whitespace-normal">
                  <AccountIdentity row={row} />
                </TableCell>
                <TableCell className={cn(columnCellClass, "max-w-0")}>
                  <span className="block truncate text-sm" title={row.accountType}>
                    {row.accountType}
                  </span>
                </TableCell>
                <TableCell className={columnCellClass}>
                  <JoinedValue iso={row.createdAt} />
                </TableCell>
                {statusFields(row).map((field) => (
                  <TableCell key={field.key} className={columnCellClass}>
                    <StatusBadge label={field.label} tone={field.tone} />
                  </TableCell>
                ))}
                <TableCell className="px-3 py-3 text-right align-middle whitespace-normal">
                  <OpenAccountButton row={row} onOpen={onOpen} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {meta ? (
        <div className="border-border flex flex-wrap items-center justify-between gap-3 border-t px-3 py-3">
          <TypographyCaption>
            {meta.total} {meta.total === 1 ? "account" : "accounts"} · page {meta.page} of{" "}
            {meta.totalPages}
          </TypographyCaption>
          {meta.totalPages > 1 ? (
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="compact"
                disabled={meta.page <= 1}
                onClick={() => onPageChange(Math.max(1, meta.page - 1))}
              >
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                size="compact"
                disabled={meta.page >= meta.totalPages}
                onClick={() => onPageChange(meta.page + 1)}
              >
                Next
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function SupportAccountsTableSkeleton() {
  return (
    <div className="bg-background overflow-hidden rounded-lg border">
      <div className="divide-border divide-y">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="flex items-start justify-between gap-4 px-3 py-3">
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-48 max-w-full" />
              <Skeleton className="h-3 w-64 max-w-full" />
              <Skeleton className="h-3 w-40 max-w-full" />
            </div>
            <Skeleton className="h-7 w-16 shrink-0 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
