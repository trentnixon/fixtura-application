"use client";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { useTemplateParticlePickerList } from "./_hooks";
import { templateParticleLabel } from "./_utils";

function fmt(v: string | number | null | undefined): string {
  if (v === null || v === undefined) return "—";
  return String(v);
}

export function TemplateParticleCardPicker({ accountId }: { accountId: string }) {
  const { particles, selectValue, setSelectedId } = useTemplateParticlePickerList(accountId);

  return (
    <div className="space-y-3">
      <p className="text-muted-foreground text-xs">
        Click a card or focus it and press Enter or Space.
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {particles.map((particle) => {
          const isSelected = String(particle.id) === selectValue;
          const title = templateParticleLabel(particle);
          const ui = particle.ui;
          const summary = [
            `type ${fmt(ui?.type)}`,
            `anim ${fmt(ui?.animation)}`,
            `dir ${fmt(ui?.direction)}`,
            `count ${fmt(ui?.particleCount)}`,
            `speed ${fmt(ui?.speed)}`,
          ].join(" · ");
          return (
            <Card
              key={particle.id}
              role="button"
              tabIndex={0}
              aria-label={title}
              aria-pressed={isSelected}
              data-state={isSelected ? "selected" : undefined}
              className={cn(
                "cursor-pointer py-4 shadow-md ring-1 transition-shadow outline-none",
                "hover:bg-muted/40 focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2",
                isSelected && "ring-primary ring-2",
              )}
              onClick={() => setSelectedId(String(particle.id))}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelectedId(String(particle.id));
                }
              }}
            >
              <CardHeader className="gap-2 px-4 py-0">
                <CardTitle className="text-base leading-snug">{title}</CardTitle>
                <CardDescription className="font-mono text-xs">id {particle.id}</CardDescription>
                <CardDescription className="text-xs leading-snug">{summary}</CardDescription>
              </CardHeader>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
