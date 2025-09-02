import * as React from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import type { ReactNode } from "react";

export type ListCardProps = {
  title?: ReactNode;
  description?: ReactNode;
  list?: ReactNode;
  footer?: ReactNode;
};

export function ListCard({
  title,
  description,
  list,
  footer,
  ...props
}: ListCardProps & React.ComponentProps<"div">) {
  return (
    <Card {...props}>
      {(title || description) && (
        <CardHeader>
          {title ? <CardTitle>{title}</CardTitle> : null}
          {description ? <CardDescription>{description}</CardDescription> : null}
        </CardHeader>
      )}
      {list ? <CardContent>{list}</CardContent> : null}
      {footer ? <CardFooter>{footer}</CardFooter> : null}
    </Card>
  );
}
