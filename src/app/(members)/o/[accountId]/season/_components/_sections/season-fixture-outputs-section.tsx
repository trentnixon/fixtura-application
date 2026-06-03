"use client";

import { Download, RadioTower } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Surface } from "@/components/ui/container";
import { SectionBlock, SectionDivider } from "@/components/ui/section";

import type { SeasonFixtureOutputsSectionProps } from "../_types";

function formatProcessedAt(value: string | undefined): string {
  if (!value?.trim()) {
    return "—";
  }
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

export function SeasonFixtureOutputsSection({ model }: SeasonFixtureOutputsSectionProps) {
  if (!model.hasOutputs) {
    return null;
  }

  const hasRenders = model.renderEntries.length > 0;

  return (
    <>
      <SectionDivider variant="labeled" label="Render status" />
      <SectionBlock variant="inset" spacing="sm">
        <div className="grid grid-cols-1 gap-4">
          {hasRenders ? (
            <Surface className="bg-background/80 ring-border flex flex-col gap-3 rounded-lg p-4 shadow-none ring-1">
              <div className="flex items-center gap-2">
                <span className="bg-primary/10 text-primary rounded-md p-2">
                  <RadioTower className="size-4" aria-hidden />
                </span>
                <p className="text-sm font-semibold">Renders ({model.renderEntries.length})</p>
              </div>
              <ul className="divide-border divide-y text-sm">
                {model.renderEntries.map((entry) => (
                  <li
                    key={`${entry.kind}-${entry.id}`}
                    className="flex flex-wrap items-center justify-between gap-2 py-2 first:pt-0 last:pb-0"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs">#{entry.id}</span>
                      <Badge variant="outline" className="text-xs capitalize">
                        {entry.kind}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {entry.status}
                      </Badge>
                    </div>
                    <span className="text-muted-foreground text-xs">
                      {formatProcessedAt(entry.processedAt)}
                    </span>
                  </li>
                ))}
              </ul>
            </Surface>
          ) : model.renderStatusLine ? (
            <Surface className="bg-background/80 ring-border flex min-h-28 flex-col gap-3 rounded-lg p-4 shadow-none ring-1">
              <div className="flex items-center gap-2">
                <span className="bg-primary/10 text-primary rounded-md p-2">
                  <RadioTower className="size-4" aria-hidden />
                </span>
                <p className="text-sm font-semibold">Render status</p>
              </div>
              <p className="text-foreground text-sm">{model.renderStatusLine}</p>
              {model.renderLastRun ? (
                <p className="text-muted-foreground text-xs">{model.renderLastRun}</p>
              ) : null}
            </Surface>
          ) : null}
          {model.downloadEntries.length > 0 ? (
            <Surface className="bg-background/80 ring-border flex min-h-28 flex-col gap-3 rounded-lg p-4 shadow-none ring-1">
              <div className="flex items-center gap-2">
                <span className="bg-primary/10 text-primary rounded-md p-2">
                  <Download className="size-4" aria-hidden />
                </span>
                <p className="text-sm font-semibold">Downloads ({model.downloadEntries.length})</p>
              </div>
              <ul className="flex flex-wrap gap-2 text-sm">
                {model.downloadEntries.map((d, i) => (
                  <li key={`${d.label}-${i}`}>
                    {d.href ? (
                      <Button variant="outline" size="sm" asChild>
                        <a href={d.href} target="_blank" rel="noreferrer">
                          {d.label}
                        </a>
                      </Button>
                    ) : (
                      <span className="bg-muted text-muted-foreground inline-flex min-h-9 items-center rounded-md px-3 text-xs">
                        {d.label}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </Surface>
          ) : null}
        </div>
      </SectionBlock>
    </>
  );
}
