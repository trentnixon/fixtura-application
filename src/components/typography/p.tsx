import type { ReactNode } from "react";

export function TypographyP({ children }: { children: ReactNode }) {
  return <p className="leading-7 [&:not(:first-child)]:mt-2">{children}</p>;
}
