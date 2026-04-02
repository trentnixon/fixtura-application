"use client";

import { Loader2, RefreshCw, Hourglass } from "lucide-react";
import { useState, useEffect } from "react";

import { BrandedLoader } from "@/components/ui/branded-loader";
import { Button } from "@/components/ui/button";
import { PageHeader, Section, Surface } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingPage() {
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setComplete(true), 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative space-y-12 pb-20">
      <PageHeader
        title="Loading Systems"
        description="Standardized patterns for system occupancy, data fetching, and background processing."
      />

      <div className="space-y-24">
        {/* Full Page Pattern (Mocked in container) */}
        <Section spacing="none">
          <div className="mb-6">
            <h2 className="font-heading text-foreground text-xl font-semibold italic">
              Full Page Branded Loader
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Used during initial application hydration or critical navigation events.
            </p>
          </div>
          <div className="bg-background relative flex h-[400px] w-full flex-col items-center justify-center overflow-hidden rounded-[2rem] border shadow-inner">
            <BrandedLoader size="lg" label="Synchronizing Data Stream" />
            {/* Top progress line simulation */}
            <div
              className="from-primary to-brand-secondary absolute top-0 left-0 h-1 animate-[loading-bar_4s_ease-in-out_infinite] bg-gradient-to-r"
              style={{ width: complete ? "100%" : "60%" }}
            />
          </div>
        </Section>

        {/* Skeleton Patterns */}
        <Section spacing="none">
          <div className="mb-6">
            <h2 className="font-heading text-foreground text-xl font-semibold">
              Skeleton UI States
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Placeholder UI for content-heavy components during initial fetch.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* Card Skeleton */}
            <Surface className="space-y-6">
              <div className="flex items-center gap-4">
                <Skeleton className="size-12 rounded-2xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <div className="space-y-3">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-[60%]" />
              </div>
              <div className="flex gap-2 pt-4">
                <Skeleton className="h-10 flex-1 rounded-xl" />
                <Skeleton className="h-10 w-10 rounded-xl" />
              </div>
            </Surface>

            {/* List Skeleton */}
            <Surface className="overflow-hidden p-0">
              <div className="bg-muted/20 border-b p-4">
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="divide-border divide-y">
                {[1, 2, 3, 4].map((idx) => (
                  <div key={idx} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="size-6 rounded-full" />
                      <Skeleton className="h-3 w-40" />
                    </div>
                    <Skeleton className="h-4 w-12 rounded-lg" />
                  </div>
                ))}
              </div>
            </Surface>
          </div>
        </Section>

        {/* Small Interaction Spinners */}
        <Section spacing="none">
          <div className="mb-6">
            <h2 className="font-heading text-foreground text-xl font-semibold">
              Contextual Spinners
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Lightweight indicators for local button or input states.
            </p>
          </div>

          <div className="bg-card/40 flex flex-wrap items-center justify-center gap-8 rounded-[2rem] border p-10">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="text-primary size-6 animate-spin" />
              <span className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
                Standard
              </span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <RefreshCw className="text-brand-secondary size-6 animate-spin" />
              <span className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
                Syncing
              </span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <Hourglass className="text-brand-accent size-6 animate-bounce" />
              <span className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
                Waiting
              </span>
            </div>
            <Button variant="brand" disabled>
              <Loader2 className="mr-2 size-4 animate-spin" /> Authorizing...
            </Button>
          </div>
        </Section>
      </div>

      <style jsx global>{`
        @keyframes loading-bar {
          0% {
            width: 0%;
            opacity: 1;
          }
          50% {
            width: 70%;
            opacity: 1;
          }
          100% {
            width: 100%;
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
