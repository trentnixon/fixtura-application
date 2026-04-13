import { TypographyH1, TypographyMuted } from "@/components/typography";

import { ListReorderClient } from "./list-reorder-client";

export const metadata = {
  title: "List reorder — Interaction lab",
  description: "Demonstration of drag-and-drop list reorder mechanics.",
};

export default function InteractionLabListReorderPage() {
  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <TypographyH1 className="text-2xl font-semibold tracking-tight">List reorder</TypographyH1>
        <TypographyMuted className="max-w-2xl leading-relaxed">
          Evaluate interaction quality, component structure, state handling, and layout behaviour
          for sortable lists.
        </TypographyMuted>
      </header>

      <section className="mt-8">
        <ListReorderClient />
      </section>
    </article>
  );
}
