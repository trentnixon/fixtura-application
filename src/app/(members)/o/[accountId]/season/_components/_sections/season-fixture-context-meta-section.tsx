"use client";

import { SectionBlock } from "@/components/ui/section";

import type { SeasonFixtureContextMetaSectionProps } from "../_types";

export function SeasonFixtureContextMetaSection({ model }: SeasonFixtureContextMetaSectionProps) {
  if (model.contextMetaRows.length === 0) {
    return null;
  }

  return (
    <SectionBlock variant="inset" spacing="sm">
      <p className="text-muted-foreground mb-3 text-xs font-semibold tracking-wide uppercase">
        Context / meta
      </p>
      <dl className="grid gap-2 text-sm sm:grid-cols-2">
        {model.contextMetaRows.map((row) => (
          <div key={row.label}>
            <dt className="text-muted-foreground text-xs">{row.label}</dt>
            <dd className="font-mono text-xs break-all">{row.value}</dd>
          </div>
        ))}
      </dl>
    </SectionBlock>
  );
}
