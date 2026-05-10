import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";

export function SponsorLibrarySearch({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative">
      <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search sponsor pool"
        className="pl-9"
      />
    </div>
  );
}
