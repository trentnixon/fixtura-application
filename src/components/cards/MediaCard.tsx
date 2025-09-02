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
export type MediaCardProps = {
  title?: ReactNode;
  description?: ReactNode;
  media?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
};

export function MediaCard({
  title,
  description,
  media,
  children,
  footer,
  ...props
}: MediaCardProps & React.ComponentProps<"div">) {
  return (
    <Card {...props}>
      {(title || description) && (
        <CardHeader>
          {title ? <CardTitle>{title}</CardTitle> : null}
          {description ? <CardDescription>{description}</CardDescription> : null}
        </CardHeader>
      )}
      <CardContent className="grid gap-3">
        {media ? <div className="overflow-hidden rounded-md border">{media}</div> : null}
        {children}
      </CardContent>
      {footer ? <CardFooter>{footer}</CardFooter> : null}
    </Card>
  );
}
