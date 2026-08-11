import {
  TypographyAlertDescription,
  TypographyAlertTitle,
  TypographyDialogDescription,
  TypographyDialogTitle,
  TypographyEmptyStateDescription,
  TypographyEmptyStateTitle,
  TypographyH2,
  TypographyMuted,
  TypographyPopoverDescription,
  TypographyPopoverTitle,
  TypographyStatusLabel,
} from "@/components/typography";
import { Section } from "@/components/ui/container";

export function StateOverlaysSection() {
  return (
    <Section spacing="none">
      <TypographyH2 className="text-muted-foreground border-border mb-6 border-b pb-2 text-sm font-semibold tracking-wider uppercase">
        Alerts, empty states, dialogs & popovers
      </TypographyH2>
      <div className="space-y-10">
        <div className="bg-card border-border space-y-2 rounded-lg border p-4">
          <TypographyAlertTitle as="h3">Sync paused</TypographyAlertTitle>
          <TypographyAlertDescription>
            We could not reach the server. Check your connection and try again.
          </TypographyAlertDescription>
        </div>
        <div className="border-border bg-muted/20 flex flex-col items-start gap-2 rounded-lg border border-dashed p-8">
          <TypographyEmptyStateTitle as="h3">No fixtures yet</TypographyEmptyStateTitle>
          <TypographyEmptyStateDescription>
            Create a fixture to see it listed here. You can import a CSV or start from a template.
          </TypographyEmptyStateDescription>
        </div>
        <div className="space-y-2">
          <TypographyDialogTitle as="h3">Confirm archive</TypographyDialogTitle>
          <TypographyDialogDescription>
            Archived seasons stay read-only. You can restore them within 30 days.
          </TypographyDialogDescription>
        </div>
        <div className="bg-popover text-popover-foreground border-border max-w-sm space-y-2 rounded-md border p-4 shadow-md">
          <TypographyPopoverTitle>Keyboard tip</TypographyPopoverTitle>
          <TypographyPopoverDescription>
            Press <kbd className="bg-muted rounded px-1 text-xs">/</kbd> to focus search.
          </TypographyPopoverDescription>
        </div>
        <div className="flex flex-wrap gap-2">
          <TypographyMuted className="w-full text-xs">Status labels (chips)</TypographyMuted>
          <span className="bg-muted inline-flex items-center rounded-full px-2 py-0.5">
            <TypographyStatusLabel>Draft</TypographyStatusLabel>
          </span>
          <span className="bg-primary/10 inline-flex items-center rounded-full px-2 py-0.5">
            <TypographyStatusLabel tone="default">Active</TypographyStatusLabel>
          </span>
        </div>
      </div>
    </Section>
  );
}
