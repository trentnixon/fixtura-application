import { Images } from "lucide-react";

import { TypographyH3, TypographyMuted } from "@/components/typography";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

type MediaGalleryEmptyProps = {
  onUploadClick: () => void;
  readOnly?: boolean;
};

export function MediaGalleryEmpty({ onUploadClick, readOnly = false }: MediaGalleryEmptyProps) {
  return (
    <Card className="border-primary/15 bg-primary/5 shadow-sm ring-0" role="status">
      <CardContent className="flex flex-col items-center px-6 pt-8 text-center">
        <div
          className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-xl"
          aria-hidden
        >
          <Images className="size-6" />
        </div>
        <TypographyH3 className="mt-4 text-base font-semibold">
          No background images yet
        </TypographyH3>
        <TypographyMuted className="mt-2 max-w-xl text-sm leading-relaxed">
          Upload images to use as backgrounds in your assets. Optionally set an age category and
          asset type so each image appears in the right places.
        </TypographyMuted>
      </CardContent>
      {!readOnly ? (
        <CardFooter className="flex justify-center px-6 pb-6">
          <Button type="button" variant="accent" onClick={onUploadClick}>
            Upload your first background
          </Button>
        </CardFooter>
      ) : null}
    </Card>
  );
}
