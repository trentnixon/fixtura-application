import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import { SPONSOR_LIBRARY_SEARCH_PLACEHOLDER } from "../_constants/sponsor-library-search";

import type { SponsorLibrarySearchProps } from "../_types/sponsor-library";

export function SponsorLibrarySearch({
  id,
  value,
  onChange,
  disabled = false,
  className,
  "aria-label": ariaLabel,
}: SponsorLibrarySearchProps) {
  return (
    <div className={cn("relative", className)}>
      <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
      <Input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={SPONSOR_LIBRARY_SEARCH_PLACEHOLDER}
        className="pl-9"
        disabled={disabled}
        autoComplete="off"
        aria-label={ariaLabel}
      />
    </div>
  );
}
