import type { ReactNode } from "react";

export function TypographySmall({ children }: { children: ReactNode }) {
  return <p className="text-sm">{children}</p>;
}
