"use client";

import { FileText } from "lucide-react";

import { Surface } from "@/components/ui/container";
import { SectionBlock } from "@/components/ui/section";

import type { SeasonFixtureContentNoteSectionProps } from "../_types";

export function SeasonFixtureContentNoteSection({ model }: SeasonFixtureContentNoteSectionProps) {
  const note = model.contentNote;
  if (!note) {
    return null;
  }

  return (
    <SectionBlock variant="inset" spacing="sm">
      <div className="mb-3 flex items-center gap-2">
        <span className="bg-primary/10 text-primary rounded-md p-2">
          <FileText className="size-4" aria-hidden />
        </span>
        <div>
          <p className="text-sm font-semibold">Content</p>
          <p className="text-muted-foreground text-xs">Prompt and context flags from CMS.</p>
        </div>
      </div>
      <Surface className="bg-background/80 ring-border space-y-2 rounded-lg p-4 text-sm shadow-none ring-1">
        {note.hasBasePrompt ? (
          <p className="text-muted-foreground text-xs">Base prompt configured</p>
        ) : null}
        {note.hasUpcomingFixturePrompt ? (
          <p className="text-muted-foreground text-xs">Upcoming fixture prompt configured</p>
        ) : null}
        {note.summaryLines.map((line) => (
          <p key={line} className="break-words">
            {line}
          </p>
        ))}
      </Surface>
    </SectionBlock>
  );
}
