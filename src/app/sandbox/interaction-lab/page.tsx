import Link from "next/link";

import {
  TypographyH1,
  TypographyH2,
  TypographyInlineCode,
  TypographyMuted,
} from "@/components/typography";
import { ROUTES } from "@/lib/config/routes";

export const metadata = {
  title: "Interaction lab",
  description: "Development sandbox for interaction mechanics, state transitions, and async flows.",
};

export default function InteractionLabOverviewPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <TypographyMuted className="text-xs font-medium tracking-wide uppercase">
          Development only
        </TypographyMuted>
        <TypographyH1 className="text-3xl font-semibold">Interaction lab</TypographyH1>
        <TypographyMuted className="max-w-2xl leading-relaxed">
          This area is for testing how behaviours work over time—uploads, drag-and-drop, bulk
          selection, async forms, and dialog flows—using fixtures and mock state. It is not for
          visual primitives (see{" "}
          <Link href={ROUTES.kitchenSink} className="text-foreground font-medium hover:underline">
            Kitchen sink
          </Link>
          ) or full-page shell composition (see{" "}
          <Link href={ROUTES.routeLab} className="text-foreground font-medium hover:underline">
            Route lab
          </Link>
          ).
        </TypographyMuted>
      </header>

      <section className="space-y-3">
        <TypographyH2 className="text-lg font-semibold">Query params (future)</TypographyH2>
        <TypographyMuted className="leading-relaxed">
          When scenarios are implemented, pages may use{" "}
          <TypographyInlineCode>state</TypographyInlineCode>,{" "}
          <TypographyInlineCode>scenario</TypographyInlineCode>, and{" "}
          <TypographyInlineCode>mode</TypographyInlineCode> search params for deterministic
          setups—see project comms for the Interaction lab spec.
        </TypographyMuted>
      </section>

      <section className="space-y-3">
        <TypographyH2 className="text-lg font-semibold">Placeholder routes</TypographyH2>
        <TypographyMuted>
          Use the sidebar for the first planned areas. Each page lists coverage to build later;
          there is no interactive behaviour yet.
        </TypographyMuted>
      </section>
    </div>
  );
}
