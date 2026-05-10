import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

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
  const items = [
    { label: "Total sponsors", value: stats.total },
    { label: "Placed", value: stats.placed },
    { label: "Unassigned", value: stats.unassigned },
    { label: "Inactive", value: stats.inactive },
    { label: "Drafts", value: stats.drafts },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {items.map((item) => (
        <Card key={item.label} className="shadow-sm">
          <CardContent className="flex items-center justify-between px-5 py-4">
            <div className="space-y-1">
              <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                {item.label}
              </p>
              <p className="text-2xl font-semibold">{item.value}</p>
            </div>
            <Badge variant="secondary">{item.value}</Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
