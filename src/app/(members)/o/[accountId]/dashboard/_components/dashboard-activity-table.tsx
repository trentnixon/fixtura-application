import { TypographyMuted } from "@/components/typography";
import { Surface } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { AccountAnalyticsOverviewSeriesPoint } from "@/types/api/account";

type DashboardActivityTableProps = {
  isPending: boolean;
  series: AccountAnalyticsOverviewSeriesPoint[];
  totalRenders: number;
};

function formatRowDate(date: string): string {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function DashboardActivityTable({
  isPending,
  series,
  totalRenders,
}: DashboardActivityTableProps) {
  if (isPending) {
    return <Skeleton className="h-64 w-full rounded-2xl" />;
  }

  const empty = series.length === 0 || totalRenders === 0;

  if (empty) {
    return (
      <Surface className="p-8">
        <p className="text-foreground text-sm font-medium">Activity by day</p>
        <TypographyMuted className="mt-2 text-sm">
          No daily activity in this range. Metrics will appear once renders and related events
          occur.
        </TypographyMuted>
      </Surface>
    );
  }

  return (
    <Surface className="overflow-hidden p-0">
      <div className="border-border border-b px-6 py-4">
        <p className="text-foreground text-sm font-medium">Activity by day</p>
        <TypographyMuted className="text-xs">
          Read-only — emails are rollup-only; not shown per day.
        </TypographyMuted>
      </div>
      <div className="overflow-x-auto px-2 pb-2">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Renders</TableHead>
              <TableHead className="text-right">Complete</TableHead>
              <TableHead className="text-right">Downloads</TableHead>
              <TableHead className="text-right">Game results</TableHead>
              <TableHead className="text-right">Upcoming</TableHead>
              <TableHead className="text-right">Grades</TableHead>
              <TableHead className="text-right">AI</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {series.map((row) => (
              <TableRow key={row.date}>
                <TableCell className="font-medium whitespace-nowrap">
                  {formatRowDate(row.date)}
                </TableCell>
                <TableCell className="text-right tabular-nums">{row.renders}</TableCell>
                <TableCell className="text-right tabular-nums">{row.completeRenders}</TableCell>
                <TableCell className="text-right tabular-nums">{row.downloads}</TableCell>
                <TableCell className="text-right tabular-nums">{row.gameResults}</TableCell>
                <TableCell className="text-right tabular-nums">{row.upcomingGames}</TableCell>
                <TableCell className="text-right tabular-nums">{row.grades}</TableCell>
                <TableCell className="text-right tabular-nums">{row.aiArticles}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Surface>
  );
}
