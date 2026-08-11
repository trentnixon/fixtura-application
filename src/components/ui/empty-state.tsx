import {
  TypographyEmptyStateDescription,
  TypographyEmptyStateTitle,
} from "@/components/typography";

import type { ReactNode } from "react";

export function EmptyState({
  title = "Nothing here yet",
  description = "There is no data to display.",
  action,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="grid gap-3 rounded-xl border p-6 text-center">
      <TypographyEmptyStateTitle as="h3" className="text-lg font-semibold sm:text-xl">
        {title}
      </TypographyEmptyStateTitle>
      <TypographyEmptyStateDescription className="text-sm">
        {description}
      </TypographyEmptyStateDescription>
      {action ? <div className="flex items-center justify-center">{action}</div> : null}
    </div>
  );
}
