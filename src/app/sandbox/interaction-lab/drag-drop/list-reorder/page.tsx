import {
  TypographyH1,
  TypographyH2,
  TypographyList,
  TypographyMuted,
} from "@/components/typography";

export const metadata = {
  title: "List reorder — Interaction lab",
  description: "Planned: drag-and-drop list reorder mechanics.",
};

export default function InteractionLabListReorderPage() {
  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <TypographyH1 className="text-2xl font-semibold tracking-tight">List reorder</TypographyH1>
        <TypographyMuted className="max-w-2xl leading-relaxed">
          Planned area for reorder state, drag feedback, drop results, and invalid move handling.
        </TypographyMuted>
      </header>
      <section className="space-y-2">
        <TypographyH2 className="text-base font-semibold">Planned coverage</TypographyH2>
        <TypographyList className="text-muted-foreground list-inside space-y-1">
          <li>Empty list</li>
          <li>Populated list</li>
          <li>Dragging</li>
          <li>Dropped</li>
          <li>Invalid move</li>
        </TypographyList>
      </section>
    </article>
  );
}
