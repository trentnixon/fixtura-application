import { Suspense } from "react";

import { ScenarioSwitch } from "@/components/dev/ScenarioSwitch";

import type { ReactNode } from "react";

type RouteLabPageProps = {
  title: string;
  productionRoute: string;
  description: string;
  stateOptions?: readonly string[];
  modeOptions?: readonly string[];
  scenarioSummary?: string;
  children: ReactNode;
};

export function RouteLabPage({
  title,
  productionRoute,
  description,
  stateOptions,
  modeOptions,
  scenarioSummary,
  children,
}: RouteLabPageProps) {
  return (
    <div className="space-y-6">
      <header className="border-border space-y-2 border-b pb-6">
        <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
          Route lab
        </p>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-muted-foreground text-sm">{description}</p>
        <p className="text-muted-foreground font-mono text-xs">
          Production route: <span className="text-foreground">{productionRoute}</span>
        </p>
        {scenarioSummary ? (
          <p className="text-muted-foreground border-border mt-3 border-t pt-3 text-xs">
            {scenarioSummary}
          </p>
        ) : null}
      </header>
      {stateOptions?.length || modeOptions?.length ? (
        <Suspense fallback={<p className="text-muted-foreground text-sm">Loading scenarios…</p>}>
          <ScenarioSwitch stateOptions={stateOptions ?? []} modeOptions={modeOptions ?? []} />
        </Suspense>
      ) : null}
      <div>{children}</div>
    </div>
  );
}
