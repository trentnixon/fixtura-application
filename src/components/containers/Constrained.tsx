import * as React from "react";

import type { ReactNode } from "react";

type ConstrainedSize = "2xl" | "3xl" | "6xl";

export function Constrained({
  children,
  size = "3xl",
  ...props
}: {
  children: ReactNode;
  size?: ConstrainedSize;
} & React.ComponentProps<"div">) {
  const sizeClass = size === "2xl" ? "max-w-2xl" : size === "6xl" ? "max-w-6xl" : "max-w-3xl";
  return (
    <div className="rounded-lg border p-4" {...props}>
      <div className={`mx-auto ${sizeClass} rounded border p-3 text-sm`}>{children}</div>
    </div>
  );
}
