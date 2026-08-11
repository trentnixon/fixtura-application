"use client";

import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Surface } from "@/components/ui/container";
import { SectionBlock, SectionDivider } from "@/components/ui/section";

import type { SeasonFixtureOutputsSectionProps } from "../_types";

export function SeasonFixtureOutputsSection({ model }: SeasonFixtureOutputsSectionProps) {
  if (model.downloadEntries.length === 0) {
    return null;
  }

  return (
    <>
      <SectionDivider variant="labeled" label="Downloads" />
      <SectionBlock variant="inset" spacing="sm">
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
      </SectionBlock>
    </>
  );
}
