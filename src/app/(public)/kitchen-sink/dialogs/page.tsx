"use client";

import { AlertTriangle, Trash2, UserPlus, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageHeader, Section } from "@/components/ui/container";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function DialogsPage() {
  return (
    <div className="space-y-12 pb-20">
      <PageHeader
        title="Dialogs & Modals"
        description="Focused modal overlays for critical actions, ensuring clear communication and consistent premium styling."
      />

      <div className="space-y-16">
        {/* Gallery Section */}
        <Section spacing="none">
          <div className="mb-6">
            <h2 className="font-heading text-foreground text-xl font-semibold">Modal Gallery</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Our dialogs use a 1.25rem corner radius and glass-based overlays to maintain the Prime
              aesthetic.
            </p>
          </div>

          <div className="bg-card/40 flex flex-wrap items-center justify-center gap-6 rounded-3xl border border-dashed p-12">
            {/* Standard Interaction */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Simple Info Modal</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Project Audit Complete</DialogTitle>
                  <DialogDescription>
                    Your automated accessibility scan for "Marketing Site v2" has finished
                    successfully.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-6">
                  <div className="bg-success/5 border-success/10 flex items-center gap-3 rounded-xl border p-4">
                    <ShieldCheck className="text-success size-5" />
                    <span className="text-sm font-medium">98 Compliance issues resolved</span>
                  </div>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    A full PDF report has been generated and is ready for download in your project
                    dashboard.
                  </p>
                </div>
                <DialogFooter>
                  <Button variant="ghost">Dismiss</Button>
                  <Button variant="brand">Review Report</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Form in Dialog */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="brand">
                  <UserPlus className="mr-2 h-4 w-4" /> Add Team Member
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <div className="bg-primary/10 text-primary mb-4 flex size-12 items-center justify-center rounded-2xl">
                    <UserPlus className="size-6" />
                  </div>
                  <DialogTitle>Invite Member</DialogTitle>
                  <DialogDescription>
                    Invite a new collaborator to this project. They will receive an email with
                    access instructions.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-6">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" placeholder="John Doe" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Work Email</Label>
                    <Input id="email" type="email" placeholder="john@company.com" />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" variant="brand" className="w-full">
                    Send Invitation
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Destructive / Alert Style */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" /> Delete Project
                </Button>
              </DialogTrigger>
              <DialogContent className="border-destructive/20">
                <DialogHeader>
                  <div className="bg-destructive/10 text-destructive mb-4 flex size-12 items-center justify-center rounded-2xl">
                    <AlertTriangle className="size-6" />
                  </div>
                  <DialogTitle className="text-destructive font-bold">
                    Irreversible Action
                  </DialogTitle>
                  <DialogDescription>
                    Are you absolutely sure? This will permanently delete the{" "}
                    <strong>"Acme Q2 Audit"</strong> and all associated verification history.
                  </DialogDescription>
                </DialogHeader>
                <div className="bg-destructive/5 border-destructive/10 rounded-xl border px-4 py-4">
                  <p className="text-destructive-foreground/80 text-xs leading-relaxed font-medium">
                    This step cannot be undone. Please type the project name to confirm deletion.
                  </p>
                </div>
                <DialogFooter className="gap-4 sm:justify-between">
                  <Button variant="ghost" className="flex-1">
                    Cancel
                  </Button>
                  <Button variant="destructive" className="flex-1 font-bold">
                    Confirm Deletion
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </Section>

        {/* Technical Specs */}
        <Section spacing="none">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
            <div className="space-y-4">
              <h4 className="text-primary text-sm font-bold tracking-widest uppercase">
                Responsive Behavior
              </h4>
              <p className="text-muted-foreground text-sm leading-relaxed">
                On mobile devices, dialogs use a <strong>max-width-[calc(100%-2rem)]</strong>{" "}
                constraint to ensure they never touch the screen edge, while stacking footer actions
                vertically for better reachability.
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="text-primary text-sm font-bold tracking-widest uppercase">
                Overlay Design
              </h4>
              <p className="text-muted-foreground text-sm leading-relaxed">
                The backdrop uses <strong>backdrop-blur-sm</strong> with a 60% black opacity. This
                ensures the user is focused on the task at hand without losing complete spatial
                awareness of their previous screen.
              </p>
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}
