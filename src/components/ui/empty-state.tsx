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
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
      {action ? <div className="flex items-center justify-center">{action}</div> : null}
    </div>
  );
}
