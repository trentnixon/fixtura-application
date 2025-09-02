import type { ReactNode } from "react";

export function TypographyList({ children }: { children: ReactNode }) {
  return <ul className="list-disc pl-6 text-sm">{children}</ul>;
}
