import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type SummaryTileProps = {
  label: string;
  value: number;
  available: boolean;
};

export function SummaryTile({ label, value, available }: SummaryTileProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl tabular-nums">{value}</CardTitle>
      </CardHeader>
      {!available ? (
        <CardContent className="text-muted-foreground text-xs">
          Not available for this account
        </CardContent>
      ) : value === 0 ? (
        <CardContent className="text-muted-foreground pt-0 text-xs">None in scope</CardContent>
      ) : null}
    </Card>
  );
}
