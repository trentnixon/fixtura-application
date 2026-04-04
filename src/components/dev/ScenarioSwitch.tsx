"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";

type ScenarioSwitchProps = {
  stateOptions?: readonly string[];
  modeOptions?: readonly string[];
};

export function ScenarioSwitch({ stateOptions = [], modeOptions = [] }: ScenarioSwitchProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function buildHref(patch: Record<string, string | null>) {
    const next = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(patch)) {
      if (value === null || value === "") next.delete(key);
      else next.set(key, value);
    }
    const q = next.toString();
    return q ? `${pathname}?${q}` : pathname;
  }

  const rawState = searchParams.get("state");
  const rawMode = searchParams.get("mode");
  const currentState = rawState ?? "default";
  const currentMode = rawMode ?? "default";

  return (
    <div className="flex flex-wrap gap-8 text-sm">
      {stateOptions?.length ? (
        <div className="space-y-2">
          <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
            state
          </p>
          <div className="flex flex-wrap gap-2">
            {stateOptions.map((s) => {
              const active = s === "default" ? !rawState : currentState === s;
              return (
                <Link
                  key={s}
                  href={buildHref({ state: s === "default" ? null : s })}
                  className={cn(
                    "rounded-md px-3 py-1.5 font-medium transition-colors",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                  )}
                >
                  {s}
                </Link>
              );
            })}
          </div>
        </div>
      ) : null}
      {modeOptions?.length ? (
        <div className="space-y-2">
          <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
            mode
          </p>
          <div className="flex flex-wrap gap-2">
            {modeOptions.map((m) => {
              const active = m === "default" ? !rawMode : currentMode === m;
              return (
                <Link
                  key={m}
                  href={buildHref({ mode: m === "default" ? null : m })}
                  className={cn(
                    "rounded-md px-3 py-1.5 font-medium transition-colors",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                  )}
                >
                  {m}
                </Link>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
