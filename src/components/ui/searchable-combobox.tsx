"use client";

import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type SearchableComboboxOption = { value: string; label: string };

export type SearchableComboboxProps = {
  options: SearchableComboboxOption[];
  value: string | null;
  onChange: (value: string) => void;
  placeholder: string;
  emptyText?: string;
  disabled?: boolean;
  /** Shows spinner on trigger; popover is not opened while loading. */
  loading?: boolean;
  /** Visible text next to the spinner when `loading` is true. */
  loadingMessage?: string;
  id?: string;
};

export function SearchableCombobox({
  options,
  value,
  onChange,
  placeholder,
  emptyText = "No results.",
  disabled,
  loading,
  loadingMessage = "Fetching…",
  id,
}: SearchableComboboxProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  if (loading) {
    return (
      <Button
        id={id}
        type="button"
        variant="outline"
        disabled
        aria-busy="true"
        className="h-11 w-full justify-between rounded-xl font-normal"
      >
        <span className="flex min-w-0 items-center gap-2">
          <Loader2 className="text-muted-foreground size-4 shrink-0 animate-spin" aria-hidden />
          <span className="truncate">{loadingMessage}</span>
        </span>
        <ChevronsUpDown className="size-4 shrink-0 opacity-50" aria-hidden />
      </Button>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "h-11 w-full justify-between rounded-xl font-normal",
            !selected && "text-muted-foreground",
          )}
        >
          <span className="truncate">{selected ? selected.label : placeholder}</span>
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" aria-hidden />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
        <Command>
          <CommandInput placeholder="Search…" />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((opt) => (
                <CommandItem
                  key={opt.value}
                  value={opt.label}
                  onSelect={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn("mr-2 size-4", value === opt.value ? "opacity-100" : "opacity-0")}
                    aria-hidden
                  />
                  {opt.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export type DependentFieldTriggerProps = {
  id?: string;
  message: string;
};

/** Disabled placeholder until a prerequisite field is set (e.g. association before club). */
export function DependentFieldTrigger({ id, message }: DependentFieldTriggerProps) {
  return (
    <Button
      id={id}
      type="button"
      variant="outline"
      disabled
      className="text-muted-foreground h-11 w-full cursor-not-allowed justify-between rounded-xl font-normal"
    >
      <span className="truncate">{message}</span>
      <ChevronsUpDown className="size-4 shrink-0 opacity-50" aria-hidden />
    </Button>
  );
}

/** Alias for {@link DependentFieldTrigger} (kitchen-sink naming). */
export const DependentSecondTrigger = DependentFieldTrigger;
