"use client";

import { Filter, Plus, RefreshCw } from "lucide-react";

import { TypographyH2, TypographyH3, TypographyMuted } from "@/components/typography";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Section } from "@/components/ui/container";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FeedbackCardSoft } from "@/components/ui/feedback-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { DemoSurface } from "./demo-surface";

export function ContextualUsageSection() {
  return (
    <Section spacing="none">
      <div className="mb-6">
        <TypographyH2 className="text-xl font-semibold">Contextual usage</TypographyH2>
        <TypographyMuted className="mt-1">
          Realistic compositions: match density and hierarchy to the surface. These are reference
          layouts — copy structure, not one-off class hacks.
        </TypographyMuted>
      </div>

      <div className="space-y-12">
        <div>
          <TypographyH3 className="mb-3 text-base font-semibold">Form actions</TypographyH3>
          <TypographyMuted className="mb-4 block text-sm leading-relaxed">
            In member-area forms, avoid <code className="text-xs">variant=&quot;default&quot;</code>{" "}
            (blue primary) for submit actions. Use{" "}
            <strong className="text-foreground">brand</strong> (teal) for standard product submits,{" "}
            <strong className="text-foreground">accent</strong> (orange) for upgrade or promotional
            CTAs. Pair with <code className="text-xs">secondary</code> or{" "}
            <code className="text-xs">outline</code> for cancel/back.
          </TypographyMuted>
          <div className="space-y-8">
            <div>
              <TypographyMuted className="mb-3 block text-xs font-medium tracking-wide uppercase">
                Teal submit + secondary cancel
              </TypographyMuted>
              <DemoSurface layout="column" className="max-w-md items-stretch">
                <div className="space-y-2">
                  <Label htmlFor="btn-demo-email">Email</Label>
                  <Input id="btn-demo-email" type="email" placeholder="you@company.com" />
                </div>
                <div className="flex flex-wrap justify-end gap-2 pt-2">
                  <Button variant="secondary" type="button">
                    Cancel
                  </Button>
                  <Button variant="brand" type="button">
                    Send code
                  </Button>
                </div>
              </DemoSurface>
            </div>
            <div>
              <TypographyMuted className="mb-3 block text-xs font-medium tracking-wide uppercase">
                Accent submit + outline cancel
              </TypographyMuted>
              <DemoSurface layout="column" className="max-w-md items-stretch">
                <div className="space-y-2">
                  <Label htmlFor="btn-demo-plan">Plan</Label>
                  <Input id="btn-demo-plan" readOnly defaultValue="Pro — $29/mo" />
                </div>
                <div className="flex flex-wrap justify-end gap-2 pt-2">
                  <Button variant="outline" type="button">
                    Not now
                  </Button>
                  <Button variant="accent" type="button">
                    Continue to checkout
                  </Button>
                </div>
              </DemoSurface>
            </div>
          </div>
        </div>

        <div>
          <TypographyH3 className="mb-3 text-base font-semibold">Dialog footer</TypographyH3>
          <TypographyMuted className="mb-4 block text-sm">
            Cancel before confirm; destructive confirmations keep cancel safe and obvious.
          </TypographyMuted>
          <DemoSurface>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Open confirm dialog</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Remove member?</DialogTitle>
                  <DialogDescription>
                    They will lose access to this organisation. This can be undone by re-inviting.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-0">
                  <Button variant="secondary">Cancel</Button>
                  <Button variant="destructive">Remove</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Open upgrade dialog</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upgrade to Pro</DialogTitle>
                  <DialogDescription>
                    Unlock advanced audits and team seats on your current plan.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-0">
                  <Button variant="ghost">Not now</Button>
                  <Button variant="accent">Upgrade</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </DemoSurface>
        </div>

        <div>
          <TypographyH3 className="mb-3 text-base font-semibold">Table toolbar</TypographyH3>
          <TypographyMuted className="mb-4 block text-sm">
            Compact buttons for filters and row-density toolbars.
          </TypographyMuted>
          <DemoSurface className="items-center justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="compact">
                <RefreshCw className="size-3.5" aria-hidden />
                Refresh
              </Button>
              <Button variant="outline" size="compact">
                <Filter className="size-3.5" aria-hidden />
                Filter
              </Button>
            </div>
            <Button variant="brand" size="compact">
              <Plus className="size-3.5" aria-hidden />
              Add new
            </Button>
          </DemoSurface>
        </div>

        <div>
          <TypographyH3 className="mb-3 text-base font-semibold">Table row actions</TypographyH3>
          <TypographyMuted className="mb-4 block text-sm">
            Inline text-style actions or compact controls in dense rows.
          </TypographyMuted>
          <div className="bg-card/50 overflow-hidden rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Quarterly report</TableCell>
                  <TableCell className="text-right">
                    <Button variant="link" size="sm" className="h-auto px-1 py-0">
                      View
                    </Button>
                    <span className="text-muted-foreground mx-1">·</span>
                    <Button variant="link" size="sm" className="text-destructive h-auto px-1 py-0">
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>

        <div>
          <TypographyH3 className="mb-3 text-base font-semibold">Empty state</TypographyH3>
          <TypographyMuted className="mb-4 block text-sm">
            Strong primary + optional quiet link for learn more.
          </TypographyMuted>
          <Card className="bg-card/50 max-w-lg border-dashed">
            <CardHeader>
              <CardTitle className="text-lg">No projects yet</CardTitle>
              <TypographyMuted>
                Create your first project to start running audits and track fixes.
              </TypographyMuted>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button fullWidth variant="default">
                Create project
              </Button>
              <Button fullWidth variant="link" className="text-muted-foreground">
                Learn more
              </Button>
            </CardContent>
          </Card>
        </div>

        <div>
          <TypographyH3 className="mb-3 text-base font-semibold">Warning / recovery</TypographyH3>
          <TypographyMuted className="mb-4 block text-sm">
            Persistent feedback cards pair a primary recovery action with optional secondary — see
            also the Cards kitchen sink.
          </TypographyMuted>
          <FeedbackCardSoft
            kind="warning"
            label="Billing"
            title="Payment failed"
            description="Update your payment method to avoid interruption."
            primaryCta="Fix now"
            secondaryCta="Contact support"
          />
        </div>

        <div>
          <TypographyH3 className="mb-3 text-base font-semibold">Card footer</TypographyH3>
          <TypographyMuted className="mb-4 block text-sm">
            Card-level CTAs are often secondary or brand — avoid competing primaries with the page
            header.
          </TypographyMuted>
          <Card className="bg-card/50 max-w-md">
            <CardHeader>
              <CardTitle className="text-base">Team plan</CardTitle>
              <TypographyMuted className="text-sm">5 seats · renews monthly</TypographyMuted>
            </CardHeader>
            <CardFooter className="flex flex-wrap gap-2 border-t pt-6">
              <Button variant="outline" size="sm">
                Manage
              </Button>
              <Button variant="brand" size="sm">
                Upgrade now
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </Section>
  );
}
