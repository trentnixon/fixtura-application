import { TypographyMuted } from "@/components/typography";
import { cn } from "@/lib/utils";

import type { ReactNode } from "react";

export function SettingsSelectRow(props: {
  title: string;
  description: string;
  disabled: boolean;
  id: string;
  children: ReactNode;
}) {
  const { title, description, disabled, id, children } = props;

  return (
    <li className="border-border flex items-center justify-between gap-4 border-b px-6 py-4 last:border-b-0">
      <div className="min-w-0 space-y-1">
        <div className="text-sm font-medium">{title}</div>
        <TypographyMuted className="text-xs">{description}</TypographyMuted>
      </div>
      <div
        className={cn("flex shrink-0 items-center gap-3", disabled ? "opacity-70" : "opacity-100")}
      >
        <div className="min-w-40">{children}</div>
      </div>
      <span id={id} className="sr-only" />
    </li>
  );
}
