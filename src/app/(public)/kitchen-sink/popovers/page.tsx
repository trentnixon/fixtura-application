"use client";

import { Settings2, HelpCircle, Info, Clock, History } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageHeader, Section } from "@/components/ui/container";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export default function PopoversPage() {
  return (
    <div className="space-y-12 pb-20">
      <PageHeader
        title="Popovers"
        description="Floating contextual panels for small-scale layouts, quick settings, and floating help documentation."
      />

      <div className="space-y-16">
        {/* Core Showcase */}
        <Section spacing="none">
          <div className="mb-6">
            <h2 className="font-heading text-foreground text-xl font-semibold">Standard Popover</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Popovers utilize our premium rounding and subtle glass backdrops to maintain UI focus.
            </p>
          </div>

          <div className="bg-card/40 flex flex-wrap items-center justify-center gap-6 rounded-3xl border border-dashed p-12">
            {/* Informational */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full">
                  <HelpCircle className="size-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Info className="text-primary size-4" />
                    <h4 className="font-heading text-sm font-semibold">Audit Logic</h4>
                  </div>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    Our audit engine uses a weighted scoring model based on WCAG 2.1 AA standards.
                    Scores are updated in real-time as assets are verified.
                  </p>
                  <Button variant="link" className="text-primary h-auto p-0 text-xs font-bold">
                    Learn more &rarr;
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            {/* Quick Form */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="brand">
                  <Settings2 className="mr-2 h-4 w-4" /> Quick Config
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="grid gap-4 font-sans">
                  <div className="space-y-2">
                    <h4 className="font-heading leading-none font-semibold">Dimensions</h4>
                    <p className="text-muted-foreground text-xs">
                      Set the base dimensions for the audit capture.
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <div className="grid grid-cols-3 items-center gap-4">
                      <Label htmlFor="width" className="text-xs">
                        Width
                      </Label>
                      <Input
                        id="width"
                        defaultValue="100%"
                        className="col-span-2 h-8 font-mono text-xs"
                      />
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                      <Label htmlFor="maxWidth" className="text-xs">
                        Max width
                      </Label>
                      <Input
                        id="maxWidth"
                        defaultValue="1440px"
                        className="col-span-2 h-8 font-mono text-xs"
                      />
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                      <Label htmlFor="height" className="text-xs">
                        Height
                      </Label>
                      <Input
                        id="height"
                        defaultValue="2500px"
                        className="col-span-2 h-8 font-mono text-xs"
                      />
                    </div>
                  </div>
                  <Button
                    variant="brand"
                    size="sm"
                    className="mt-2 w-full text-[10px] font-bold tracking-widest uppercase"
                  >
                    Apply Settings
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            {/* List / History */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <History className="mr-2 h-4 w-4" /> Recent Audits
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 overflow-hidden p-0">
                <div className="bg-muted/50 border-b p-3">
                  <span className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
                    Historical Logs
                  </span>
                </div>
                <div className="divide-border divide-y">
                  {[
                    { name: "Acme Audit", time: "2h ago" },
                    { name: "Globex Scan", time: "5h ago" },
                    { name: "Wayne Portal", time: "1d ago" },
                  ].map((item, i) => (
                    <button
                      key={i}
                      className="hover:bg-primary/5 group w-full p-3 text-left transition-colors"
                    >
                      <p className="group-hover:text-primary text-xs font-semibold transition-colors">
                        {item.name}
                      </p>
                      <div className="text-muted-foreground mt-1 flex items-center gap-1 text-[10px]">
                        <Clock className="size-2.5" /> {item.time}
                      </div>
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </Section>
      </div>
    </div>
  );
}
