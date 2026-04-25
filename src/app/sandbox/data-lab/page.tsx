import Link from "next/link";

import {
  TypographyH1,
  TypographyH2,
  TypographyInlineCode,
  TypographyMuted,
} from "@/components/typography";
import { ROUTES } from "@/lib/config/routes";

export const metadata = {
  title: "Data lab",
  description:
    "Development sandbox for reusable selects, lists, and form patterns backed by CMS data through the BFF.",
};

export default function DataLabOverviewPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <TypographyMuted className="text-xs font-medium tracking-wide uppercase">
          Development only
        </TypographyMuted>
        <TypographyH1 className="text-3xl font-semibold">Data lab</TypographyH1>
        <TypographyMuted className="max-w-2xl leading-relaxed">
          This area is for prototyping and hardening components that load and mutate data through
          our Next.js BFF to Strapi—dropdowns, multi-selects, checkbox groups, virtualised lists,
          and similar patterns. Use{" "}
          <Link href={ROUTES.kitchenSink} className="text-foreground font-medium hover:underline">
            Kitchen sink
          </Link>{" "}
          for static primitives and{" "}
          <Link
            href={ROUTES.interactionLab}
            className="text-foreground font-medium hover:underline"
          >
            Interaction lab
          </Link>{" "}
          for behaviour, async choreography, and non-data UX experiments.
        </TypographyMuted>
      </header>

      <section className="space-y-3">
        <TypographyH2 className="text-lg font-semibold">Routes</TypographyH2>
        <TypographyMuted className="leading-relaxed">
          Each scenario will get a dedicated URL under{" "}
          <TypographyInlineCode>{ROUTES.dataLab}</TypographyInlineCode>. Pages call the relevant app{" "}
          <TypographyInlineCode>/api/…</TypographyInlineCode> routes (same contracts as production)
          so components stay reusable across the site.
        </TypographyMuted>
      </section>

      <section className="space-y-3">
        <TypographyH2 className="text-lg font-semibold">Scenarios</TypographyH2>
        <TypographyMuted>
          See the sidebar for live routes. Examples:{" "}
          <Link
            href={`${ROUTES.dataLab}/template-categories/list-for-selection`}
            className="text-foreground font-medium hover:underline"
          >
            Template categories — list for selection
          </Link>
          ,{" "}
          <Link
            href={`${ROUTES.dataLab}/assets/list-for-selection`}
            className="text-foreground font-medium hover:underline"
          >
            Assets — list for selection
          </Link>
          ,{" "}
          <Link
            href={`${ROUTES.dataLab}/template-gradients/ui`}
            className="text-foreground font-medium hover:underline"
          >
            Template gradients — UI endpoint
          </Link>
          ,{" "}
          <Link
            href={`${ROUTES.dataLab}/template-images/ui`}
            className="text-foreground font-medium hover:underline"
          >
            Template images — UI endpoint
          </Link>
          ,{" "}
          <Link
            href={`${ROUTES.dataLab}/template-modes/ui`}
            className="text-foreground font-medium hover:underline"
          >
            Template modes — UI endpoint
          </Link>
          ,{" "}
          <Link
            href={`${ROUTES.dataLab}/template-noises/ui`}
            className="text-foreground font-medium hover:underline"
          >
            Template noises — UI endpoint
          </Link>
          ,{" "}
          <Link
            href={`${ROUTES.dataLab}/template-palettes/ui`}
            className="text-foreground font-medium hover:underline"
          >
            Template palettes — UI endpoint
          </Link>
          ,{" "}
          <Link
            href={`${ROUTES.dataLab}/template-particles/ui`}
            className="text-foreground font-medium hover:underline"
          >
            Template particles — UI endpoint
          </Link>
          ,{" "}
          <Link
            href={`${ROUTES.dataLab}/template-patterns/ui`}
            className="text-foreground font-medium hover:underline"
          >
            Template patterns - UI endpoint
          </Link>
          ,{" "}
          <Link
            href={`${ROUTES.dataLab}/template-textures/ui`}
            className="text-foreground font-medium hover:underline"
          >
            Template textures - UI endpoint
          </Link>
          ,{" "}
          <Link
            href={`${ROUTES.dataLab}/template-videos/ui`}
            className="text-foreground font-medium hover:underline"
          >
            Template videos - UI endpoint
          </Link>
          .
        </TypographyMuted>
      </section>
    </div>
  );
}
