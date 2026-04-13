"use client";

import { format, subYears, addYears, startOfDay } from "date-fns";
import { useState } from "react";

import { TypographyH1, TypographyMuted } from "@/components/typography";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";

import type { DateRange } from "react-day-picker";

export default function CalendarInteractionPage() {
  const [seasonDate, setSeasonDate] = useState<Date | undefined>();
  const [filterRange, setFilterRange] = useState<DateRange | undefined>();

  const today = startOfDay(new Date());
  const oneYearAgo = subYears(today, 1);
  const fiveYearsFromNow = addYears(today, 5);

  const handleConfirmSeason = () => {
    if (seasonDate) {
      window.alert(`Season start confirmed for: ${format(seasonDate, "PPP")}`);
    } else {
      window.alert(`Please select a date first.`);
    }
  };

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <TypographyMuted className="text-xs font-medium tracking-wide uppercase">
          Date Selection
        </TypographyMuted>
        <TypographyH1 className="text-3xl font-semibold">Calendar flows</TypographyH1>
        <TypographyMuted className="max-w-2xl leading-relaxed">
          Interactive date selection flows for single dates (e.g. payment season start) and date
          ranges (e.g. data filtering).
        </TypographyMuted>
      </header>

      <div className="flex flex-col items-start gap-6 xl:flex-row">
        <Card className="w-full flex-1 shrink-0 xl:max-w-md">
          <CardHeader>
            <CardTitle>Payment Season Start</CardTitle>
            <CardDescription>Select a single date to begin the payment season.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center space-y-4">
            <Calendar
              mode="single"
              selected={seasonDate}
              onSelect={setSeasonDate}
              captionLayout="dropdown"
              startMonth={today}
              endMonth={fiveYearsFromNow}
              disabled={{ before: today }}
              className="rounded-md border shadow"
            />
            <div className="min-h-[20px] w-full text-center text-sm font-medium">
              {seasonDate ? (
                <p>
                  Selected date: <span className="text-primary">{format(seasonDate, "PPP")}</span>
                </p>
              ) : (
                <p className="text-muted-foreground">No date selected</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-6 pb-6">
            <Button
              variant="outline"
              onClick={() => setSeasonDate(undefined)}
              disabled={!seasonDate}
            >
              Reset
            </Button>
            <Button onClick={handleConfirmSeason} disabled={!seasonDate}>
              Confirm Season Start
            </Button>
          </CardFooter>
        </Card>

        <Card className="w-full flex-1 xl:max-w-fit">
          <CardHeader>
            <CardTitle>Data Filter Range</CardTitle>
            <CardDescription>Select a start and end date to filter data.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center space-y-4 pb-0">
            <Calendar
              mode="range"
              selected={filterRange}
              onSelect={setFilterRange}
              captionLayout="dropdown"
              startMonth={oneYearAgo}
              endMonth={fiveYearsFromNow}
              disabled={{ before: oneYearAgo }}
              numberOfMonths={2}
              className="rounded-md border shadow"
            />
            <div className="min-h-[20px] w-full text-center text-sm font-medium">
              {filterRange?.from ? (
                filterRange.to ? (
                  <p>
                    Filter range:{" "}
                    <span className="text-primary">{format(filterRange.from, "PPP")}</span> -{" "}
                    <span className="text-primary">{format(filterRange.to, "PPP")}</span>
                  </p>
                ) : (
                  <p>
                    Filter range:{" "}
                    <span className="text-primary">{format(filterRange.from, "PPP")}</span> -{" "}
                    <span className="text-muted-foreground">Select end date</span>
                  </p>
                )
              ) : (
                <p className="text-muted-foreground">No range selected</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="mt-4 flex justify-end border-t pt-6 pb-6">
            <Button
              variant="outline"
              onClick={() => setFilterRange(undefined)}
              disabled={!filterRange?.from && !filterRange?.to}
            >
              Reset Filter
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
