"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

export function CommandPanel() {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");

  React.useEffect(() => {
    const down = (e: globalThis.KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    globalThis.document?.addEventListener("keydown", down);
    return () => globalThis.document?.removeEventListener("keydown", down);
  }, []);

  return (
    <div className="grid gap-6">
      <div className="grid gap-2">
        <h3 className="text-sm font-medium">Command Palette</h3>
        <p className="text-muted-foreground text-sm">Press Ctrl/Cmd+K to open.</p>
        <Button size="sm" onClick={() => setOpen(true)}>
          Open palette
        </Button>
        <CommandDialog open={open} onOpenChange={setOpen}>
          <CommandInput placeholder="Search actions..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Navigation">
              <CommandItem>Home</CommandItem>
              <CommandItem>Components</CommandItem>
              <CommandItem>Docs</CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Actions">
              <CommandItem>New file</CommandItem>
              <CommandItem>Save</CommandItem>
            </CommandGroup>
          </CommandList>
        </CommandDialog>
      </div>

      <div className="grid gap-2">
        <h3 className="text-sm font-medium">Combobox</h3>
        <p className="text-muted-foreground text-sm">Filterable list selection.</p>
        <div className="rounded-md border p-3">
          <Command value={value} onValueChange={setValue} className="rounded-md">
            <CommandInput placeholder="Search fruits..." />
            <CommandList>
              <CommandEmpty>No results.</CommandEmpty>
              <CommandGroup heading="Fruits">
                {["Apple", "Banana", "Cherry", "Grape", "Orange", "Pear"].map((item) => (
                  <CommandItem key={item} value={item} onSelect={setValue}>
                    {item}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
          <div className="text-muted-foreground mt-2 text-xs">Selected: {value || "(none)"}</div>
        </div>
      </div>
    </div>
  );
}
