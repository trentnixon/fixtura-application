"use client";

import { TypographyMuted } from "@/components/typography";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { useTemplateParticlePickerList } from "./_hooks";

function fmt(v: string | number | null | undefined): string {
  if (v === null || v === undefined) return "—";
  return String(v);
}

export function TemplateParticlePickerDetail({ accountId }: { accountId: string }) {
  const { selectedParticle } = useTemplateParticlePickerList(accountId);

  if (!selectedParticle) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Selection detail</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <TypographyMuted className="text-xs leading-relaxed">
          The <span className="font-mono">ui</span> object below matches the app-facing particle
          shape used in scheduler and template flows (same keys as nested{" "}
          <span className="font-mono">particle</span> settings elsewhere).
        </TypographyMuted>
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
          <dt className="text-muted-foreground">id</dt>
          <dd>{selectedParticle.id}</dd>
          <dt className="text-muted-foreground">name (display)</dt>
          <dd>{selectedParticle.name?.trim() ? selectedParticle.name : "—"}</dd>
          <dt className="text-muted-foreground">ui.type</dt>
          <dd className="font-mono">{fmt(selectedParticle.ui?.type)}</dd>
          <dt className="text-muted-foreground">ui.animation</dt>
          <dd className="font-mono">{fmt(selectedParticle.ui?.animation)}</dd>
          <dt className="text-muted-foreground">ui.direction</dt>
          <dd className="font-mono">{fmt(selectedParticle.ui?.direction)}</dd>
          <dt className="text-muted-foreground">ui.particleCount</dt>
          <dd className="font-mono">{fmt(selectedParticle.ui?.particleCount)}</dd>
          <dt className="text-muted-foreground">ui.speed</dt>
          <dd className="font-mono">{fmt(selectedParticle.ui?.speed)}</dd>
        </dl>
        <div className="pt-2">
          <p className="text-muted-foreground mb-1 text-xs">Raw JSON</p>
          <pre className="bg-muted max-h-40 overflow-auto rounded-md p-2 text-xs">
            {JSON.stringify(selectedParticle, null, 2)}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
}
