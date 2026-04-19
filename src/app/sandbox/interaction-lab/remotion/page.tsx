import { TypographyH1, TypographyInlineCode, TypographyMuted } from "@/components/typography";

import { RemotionSandboxPanel } from "./_components/remotion-sandbox-panel";

export const metadata = {
  title: "Remotion preview - Interaction lab",
  description:
    "Development sandbox for the vendored Fixtura Remotion preview bundle and Remotion player.",
};

export default function RemotionSandboxPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <TypographyMuted className="text-xs font-medium tracking-wide uppercase">
          Remotion
        </TypographyMuted>
        <TypographyH1 className="text-3xl font-semibold">Remotion preview</TypographyH1>
        <TypographyMuted className="max-w-2xl leading-relaxed">
          Renders bundled Cricket sandbox JSON through{" "}
          <TypographyInlineCode>FixturaTemplateScene</TypographyInlineCode> from the vendored{" "}
          <TypographyInlineCode>preview</TypographyInlineCode> bundle. Template preview follows the
          selected CMS template category (category <TypographyInlineCode>slug</TypographyInlineCode>{" "}
          → Remotion appearance; sign in so categories load). Composition comes from{" "}
          <TypographyInlineCode>Image Options</TypographyInlineCode> assets: each asset&apos;s{" "}
          <TypographyInlineCode>CompositionID</TypographyInlineCode> selects which sandbox dataset
          and composition to play (same picker as Data lab → assets list for selection).
        </TypographyMuted>
      </header>
      <RemotionSandboxPanel />
    </div>
  );
}
