import type { ReactNode } from "react";

export function TypographyLead({ children }: { children: ReactNode }) {
  return <p className="text-muted-foreground text-xl">{children}</p>;
}
