import { type ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Surface } from "@/components/ui/container";
import { cn } from "@/lib/utils";

export function AccountDefinitionRow(props: { label: string; value: ReactNode }) {
  return (
    <div className="flex flex-col gap-1 py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
      <dt className="text-muted-foreground shrink-0 text-xs font-medium tracking-wide uppercase">
        {props.label}
      </dt>
      <dd className="text-foreground min-w-0 text-sm font-medium">{props.value}</dd>
    </div>
  );
}

export function accountYesNoBadge(value: boolean | null | undefined) {
  const on = value === true;
  return (
    <Badge variant={on ? "default" : "secondary"} className="font-normal">
      {value === true ? "Yes" : value === false ? "No" : "—"}
    </Badge>
  );
}

export function AccountSectionShell(props: {
  title: string;
  description: string;
  icon: ReactNode;
  headerTone?: "brand" | "slate";
  children: ReactNode;
}) {
  const tone = props.headerTone ?? "brand";
  const headerClass =
    tone === "brand"
      ? "bg-primary-950 border-white/15 text-white"
      : "bg-slate-900 border-slate-800/80 text-white";
  const iconClass = tone === "brand" ? "text-white/90" : "text-slate-400";
  const titleClass = "text-xl leading-none font-semibold text-white";
  const descClass = tone === "brand" ? "text-white/80" : "text-slate-400";

  return (
    <Surface className="overflow-hidden p-0">
      <div className={cn("flex w-full items-start gap-3 border-b px-6 py-5", headerClass)}>
        <span className={cn("mt-0.5 shrink-0", iconClass)}>{props.icon}</span>
        <div>
          <p className={titleClass}>{props.title}</p>
          <p className={cn("mt-2 text-sm leading-relaxed", descClass)}>{props.description}</p>
        </div>
      </div>
      {props.children}
    </Surface>
  );
}
