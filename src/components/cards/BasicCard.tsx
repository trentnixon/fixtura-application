import * as React from "react";

import { TypographyCardDescription, TypographyCardTitle } from "@/components/typography";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import type { ReactNode } from "react";

export type BasicCardProps = {
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
};

export function BasicCard({
  title,
  description,
  children,
  footer,
  ...props
}: BasicCardProps & React.ComponentProps<"div">) {
  return (
    <Card {...props}>
      {(title || description) && (
        <CardHeader>
          {title ? (
            <CardTitle>
              <TypographyCardTitle as="span">{title}</TypographyCardTitle>
            </CardTitle>
          ) : null}
          {description ? (
            <CardDescription>
              <TypographyCardDescription as="span">{description}</TypographyCardDescription>
            </CardDescription>
          ) : null}
        </CardHeader>
      )}
      {children ? <CardContent>{children}</CardContent> : null}
      {footer ? <CardFooter>{footer}</CardFooter> : null}
    </Card>
  );
}
