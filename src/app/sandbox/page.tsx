import { PublicShellContainer } from "@/components/auth/layout";
import { TypographyH1, TypographyInlineCode, TypographyMuted } from "@/components/typography";
import { ROUTES } from "@/lib/config/routes";

import { SandboxPortalGrid } from "./sandbox-portal-grid";

export const metadata = {
  title: "Sandbox",
  description:
    "Development sandbox portal — route lab, kitchen sink, interaction lab, and future tools.",
};

export default function SandboxPortalPage() {
  return (
    <PublicShellContainer className="py-8 md:py-12">
      <div className="space-y-10">
        <header className="space-y-3">
          <TypographyMuted className="text-xs font-medium tracking-wide uppercase">
            Development only
          </TypographyMuted>
          <TypographyH1 className="text-3xl font-semibold">Sandbox portal</TypographyH1>
          <TypographyMuted className="max-w-2xl leading-relaxed">
            All URLs under <TypographyInlineCode>{ROUTES.sandbox}</TypographyInlineCode> are hidden
            unless <TypographyInlineCode>NEXT_PUBLIC_ENABLE_DEV_SANDBOX=true</TypographyInlineCode>.
            Use the tiles below to open tools; register new areas in{" "}
            <TypographyInlineCode>src/lib/dev-sandbox-nav.ts</TypographyInlineCode>.
          </TypographyMuted>
        </header>

        <SandboxPortalGrid />
      </div>
    </PublicShellContainer>
  );
}
