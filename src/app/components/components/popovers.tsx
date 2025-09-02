"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

export function PopoversPanel() {
  const [email, setEmail] = React.useState("");

  return (
    <div className="grid gap-6">
      <div className="grid gap-2">
        <h3 className="text-sm font-medium">Popover form</h3>
        <p className="text-muted-foreground text-sm">Use a popover for lightweight inline forms.</p>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">Open popover</Button>
          </PopoverTrigger>
          <PopoverContent>
            <div className="grid gap-3">
              <label htmlFor="email" className="text-sm">
                Email
              </label>
              <input
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-input bg-background ring-offset-background focus-visible:ring-ring placeholder:text-muted-foreground flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                placeholder="jane@example.com"
              />
              <div className="flex items-center justify-end gap-2">
                <Button variant="outline" size="sm">
                  Cancel
                </Button>
                <Button disabled={!email} size="sm">
                  Save
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid gap-2">
        <h3 className="text-sm font-medium">Tooltip</h3>
        <p className="text-muted-foreground text-sm">Helpful hints on hover/focus.</p>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="sm" variant="ghost" aria-label="info">
                ℹ️
              </Button>
            </TooltipTrigger>
            <TooltipContent>More information</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="grid gap-2">
        <h3 className="text-sm font-medium">Dropdown Menu</h3>
        <p className="text-muted-foreground text-sm">Command actions via menu.</p>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>Open menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View</DropdownMenuItem>
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
