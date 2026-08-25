"use client";

import { CircleHelp } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { TypographyMuted } from "@/components/typography";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

import type { PageHelpContent } from "./types";
import type { ReactElement } from "react";

const SECTION_LABEL_CLASS = "text-primary text-[11px] font-semibold tracking-[0.08em] uppercase";

export type PageHelpSheetProps = {
  content: PageHelpContent;
  trigger: ReactElement;
};

export function PageHelpSheet({ content, trigger }: PageHelpSheetProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent
        side="right"
        className={cn(
          "border-primary/15 bg-background w-full gap-0 p-0 sm:max-w-md",
          "shadow-primary/5 shadow-xl",
        )}
      >
        <SheetHeader className="border-primary/10 from-primary/8 to-background space-y-3 border-b bg-gradient-to-b px-5 py-5 text-left">
          <div className="flex items-start gap-3">
            <div
              className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-xl"
              aria-hidden
            >
              <CircleHelp className="size-5" />
            </div>
            <div className="min-w-0 space-y-1.5">
              <p className={SECTION_LABEL_CLASS}>How this works</p>
              <SheetTitle className="text-xl leading-snug font-semibold tracking-tight">
                {content.title}
              </SheetTitle>
              <SheetDescription className="text-muted-foreground text-sm leading-relaxed">
                {content.summary}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-8 overflow-y-auto px-5 py-6">
          {content.items.length > 0 ? (
            <section className="space-y-3">
              <h3 className={SECTION_LABEL_CLASS}>On this page</h3>
              <ul className="space-y-3">
                {content.items.map((item, index) => (
                  <li
                    key={item.label}
                    className="border-primary/15 bg-primary/5 ring-primary/10 rounded-xl border p-3.5 ring-1"
                  >
                    <div className="flex gap-3">
                      <span
                        className="bg-primary/15 text-primary mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-lg text-xs font-semibold"
                        aria-hidden
                      >
                        {index + 1}
                      </span>
                      <div className="min-w-0 space-y-1">
                        <p className="text-foreground text-sm font-semibold tracking-tight">
                          {item.label}
                        </p>
                        <TypographyMuted className="text-sm leading-relaxed">
                          {item.howTo}
                        </TypographyMuted>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {content.visual ? (
            <section className="space-y-3">
              <h3 className={SECTION_LABEL_CLASS}>Example</h3>
              <div className="border-primary/15 ring-primary/10 relative aspect-video overflow-hidden rounded-xl border ring-1">
                <Image
                  src={content.visual.src}
                  alt={content.visual.alt}
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 768px) 100vw, 28rem"
                />
              </div>
            </section>
          ) : null}

          {content.related.length > 0 ? (
            <section className="space-y-3">
              <h3 className={SECTION_LABEL_CLASS}>Related</h3>
              <ul className="space-y-2">
                {content.related.map((item) => (
                  <li key={item.href}>
                    <Button
                      variant="brandPrimaryOutline"
                      className="border-primary/20 w-full justify-start"
                      asChild
                    >
                      <Link href={item.href}>{item.label}</Link>
                    </Button>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}
