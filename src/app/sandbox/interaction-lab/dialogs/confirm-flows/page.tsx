import {
  TypographyH1,
  TypographyH2,
  TypographyList,
  TypographyMuted,
} from "@/components/typography";

export const metadata = {
  title: "Confirm flows — Interaction lab",
  description: "Planned: confirmation and multi-step dialog mechanics.",
};

export default function InteractionLabConfirmFlowsPage() {
  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <TypographyH1 className="text-2xl font-semibold tracking-tight">Confirm flows</TypographyH1>
        <TypographyMuted className="max-w-2xl leading-relaxed">
          Planned area for confirmation modals, destructive-action confirms, multi-step modal flows,
          and handoff to success states.
        </TypographyMuted>
      </header>
      <section className="space-y-2">
        <TypographyH2 className="text-base font-semibold">Planned coverage</TypographyH2>
        <TypographyList className="text-muted-foreground list-inside space-y-1">
          <li>Confirmation dialogs</li>
          <li>Destructive action confirm</li>
          <li>Multi-step modal flow</li>
          <li>Wizard-style steps</li>
          <li>Success transition after confirm</li>
          <li>Cancel and dismiss behaviour</li>
        </TypographyList>
      </section>
    </article>
  );
}
