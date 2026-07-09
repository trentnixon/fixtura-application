"use client";

import { Fragment } from "react";

import { TypographyCaption, TypographyH4, TypographyMuted } from "@/components/typography";
import { Badge } from "@/components/ui/badge";
import { SectionDivider } from "@/components/ui/section";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

import type { SeasonFixtureContextMetaRow, SeasonFixtureContextMetaSectionProps } from "../_types";

const DATE_META_LABELS = new Set(["Assembled", "Generated", "Published", "Updated"]);

type ValidationTone = "success" | "warning" | "destructive" | "secondary";

function formatMetaDate(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed);
}

function formatMetaValue(label: string, value: string): string {
  if (DATE_META_LABELS.has(label)) {
    return formatMetaDate(value);
  }

  if (label === "Data quality") {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  return value;
}

function formatValidationPercent(value: number): string {
  return `${value}%`;
}

function validationStatusTone(status: string): ValidationTone {
  const lower = status.toLowerCase();
  if (/\b(pass|good|valid|complete|success|active)\b/.test(lower)) {
    return "success";
  }
  if (/\b(warn|review|partial|pending)\b/.test(lower)) {
    return "warning";
  }
  if (/\b(fail|error|invalid|block|rejected)\b/.test(lower)) {
    return "destructive";
  }
  return "secondary";
}

function validationBadgeClassName(tone: ValidationTone): string {
  return cn(
    "shrink-0 border-transparent text-[10px] font-normal",
    tone === "success" && "bg-success/10 text-success-600",
    tone === "warning" &&
      "bg-[color-mix(in_oklch,var(--warning),transparent_88%)] text-[var(--warning)]",
    tone === "destructive" && "bg-destructive/10 text-destructive",
  );
}

function MetaRowValue({ row }: { row: SeasonFixtureContextMetaRow }) {
  const formattedValue = formatMetaValue(row.label, row.value);
  const clubValues =
    row.label === "Clubs"
      ? row.value
          .split(",")
          .map((club) => club.trim())
          .filter(Boolean)
      : [];

  if (clubValues.length > 1) {
    return (
      <div className="flex flex-wrap justify-end gap-2 sm:max-w-[min(100%,28rem)]">
        {clubValues.map((club) => (
          <Badge key={club} variant="secondary" className="font-normal">
            {club}
          </Badge>
        ))}
      </div>
    );
  }

  if (row.label === "Data quality") {
    return (
      <Badge
        variant="secondary"
        className={cn(
          "font-normal capitalize",
          validationBadgeClassName(validationStatusTone(row.value)),
        )}
      >
        {formattedValue}
      </Badge>
    );
  }

  return (
    <TypographyH4 className="text-sm font-medium wrap-break-word sm:text-right">
      {formattedValue}
    </TypographyH4>
  );
}

export function SeasonFixtureContextMetaSection({ model }: SeasonFixtureContextMetaSectionProps) {
  const validation = model.validationSummary;
  const hasValidationBreakdown = Boolean(validation && validation.breakdown.length > 0);
  const metaRows = model.contextMetaRows.filter(
    (row) => !(hasValidationBreakdown && row.label === "Data quality"),
  );

  if (metaRows.length === 0 && !hasValidationBreakdown) {
    return null;
  }

  const validationStatusLabel = validation?.status
    ? validation.status.charAt(0).toUpperCase() + validation.status.slice(1)
    : null;
  const validationTone = validation?.status ? validationStatusTone(validation.status) : "secondary";

  return (
    <>
      <SectionDivider variant="labeled" label="Context and meta" />
      <div className="bg-muted/30 space-y-3 rounded-lg p-2">
        {hasValidationBreakdown && validation ? (
          <div className="bg-background rounded-md border p-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
              <div className="space-y-1">
                <TypographyCaption className="font-medium tracking-wide uppercase">
                  Data quality
                </TypographyCaption>
                {validation.overallScore != null ? (
                  <p className="text-2xl leading-none font-bold tabular-nums">
                    {formatValidationPercent(validation.overallScore)}
                  </p>
                ) : null}
              </div>
              {validationStatusLabel ? (
                <Badge variant="secondary" className={validationBadgeClassName(validationTone)}>
                  {validationStatusLabel}
                </Badge>
              ) : null}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {validation.breakdown.map((item) => (
                <div key={item.key} className="bg-muted/35 rounded-md px-3 py-3">
                  <p className="text-lg font-semibold tabular-nums">
                    {formatValidationPercent(item.value)}
                  </p>
                  <TypographyMuted className="text-[11px]">{item.label}</TypographyMuted>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {metaRows.length > 0 ? (
          <div className="bg-background rounded-md border">
            {metaRows.map((row, index) => (
              <Fragment key={row.label}>
                {index > 0 ? <Separator /> : null}
                <div className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                  <TypographyMuted className="shrink-0 text-xs font-medium tracking-wide uppercase">
                    {row.label}
                  </TypographyMuted>
                  <MetaRowValue row={row} />
                </div>
              </Fragment>
            ))}
          </div>
        ) : null}
      </div>
    </>
  );
}
