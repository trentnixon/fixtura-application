import { TrendingUp, Users, MoreVertical, CircleCheck, Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
} from "@/components/ui/card";
import { PageHeader, Section, Surface } from "@/components/ui/container";

export default function CardsPage() {
  return (
    <div className="space-y-12">
      <PageHeader
        title="Card Components"
        description="Cards are used to group related information and provide a clear entry point to more detailed content."
      />

      <div className="space-y-16">
        {/* Basic Card */}
        <Section spacing="none">
          <div className="mb-6">
            <h2 className="font-heading text-foreground text-xl font-semibold">Standard Card</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              The primary container for grouped content with header, body, and footer support.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Project Overview</CardTitle>
                <CardDescription>
                  View and manage the details of your current active project.
                </CardDescription>
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
                    <span className="text-muted-foreground">Assets verified</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="text-warning size-4" />
                    <span className="text-muted-foreground">Pending review (2 items)</span>
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
                <CardTitle className="text-primary">Premium Feature</CardTitle>
                <CardDescription>
                  Upgrade your account to access advanced analytics and reporting tools.
                </CardDescription>
              </CardHeader>
              <CardContent className="py-2">
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Unlock deep insights into your audience behavior and project performance with our
                  pro dashboard.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="accent">Unlock Pro</Button>
              </CardFooter>
            </Card>
          </div>
        </Section>

        {/* Surface vs Card */}
        <Section spacing="none">
          <div className="mb-6">
            <h2 className="font-heading text-foreground text-xl font-semibold">Surface vs Card</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Surfaces are lighter, simple containers without internal padding constraints.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="space-y-4">
              <span className="text-muted-foreground font-mono text-xs tracking-widest uppercase">
                Surface Layout
              </span>
              <Surface className="overflow-hidden p-0">
                <div className="bg-muted border-b px-6 py-4">
                  <h4 className="text-sm font-semibold">Quick Settings</h4>
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
              <span className="text-muted-foreground font-mono text-xs tracking-widest uppercase">
                Stat Cards
              </span>
              <div className="grid grid-cols-2 gap-4">
                <Surface className="flex flex-col gap-2">
                  <div className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-lg">
                    <Users className="size-4" />
                  </div>
                  <div className="text-2xl font-bold">1.2k</div>
                  <div className="text-muted-foreground text-[10px] font-semibold tracking-tight uppercase">
                    Active Users
                  </div>
                </Surface>
                <Surface className="flex flex-col gap-2">
                  <div className="bg-success/10 text-success flex size-8 items-center justify-center rounded-lg">
                    <TrendingUp className="size-4" />
                  </div>
                  <div className="text-2xl font-bold">+12%</div>
                  <div className="text-muted-foreground text-[10px] font-semibold tracking-tight uppercase">
                    Growth rate
                  </div>
                </Surface>
              </div>
            </div>
          </div>
        </Section>

        {/* Composition Example */}
        <Section spacing="none">
          <div className="mb-6">
            <h2 className="font-heading text-foreground text-xl font-semibold">
              Complex Composition
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Combining cards and other UI primitives for feature-rich modules.
            </p>
          </div>
          <Card className="ring-border max-w-3xl overflow-hidden border-none shadow-xl ring-1">
            <div className="from-primary via-brand-secondary to-brand-accent h-2 w-full bg-gradient-to-r" />
            <div className="flex flex-col md:flex-row">
              <div className="flex-1 p-8">
                <h3 className="font-heading mb-2 text-2xl font-bold">Build your first report</h3>
                <p className="text-muted-foreground mb-6">
                  Select a project template below to see how Fixtura can transform your verification
                  workflow seamlessly.
                </p>
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
                  <div className="text-muted-foreground text-xs">
                    Created 2 hours ago by Trent Nixon.
                  </div>
                </div>
                <Button variant="default" className="mt-8">
                  Configure template
                </Button>
              </div>
            </div>
          </Card>
        </Section>
      </div>
    </div>
  );
}
