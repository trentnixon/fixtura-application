import { TrendingUp, Users, MoreVertical, CircleCheck, Clock } from "lucide-react";

import { TypographyH2, TypographyH3, TypographyH4, TypographyMuted } from "@/components/typography";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter, CardAction } from "@/components/ui/card";
import { PageHeader, Section, Surface } from "@/components/ui/container";

import { FeedbackCardsSection } from "./feedback-cards-section";
import { GridCardExplorationSection } from "./grid-card-exploration";

export default function CardsPage() {
  return (
    <div className="space-y-12">
      <PageHeader
        title="Card Components"
        description="Cards group related information and provide a clear entry point to more detail. Standard shadcn-style cards sit alongside square and tall grid tiles (GridCard) used for organisation pickers and shortcuts."
      />

      <div className="space-y-16">
        <Section spacing="none">
          <div className="mb-6">
            <TypographyH2 className="text-xl font-semibold">Standard Card</TypographyH2>
            <TypographyMuted className="mt-1">
              The primary container for grouped content with header, body, and footer support.
            </TypographyMuted>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <Card>
              <CardHeader>
                <TypographyH3 className="text-lg leading-none font-semibold">
                  Project Overview
                </TypographyH3>
                <TypographyMuted>
                  View and manage the details of your current active project.
                </TypographyMuted>
                <CardAction>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="size-4" />
                  </Button>
                </CardAction>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm">
                    <CircleCheck className="text-success size-4" />
                    <TypographyMuted>Assets verified</TypographyMuted>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="text-warning size-4" />
                    <TypographyMuted>Pending review (2 items)</TypographyMuted>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/20 border-t pt-6">
                <Button variant="brand" className="w-full">
                  Manage Project
                </Button>
              </CardFooter>
            </Card>

            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <TypographyH3 className="text-primary text-lg leading-none font-semibold">
                  Premium Feature
                </TypographyH3>
                <TypographyMuted>
                  Upgrade your account to access advanced analytics and reporting tools.
                </TypographyMuted>
              </CardHeader>
              <CardContent className="py-2">
                <TypographyMuted className="leading-relaxed">
                  Unlock deep insights into your audience behavior and project performance with our
                  pro dashboard.
                </TypographyMuted>
              </CardContent>
              <CardFooter>
                <Button variant="accent">Unlock Pro</Button>
              </CardFooter>
            </Card>
          </div>
        </Section>

        <Section spacing="none">
          <div className="mb-6">
            <TypographyH2 className="text-xl font-semibold">Surface vs Card</TypographyH2>
            <TypographyMuted className="mt-1">
              Surfaces are lighter, simple containers without internal padding constraints.
            </TypographyMuted>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="space-y-4">
              <TypographyMuted className="font-mono text-xs tracking-widest uppercase">
                Surface Layout
              </TypographyMuted>
              <Surface className="overflow-hidden p-0">
                <div className="bg-muted border-b px-6 py-4">
                  <TypographyH4 className="text-sm font-semibold">Quick Settings</TypographyH4>
                </div>
                <div className="space-y-4 p-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Auto-update enabled</span>
                    <div className="bg-success size-4 rounded-full" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Public visibility</span>
                    <div className="bg-muted size-4 rounded-full" />
                  </div>
                </div>
              </Surface>
            </div>

            <div className="space-y-4">
              <TypographyMuted className="font-mono text-xs tracking-widest uppercase">
                Stat Cards
              </TypographyMuted>
              <div className="grid grid-cols-2 gap-4">
                <Surface className="flex flex-col gap-2">
                  <div className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-lg">
                    <Users className="size-4" />
                  </div>
                  <TypographyH3 className="text-2xl font-bold">1.2k</TypographyH3>
                  <TypographyMuted className="text-[10px] font-semibold tracking-tight uppercase">
                    Active Users
                  </TypographyMuted>
                </Surface>
                <Surface className="flex flex-col gap-2">
                  <div className="bg-success/10 text-success flex size-8 items-center justify-center rounded-lg">
                    <TrendingUp className="size-4" />
                  </div>
                  <TypographyH3 className="text-2xl font-bold">+12%</TypographyH3>
                  <TypographyMuted className="text-[10px] font-semibold tracking-tight uppercase">
                    Growth rate
                  </TypographyMuted>
                </Surface>
              </div>
            </div>
          </div>
        </Section>

        <Section spacing="none">
          <div className="mb-6">
            <TypographyH2 className="text-xl font-semibold">Complex Composition</TypographyH2>
            <TypographyMuted className="mt-1">
              Combining cards and other UI primitives for feature-rich modules.
            </TypographyMuted>
          </div>
          <Card className="ring-border max-w-3xl overflow-hidden border-none shadow-xl ring-1">
            <div className="from-primary via-brand-secondary to-brand-accent h-2 w-full bg-gradient-to-r" />
            <div className="flex flex-col md:flex-row">
              <div className="flex-1 p-8">
                <TypographyH3 className="mb-2 text-2xl font-bold">
                  Build your first report
                </TypographyH3>
                <TypographyMuted className="mb-6">
                  Select a project template below to see how Fixtura can transform your verification
                  workflow seamlessly.
                </TypographyMuted>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="h-auto flex-col items-start justify-start gap-1 px-4 py-3"
                  >
                    <span className="text-sm font-semibold">Standard Audit</span>
                    <span className="text-[10px] opacity-70">Best for small teams</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto flex-col items-start justify-start gap-1 px-4 py-3"
                  >
                    <span className="text-sm font-semibold">Enterprise Scan</span>
                    <span className="text-[10px] opacity-70">Full compliance depth</span>
                  </Button>
                </div>
              </div>
              <div className="bg-muted/30 flex w-full flex-col justify-between border-l p-8 md:w-64">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="bg-brand-accent size-2 rounded-full" />
                    <span className="text-xs font-semibold">Draft mode</span>
                  </div>
                  <TypographyMuted className="text-xs">
                    Created 2 hours ago by Trent Nixon.
                  </TypographyMuted>
                </div>
                <Button variant="default" className="mt-8">
                  Configure template
                </Button>
              </div>
            </div>
          </Card>
        </Section>

        <FeedbackCardsSection />

        <GridCardExplorationSection />
      </div>
    </div>
  );
}
