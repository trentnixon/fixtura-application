import {
  TypographyH1,
  TypographyH2,
  TypographyList,
  TypographyMuted,
} from "@/components/typography";

export const metadata = {
  title: "Multi file upload — Interaction lab",
  description: "Planned: multi-file upload queue mechanics.",
};

export default function InteractionLabUploadMultiFilePage() {
  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <TypographyH1 className="text-2xl font-semibold tracking-tight">
          Multi file upload
        </TypographyH1>
        <TypographyMuted className="max-w-2xl leading-relaxed">
          Planned area for queue behaviour, partial failures, and removing items from the queue.
        </TypographyMuted>
      </header>
      <section className="space-y-2">
        <TypographyH2 className="text-base font-semibold">Planned coverage</TypographyH2>
        <TypographyList className="text-muted-foreground list-inside space-y-1">
          <li>Empty</li>
          <li>Queued</li>
          <li>Partial failure</li>
          <li>Full success</li>
          <li>Remove file</li>
        </TypographyList>
      </section>
    </article>
  );
}
