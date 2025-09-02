import * as React from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import type { ReactNode } from "react";

export type ActionHeaderCardProps = {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
};

export function ActionHeaderCard({
  title,
  description,
  actions,
  children,
  ...props
}: ActionHeaderCardProps & React.ComponentProps<"div">) {
  return (
    <Card {...props}>
      {(title || description || actions) && (
        <CardHeader className="flex-row items-start justify-between">
          <div>
            {title ? <CardTitle>{title}</CardTitle> : null}
            {description ? <CardDescription>{description}</CardDescription> : null}
          </div>
          {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
        </CardHeader>
      )}
      {children ? <CardContent>{children}</CardContent> : null}
    </Card>
  );
}
