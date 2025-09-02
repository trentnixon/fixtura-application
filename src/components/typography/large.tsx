import type { ReactNode } from "react";

export function TypographyLarge({ children }: { children: ReactNode }) {
  return <p className="text-lg font-medium">{children}</p>;
}
