import {
  TypographyH1,
  TypographyH2,
  TypographyList,
  TypographyMuted,
} from "@/components/typography";

export const metadata = {
  title: "Bulk actions — Interaction lab",
  description: "Planned: bulk selection and batch action mechanics.",
};

export default function InteractionLabBulkActionsPage() {
  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <TypographyH1 className="text-2xl font-semibold tracking-tight">Bulk actions</TypographyH1>
        <TypographyMuted className="max-w-2xl leading-relaxed">
          Planned area for row selection, select-all / partial selection, toolbar state, confirm
          flows, and success or error outcomes.
        </TypographyMuted>
      </header>
      <section className="space-y-2">
        <TypographyH2 className="text-base font-semibold">Planned coverage</TypographyH2>
        <TypographyList className="text-muted-foreground list-inside space-y-1">
          <li>No selection</li>
          <li>One selected</li>
          <li>Multiple selected</li>
          <li>Partial select (header indeterminate)</li>
          <li>Confirm action</li>
          <li>Action success</li>
          <li>Action error</li>
        </TypographyList>
      </section>
    </article>
  );
}
