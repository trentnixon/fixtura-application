"use client";

import { CheckCircle2, AlertCircle, Info, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { PageHeader, Section } from "@/components/ui/container";

export default function ToastsPage() {
  const promise = () =>
    new Promise((resolve) => setTimeout(() => resolve({ name: "Fixtura" }), 2000));

  return (
    <div className="space-y-12">
      <PageHeader
        title="Toasts & Feedback"
        description="Brief, non-blocking feedback messages to inform users about the results of their actions."
      />

      <div className="space-y-16">
        {/* Core Status */}
        <Section spacing="none">
          <div className="mb-6">
            <h2 className="font-heading text-foreground text-xl font-semibold">Status Toasts</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Standardized icons and colors for system feedback using Sonner's rich colors.
            </p>
          </div>
          <div className="bg-card/50 flex flex-wrap items-center gap-4 rounded-xl border p-8">
            <Button
              variant="outline"
              onClick={() =>
                toast.success("Changes saved successfully", {
                  description: "Your project settings have been updated.",
                })
              }
            >
              <CheckCircle2 className="text-success mr-2 h-4 w-4" />
              Success Toast
            </Button>

            <Button
              variant="outline"
              onClick={() =>
                toast.error("Verification failed", {
                  description: "Please check your credentials and try again.",
                })
              }
            >
              <AlertCircle className="text-destructive mr-2 h-4 w-4" />
              Error Toast
            </Button>

            <Button
              variant="outline"
              onClick={() =>
                toast.warning("Approaching limit", {
                  description: "You have used 90% of your monthly scan quota.",
                })
              }
            >
              <AlertTriangle className="text-warning mr-2 h-4 w-4" />
              Warning Toast
            </Button>

            <Button
              variant="outline"
              onClick={() =>
                toast.info("New update available", {
                  description: "Version 2.4.0 includes new accessibility features.",
                })
              }
            >
              <Info className="text-primary mr-2 h-4 w-4" />
              Info Toast
            </Button>
          </div>
        </Section>

        {/* Async & Advanced */}
        <Section spacing="none">
          <div className="mb-6">
            <h2 className="font-heading text-foreground text-xl font-semibold">
              Advanced Patterns
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Handling background processes, undos, and custom actions.
            </p>
          </div>
          <div className="bg-card/50 flex flex-wrap items-center gap-4 rounded-xl border p-8">
            <Button
              variant="brand"
              onClick={() => {
                toast.promise(promise, {
                  loading: "Verifying project...",
                  success: (data: any) => {
                    return `${data.name} verified successfully`;
                  },
                  error: "Error",
                });
              }}
            >
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Promise / Loading
            </Button>

            <Button
              variant="destructive"
              onClick={() =>
                toast("Project deleted", {
                  description: "This can be undone within the next 30 seconds.",
                  action: {
                    label: "Undo",
                    onClick: () => console.log("Undo Action clicked"),
                  },
                })
              }
            >
              Toast with Action
            </Button>

            <Button
              variant="outline"
              onClick={() =>
                toast("Background process complete", {
                  description: "Your compliance report is now ready for download.",
                  cancel: {
                    label: "Dismiss",
                    onClick: () => console.log("Cancel clicked"),
                  },
                })
              }
            >
              Simple + Dismiss
            </Button>
          </div>
        </Section>

        {/* Custom Scenarios */}
        <Section spacing="none">
          <div className="mb-6">
            <h2 className="font-heading text-foreground text-xl font-semibold">Styled Scenarios</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Leveraging our custom typography (Jakarta Sans) in toast headings.
            </p>
          </div>
          <div className="bg-card/50 flex flex-wrap items-center gap-4 rounded-xl border p-8">
            <div className="bg-card flex w-full max-w-md items-start gap-4 rounded-lg border p-4 shadow-sm">
              <div className="bg-primary/10 flex size-10 shrink-0 items-center justify-center rounded-full">
                <Info className="text-primary size-5" />
              </div>
              <div className="space-y-1">
                <h5 className="font-heading text-sm leading-none font-semibold">
                  Inline Feedback Example
                </h5>
                <p className="text-muted-foreground text-xs">
                  For when a toast is too ephemeral, but an alert is too intrusive.
                </p>
              </div>
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}
