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
import { cn } from "@/lib/utils";

import type { ReactNode } from "react";

export type MediaCardProps = {
  title?: ReactNode;
  description?: ReactNode;
  media?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  /** Merged into `CardHeader` (e.g. `px-4` to tighten horizontal padding). */
  cardHeaderClassName?: string;
  /** Merged into `CardContent` after layout utilities (e.g. `px-4`). */
  cardContentClassName?: string;
  /** Merged into `CardFooter` (e.g. `px-4`). */
  cardFooterClassName?: string;
  /** Merged into the bordered wrapper around `media` (e.g. `-mx-4` when content uses `px-4`). */
  mediaWrapperClassName?: string;
};

export function MediaCard({
  title,
  description,
  media,
  children,
  footer,
  cardHeaderClassName,
  cardContentClassName,
  cardFooterClassName,
  mediaWrapperClassName,
  ...props
}: MediaCardProps & React.ComponentProps<"div">) {
  return (
    <Card {...props}>
      {(title || description) && (
        <CardHeader className={cardHeaderClassName}>
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
      <CardContent className={cn("flex min-h-0 flex-1 flex-col gap-3", cardContentClassName)}>
        {media ? (
          <div className={cn("shrink-0 overflow-hidden rounded-xl border", mediaWrapperClassName)}>
            {media}
          </div>
        ) : null}
        {children ? <div className="flex min-h-0 flex-1 flex-col">{children}</div> : null}
      </CardContent>
      {footer ? (
        <CardFooter className={cn("mt-auto w-full", cardFooterClassName)}>{footer}</CardFooter>
      ) : null}
    </Card>
  );
}
