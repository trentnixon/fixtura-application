import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import type { SeasonEmptyPanelProps } from "./_types";

export function SeasonEmptyPanel({ title, description, action, footer }: SeasonEmptyPanelProps) {
  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription className="text-pretty">{description}</CardDescription>
      </CardHeader>
      {action ? (
        <CardContent className="pt-0">
          <Link
            href={action.href}
            className="text-primary text-sm font-medium underline-offset-4 hover:underline"
          >
            {action.label}
          </Link>
        </CardContent>
      ) : null}
      {footer ? <CardContent className="pt-0">{footer}</CardContent> : null}
    </Card>
  );
}
