import Link from "next/link";

import {
  TypographyH1,
  TypographyH2,
  TypographyInlineCode,
  TypographyList,
  TypographyMuted,
} from "@/components/typography";
import { ROUTES } from "@/lib/config/routes";

export const metadata = {
  title: "Route lab",
  description: "Development sandbox for full pages, routes, and flow states.",
};

export default function RouteLabOverviewPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <TypographyMuted className="text-xs font-medium tracking-wide uppercase">
          Development only
        </TypographyMuted>
        <TypographyH1 className="text-3xl font-semibold">Route lab</TypographyH1>
        <TypographyMuted className="max-w-2xl leading-relaxed">
          Landing page for the route lab: full page, route, layout, and flow development without
          JWT, organisation resolution, or a live CMS. Scenarios use fixtures and query parameters.
          Use{" "}
          <Link
            href={ROUTES.sandbox}
            className="text-foreground font-semibold underline-offset-4 hover:underline"
          >
            Sandbox portal
          </Link>{" "}
          in the sidebar (or open{" "}
          <Link href={ROUTES.sandbox} className="underline-offset-4 hover:underline">
            {ROUTES.sandbox}
          </Link>
          ) to switch tools; use <strong className="text-foreground">Route lab screens</strong> for
          individual scenarios.
        </TypographyMuted>
      </header>

      <section className="space-y-3">
        <TypographyH2 className="text-lg font-semibold">Purpose split</TypographyH2>
        <TypographyList className="text-muted-foreground list-inside space-y-2">
          <li>
            <Link href={ROUTES.kitchenSink} className="text-foreground font-medium hover:underline">
              Kitchen sink
            </Link>{" "}
            — isolated components, primitives, and approved UI patterns.
          </li>
          <li>
            <strong className="text-foreground">Route lab</strong> — whole screens, shell
            composition, and route-state simulation.
          </li>
          <li>
            <Link
              href={ROUTES.interactionLab}
              className="text-foreground font-medium hover:underline"
            >
              Interaction lab
            </Link>{" "}
            — stateful interactions, async flows, and transitions (placeholders until built).
          </li>
          <li>
            <Link href={ROUTES.dataLab} className="text-foreground font-medium hover:underline">
              Data lab
            </Link>{" "}
            — CMS-backed selects, lists, and form patterns via the BFF.
          </li>
        </TypographyList>
      </section>

      <section className="space-y-3">
        <TypographyH2 className="text-lg font-semibold">Access</TypographyH2>
        <TypographyMuted>
          Everything under <TypographyInlineCode>{ROUTES.sandbox}</TypographyInlineCode> requires{" "}
          <TypographyInlineCode>NEXT_PUBLIC_ENABLE_DEV_SANDBOX=true</TypographyInlineCode> (literal
          string). When disabled, those routes return 404.
        </TypographyMuted>
      </section>

      <section className="space-y-3">
        <TypographyH2 className="text-lg font-semibold">Start here</TypographyH2>
        <TypographyMuted>
          Under <strong className="text-foreground">Route lab screens</strong>, open a page, then
          append <TypographyInlineCode>?state=…</TypographyInlineCode> or{" "}
          <TypographyInlineCode>?mode=…</TypographyInlineCode> where supported. New sandbox tools
          and lab routes can be registered in{" "}
          <TypographyInlineCode>src/lib/dev-sandbox-nav.ts</TypographyInlineCode>. Season routes now
          include a fixed ID walkthrough under{" "}
          <TypographyInlineCode>/sandbox/route-lab/season/575/*</TypographyInlineCode> for
          data-fetch scope validation.
        </TypographyMuted>
      </section>
    </div>
  );
}
