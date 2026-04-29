"use client";

import { Surface } from "@/components/ui/container";
import { SectionBlock, SectionDivider } from "@/components/ui/section";

import type { SeasonFixtureOutputsSectionProps } from "../_types";

export function SeasonFixtureOutputsSection({ model }: SeasonFixtureOutputsSectionProps) {
  if (!model.hasOutputs) {
    return null;
  }

  return (
    <>
      <SectionDivider variant="labeled" label="Outputs" />
      <SectionBlock variant="inset" spacing="sm">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {model.renderStatus && Object.keys(model.renderStatus).length > 0 ? (
            <Surface className="bg-primary/5 ring-primary/10 flex flex-col gap-2 py-4 shadow-none ring-1">
              <p className="text-sm font-semibold">Render status</p>
              {model.renderStatusLine ? (
                <p className="text-foreground text-sm">{model.renderStatusLine}</p>
              ) : (
                <p className="text-muted-foreground text-xs">No primary status field parsed.</p>
              )}
              {model.renderLastRun ? (
                <p className="text-muted-foreground text-xs">{model.renderLastRun}</p>
              ) : null}
            </Surface>
          ) : null}
          {model.downloadEntries.length > 0 ? (
            <Surface className="bg-primary/5 ring-primary/10 flex flex-col gap-3 py-4 shadow-none ring-1">
              <p className="text-sm font-semibold">Downloads ({model.downloadEntries.length})</p>
              <ul className="space-y-2 text-sm">
                {model.downloadEntries.map((d, i) => (
                  <li key={`${d.label}-${i}`}>
                    {d.href ? (
                      <a
                        href={d.href}
                        className="text-primary font-medium underline-offset-4 hover:underline"
                        target="_blank"
                        rel="noreferrer"
                      >
                        {d.label}
                      </a>
                    ) : (
                      <span>{d.label}</span>
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
