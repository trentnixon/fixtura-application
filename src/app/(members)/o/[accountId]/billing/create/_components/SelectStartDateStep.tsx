"use client";

import { format } from "date-fns";
import { ArrowRight, CalendarDays } from "lucide-react";

import { MetricComparisonCard } from "@/components/cards";
import { TypographyMuted } from "@/components/typography";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Surface } from "@/components/ui/container";
import {
  BRANDING_CONTAINER_HEADER_CLASS_NAME,
  BrandingContainerHeaderTitle,
} from "@/features/branding/components/branding-container-header-title";
import { cn } from "@/lib/utils";

import { CREATE_SUBSCRIPTION_PASS_WINDOW_SURFACE_CLASS_NAME } from "../_constants/createSubscriptionPassWindow";
import {
  buildSelectedDateWindowDisplay,
  formatPassWindowHint,
} from "../_utils/createSubscriptionWizardDisplay";

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
  const passWindowHint = formatPassWindowHint(daysInPass);

  return (
    <div className="bg-muted/35 rounded-lg border border-transparent p-5 sm:p-6">
      <div className="space-y-1">
        <h2 className="font-brand text-lg font-semibold">2. Subscription start date</h2>
        <p className="text-muted-foreground text-sm">Choose when this Season Pass should begin.</p>
      </div>

      <MetricComparisonCard
        className="ring-border mt-4 w-full min-w-0 rounded-2xl border-none shadow-xl ring-1"
        layout="card"
        headerClassName={BRANDING_CONTAINER_HEADER_CLASS_NAME}
        titleRowClassName="items-start"
        title={
          <BrandingContainerHeaderTitle
            icon={<CalendarDays className="size-5" aria-hidden />}
            title="Start date & coverage"
            description="Pick the first day of coverage and review the pass window."
          />
        }
        body={
          <div className="space-y-6">
            <div className="space-y-3">
              <p className="text-sm leading-relaxed">
                Use the calendar to pick the first day of coverage. Your pass window appears beside
                the calendar.
              </p>
              <TypographyMuted className="text-xs leading-relaxed">
                Must be today or a future date.
              </TypographyMuted>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-start md:gap-x-8">
              <div className="flex w-full min-w-0 flex-col">
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

              <Surface
                className={cn(
                  CREATE_SUBSCRIPTION_PASS_WINDOW_SURFACE_CLASS_NAME,
                  "flex min-w-0 flex-col justify-center px-5 py-3 shadow-md sm:px-6 sm:py-3.5",
                )}
                role="status"
                aria-live="polite"
                aria-label="Pass coverage window"
              >
                {passWindowHint ? (
                  <p className="text-success text-xs font-medium">{passWindowHint}</p>
                ) : null}
                {windowDisplay ? (
                  <div className={cn("space-y-2", passWindowHint && "mt-2")}>
                    <p className="text-base leading-snug font-semibold sm:text-lg">
                      <span className="text-success">{windowDisplay.startDateLabel}</span>
                      <ArrowRight
                        className="text-success/70 mx-2 inline size-4 align-middle"
                        aria-hidden
                      />
                      <span className="text-foreground">{windowDisplay.endDateLabel}</span>
                    </p>
                    <p className="sr-only">
                      Coverage from {windowDisplay.startDateLabel} through{" "}
                      {windowDisplay.endDateLabel}.
                    </p>
                  </div>
                ) : (
                  <p
                    className={cn(
                      "text-muted-foreground text-sm leading-relaxed",
                      passWindowHint && "mt-2",
                    )}
                  >
                    Pick a date on the calendar to see your coverage window.
                  </p>
                )}
              </Surface>
            </div>
          </div>
        }
        footer={
          <TypographyMuted className="text-center text-xs leading-relaxed">
            Coverage runs from the start date through the last included day in the pass window.
          </TypographyMuted>
        }
        footerClassName="items-center text-center"
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
