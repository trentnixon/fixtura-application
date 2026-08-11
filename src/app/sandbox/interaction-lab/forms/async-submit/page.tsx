import {
  TypographyH1,
  TypographyH2,
  TypographyList,
  TypographyMuted,
} from "@/components/typography";

export const metadata = {
  title: "Async submit — Interaction lab",
  description: "Planned: async form submission mechanics.",
};

export default function InteractionLabAsyncSubmitPage() {
  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <TypographyH1 className="text-2xl font-semibold tracking-tight">Async submit</TypographyH1>
        <TypographyMuted className="max-w-2xl leading-relaxed">
          Planned area for dirty state, validation, submitting, success and error transitions, and
          retry—using fake delays, not live APIs.
        </TypographyMuted>
      </header>
      <section className="space-y-2">
        <TypographyH2 className="text-base font-semibold">Planned coverage</TypographyH2>
        <TypographyList className="text-muted-foreground list-inside space-y-1">
          <li>Idle</li>
          <li>Dirty</li>
          <li>Validating</li>
          <li>Submitting</li>
          <li>Success</li>
          <li>Error</li>
        </TypographyList>
      </section>
    </article>
  );
}
