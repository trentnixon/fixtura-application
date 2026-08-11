"use client";

import { format } from "date-fns";
import { CalendarIcon, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import { BUNDLES_RENDERS_LIST_COPY } from "../_consts/renders-list";

import type { DateRange } from "react-day-picker";

type BundlesRenderDateRangeFilterProps = {
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
  onClear: () => void;
};

function formatDateRangeLabel(dateRange: DateRange | undefined): string {
  if (!dateRange?.from) return BUNDLES_RENDERS_LIST_COPY.dateRangePlaceholder;
  if (!dateRange.to) return `${format(dateRange.from, "PPP")} - Select end date`;
  return `${format(dateRange.from, "PP")} - ${format(dateRange.to, "PP")}`;
}

export function BundlesRenderDateRangeFilter({
  dateRange,
  onDateRangeChange,
  onClear,
}: BundlesRenderDateRangeFilterProps) {
  const hasRange = Boolean(dateRange?.from || dateRange?.to);

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className={cn(
                "h-9 justify-start rounded-lg text-left font-normal sm:min-w-72",
                !dateRange?.from && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="mr-2 size-4" aria-hidden />
              {formatDateRangeLabel(dateRange)}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={onDateRangeChange}
              numberOfMonths={2}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-9 shrink-0"
          disabled={!hasRange}
          onClick={onClear}
        >
          <X className="size-4" aria-hidden />
          {BUNDLES_RENDERS_LIST_COPY.dateRangeClearAction}
        </Button>
      </div>
    </div>
  );
}
