import { cn } from "@/lib/utils";

import type { ReactNode } from "react";

export function DemoSurface({
  children,
  className,
  layout = "row",
}: {
  children: ReactNode;
  className?: string;
  layout?: "row" | "column";
}) {
  return (
    <div
      className={cn(
        "bg-card/50 rounded-xl border p-8",
        layout === "column" ? "flex flex-col gap-4" : "flex flex-wrap items-center gap-4",
        className,
      )}
    >
      {children}
    </div>
  );
}
