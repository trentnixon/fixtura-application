"use client";

import { Database } from "lucide-react";

import { Surface } from "@/components/ui/container";
import { SectionBlock } from "@/components/ui/section";

import type { SeasonFixtureContextMetaSectionProps } from "../_types";

const DATE_META_LABELS = new Set(["Assembled", "Generated", "Published", "Updated"]);

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

export function SeasonFixtureContextMetaSection({ model }: SeasonFixtureContextMetaSectionProps) {
  const validation = model.validationSummary;
  const hasValidationBreakdown = Boolean(validation && validation.breakdown.length > 0);
  if (model.contextMetaRows.length === 0 && !hasValidationBreakdown) {
    return null;
  }

  return (
    <SectionBlock variant="inset" spacing="sm">
      <div className="mb-3 flex items-center gap-2">
        <span className="bg-primary/10 text-primary rounded-md p-2">
          <Database className="size-4" aria-hidden />
        </span>
        <div>
          <p className="text-sm font-semibold">Context and meta</p>
          <p className="text-muted-foreground text-xs">Source, publication, and data quality.</p>
        </div>
      </div>
      {hasValidationBreakdown && validation ? (
        <Surface className="bg-background/80 ring-border mb-4 rounded-lg p-4 shadow-none ring-1">
          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            Validation breakdown
          </p>
          <p className="mt-1 text-sm font-semibold">
            {validation.overallScore != null ? `${validation.overallScore} — ` : ""}
            {validation.status
              ? validation.status.charAt(0).toUpperCase() + validation.status.slice(1)
              : ""}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {validation.breakdown.map((item) => (
              <span
                key={item.key}
                className="bg-muted text-foreground rounded-md px-2.5 py-1 text-xs font-medium"
              >
                {item.label}: {item.value}
              </span>
            ))}
          </div>
        </Surface>
      ) : null}
      <dl className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-1">
        {model.contextMetaRows.map((row) => {
          const formattedValue = formatMetaValue(row.label, row.value);
          const clubValues =
            row.label === "Clubs" ? row.value.split(",").map((club) => club.trim()) : [];

          return (
            <Surface
              key={row.label}
              className="bg-background/80 ring-border rounded-lg p-4 shadow-none ring-1"
            >
              <dt className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                {row.label}
              </dt>
              {clubValues.length > 1 ? (
                <dd className="mt-2 flex flex-wrap gap-2">
                  {clubValues.map((club) => (
                    <span
                      key={club}
                      className="bg-muted text-foreground rounded-md px-2.5 py-1 text-xs font-medium"
                    >
                      {club}
                    </span>
                  ))}
                </dd>
              ) : (
                <dd className="mt-1 text-sm font-medium break-words">{formattedValue}</dd>
              )}
            </Surface>
          );
        })}
      </dl>
    </SectionBlock>
  );
}
