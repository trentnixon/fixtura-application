import { SearchX } from "lucide-react";

import { TypographyH3, TypographyMuted } from "@/components/typography";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

type MediaGalleryNoResultsProps = {
  onClearFilters: () => void;
};

export function MediaGalleryNoResults({ onClearFilters }: MediaGalleryNoResultsProps) {
  return (
    <Card className="border-border shadow-sm ring-0" role="status">
      <CardContent className="flex flex-col items-center px-6 pt-8 text-center">
        <div
          className="bg-muted text-muted-foreground flex size-12 items-center justify-center rounded-xl"
          aria-hidden
        >
          <SearchX className="size-6" />
        </div>
        <TypographyH3 className="mt-4 text-base font-semibold">
          No matching backgrounds
        </TypographyH3>
        <TypographyMuted className="mt-2 max-w-xl text-sm leading-relaxed">
          Try adjusting your search or filters, or clear them to see the full library again.
        </TypographyMuted>
      </CardContent>
      <CardFooter className="flex justify-center px-6 pb-6">
        <Button type="button" variant="outline" onClick={onClearFilters}>
          Clear filters
        </Button>
      </CardFooter>
    </Card>
  );
}
