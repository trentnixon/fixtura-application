import { Archive, CircleOff, FolderKanban, PenSquare, Rows3 } from "lucide-react";

import { Surface } from "@/components/ui/container";

import type { ReactNode } from "react";

type SummaryItem = {
  label: string;
  value: number;
  icon: ReactNode;
};

export function SponsorPoolSummaryCards({
  stats,
}: {
  stats: {
    total: number;
    placed: number;
    unassigned: number;
    inactive: number;
    archived: number;
    drafts: number;
  };
}) {
  const items: SummaryItem[] = [
    {
      label: "Total sponsors",
      value: stats.total,
      icon: <FolderKanban className="size-4" aria-hidden />,
    },
    {
      label: "Placed",
      value: stats.placed,
      icon: <Rows3 className="size-4" aria-hidden />,
    },
    {
      label: "Unassigned",
      value: stats.unassigned,
      icon: <Archive className="size-4" aria-hidden />,
    },
    {
      label: "Inactive",
      value: stats.inactive,
      icon: <CircleOff className="size-4" aria-hidden />,
    },
    {
      label: "Drafts",
      value: stats.drafts,
      icon: <PenSquare className="size-4" aria-hidden />,
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {items.map((item) => (
        <Surface key={item.label} className="flex min-h-20 items-center justify-between gap-4 py-4">
          <div className="flex min-w-0 items-baseline gap-3">
            <span className="text-4xl leading-none font-bold tabular-nums">{item.value}</span>
            <span className="text-muted-foreground truncate text-sm font-semibold tracking-tight uppercase">
              {item.label}
            </span>
          </div>
          <div className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg">
            {item.icon}
          </div>
        </Surface>
      ))}
    </div>
  );
}
