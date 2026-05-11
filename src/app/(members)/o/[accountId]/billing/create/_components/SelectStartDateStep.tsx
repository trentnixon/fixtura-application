"use client";

import { format } from "date-fns";
import { CalendarDays, ListChecks } from "lucide-react";

import { MetricComparisonCard } from "@/components/cards";
import { TypographyH3, TypographyMuted } from "@/components/typography";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardAction, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { buildSelectedDateWindowDisplay } from "../_utils/createSubscriptionWizardDisplay";

type SelectStartDateStepProps = {
  selectedDate: Date | undefined;
  daysInPass: number | undefined;
  today: Date;
  endMonth: Date;
  startDate: string;
  dateOk: boolean;
  onStartDateChange: (startDate: string) => void;
  onBack: () => void;
  onContinue: () => void;
};

export function SelectStartDateStep({
  selectedDate,
  daysInPass,
  today,
  endMonth,
  startDate,
  dateOk,
  onStartDateChange,
  onBack,
  onContinue,
}: SelectStartDateStepProps) {
  const windowDisplay = buildSelectedDateWindowDisplay({ selectedDate, daysInPass });
  const tierDays = daysInPass != null ? Math.max(1, Math.floor(daysInPass)) : null;
  const tierDaysLabel =
    tierDays != null && tierDays > 0
      ? `${tierDays} ${tierDays === 1 ? "day" : "days"}`
      : "Set by your selected pass";

  return (
    <div className="bg-muted/35 rounded-lg border border-transparent p-5 sm:p-6">
      <div className="space-y-1">
        <h2 className="font-brand text-lg font-semibold">2. Subscription start date</h2>
        <p className="text-muted-foreground text-sm">Choose when this Season Pass should begin.</p>
      </div>

      <MetricComparisonCard
        className="mt-4 w-full shadow-sm"
        layout="card"
        title="Start date & coverage"
        icon={<CalendarDays className="text-primary size-5" aria-hidden />}
        body={
          <div className="space-y-6">
            <div className="space-y-3">
              <p className="text-sm leading-relaxed">
                Use the calendar to pick the first day of coverage. The Pass window card shows your
                tier length, start date, and the last day included in the pass.
              </p>
              <TypographyMuted className="text-xs leading-relaxed">
                Must be today or a future date.
              </TypographyMuted>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] md:items-stretch md:gap-x-8 md:gap-y-4">
              <div className="flex w-full min-w-0 flex-col justify-center md:justify-start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => onStartDateChange(date ? format(date, "yyyy-MM-dd") : "")}
                  captionLayout="dropdown"
                  startMonth={today}
                  endMonth={endMonth}
                  disabled={{ before: today }}
                  className="max-w-full rounded-md border shadow"
                />
              </div>

              <div className="flex min-h-72 min-w-0 flex-col justify-center md:justify-start">
                <Card className="min-h-72 w-full gap-1 shadow-md ring-1">
                  <CardHeader className="pb-4">
                    <CardAction>
                      <ListChecks
                        className={cn("size-5", dateOk ? "text-success" : "text-primary")}
                        aria-hidden
                      />
                    </CardAction>
                    <TypographyH3 className="text-lg leading-none font-semibold">
                      Pass window
                    </TypographyH3>
                  </CardHeader>
                  <CardContent className="border-border border-t pt-4 pb-6">
                    <dl className="grid gap-4 text-left">
                      <div className="grid gap-0.5">
                        <dt className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
                          Days in tier
                        </dt>
                        <dd className="text-sm font-medium">
                          {windowDisplay?.daysInTierLabel ?? tierDaysLabel}
                        </dd>
                      </div>
                      <div className="grid gap-0.5">
                        <dt className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
                          Start date
                        </dt>
                        <dd
                          className={cn(
                            "text-sm font-medium",
                            windowDisplay ? "text-primary" : "text-muted-foreground font-normal",
                          )}
                        >
                          {windowDisplay?.startDateLabel ?? "Pick a date on the calendar."}
                        </dd>
                      </div>
                      <div className="grid gap-0.5">
                        <dt className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
                          End date
                        </dt>
                        <dd
                          className={cn(
                            "text-sm font-medium",
                            !windowDisplay && "text-muted-foreground font-normal",
                          )}
                        >
                          {windowDisplay?.endDateLabel ??
                            "Choose a start date to see the end date."}
                        </dd>
                      </div>
                    </dl>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        }
        footer={
          <TypographyMuted className="text-xs leading-relaxed">
            Coverage runs from the start date through the last included day in the pass window.
          </TypographyMuted>
        }
      />

      <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t pt-6">
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button type="button" disabled={!dateOk} onClick={onContinue}>
            Continue
          </Button>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => onStartDateChange("")}
          disabled={!startDate}
        >
          Reset
        </Button>
      </div>
    </div>
  );
}
