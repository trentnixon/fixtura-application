import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";

import {
  TypographyBodySmall,
  TypographyMetricLabel,
  TypographyMetricValue,
} from "@/components/typography";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const metricValueClass =
  "!text-2xl !leading-none sm:!text-2xl md:!text-2xl @[250px]/card:!text-3xl";

export function SectionCards() {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>
            <TypographyMetricLabel as="span">Total Revenue</TypographyMetricLabel>
          </CardDescription>
          <CardTitle>
            <TypographyMetricValue as="span" className={metricValueClass}>
              $1,250.00
            </TypographyMetricValue>
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +12.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5">
          <TypographyBodySmall as="div" className="line-clamp-1 flex gap-2 font-medium">
            Trending up this month <IconTrendingUp className="size-4" />
          </TypographyBodySmall>
          <TypographyBodySmall as="div" tone="muted">
            Visitors for the last 6 months
          </TypographyBodySmall>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>
            <TypographyMetricLabel as="span">New Customers</TypographyMetricLabel>
          </CardDescription>
          <CardTitle>
            <TypographyMetricValue as="span" className={metricValueClass}>
              1,234
            </TypographyMetricValue>
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingDown />
              -20%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5">
          <TypographyBodySmall as="div" className="line-clamp-1 flex gap-2 font-medium">
            Down 20% this period <IconTrendingDown className="size-4" />
          </TypographyBodySmall>
          <TypographyBodySmall as="div" tone="muted">
            Acquisition needs attention
          </TypographyBodySmall>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>
            <TypographyMetricLabel as="span">Active Accounts</TypographyMetricLabel>
          </CardDescription>
          <CardTitle>
            <TypographyMetricValue as="span" className={metricValueClass}>
              45,678
            </TypographyMetricValue>
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +12.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5">
          <TypographyBodySmall as="div" className="line-clamp-1 flex gap-2 font-medium">
            Strong user retention <IconTrendingUp className="size-4" />
          </TypographyBodySmall>
          <TypographyBodySmall as="div" tone="muted">
            Engagement exceed targets
          </TypographyBodySmall>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>
            <TypographyMetricLabel as="span">Growth Rate</TypographyMetricLabel>
          </CardDescription>
          <CardTitle>
            <TypographyMetricValue as="span" className={metricValueClass}>
              4.5%
            </TypographyMetricValue>
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +4.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5">
          <TypographyBodySmall as="div" className="line-clamp-1 flex gap-2 font-medium">
            Steady performance increase <IconTrendingUp className="size-4" />
          </TypographyBodySmall>
          <TypographyBodySmall as="div" tone="muted">
            Meets growth projections
          </TypographyBodySmall>
        </CardFooter>
      </Card>
    </div>
  );
}
