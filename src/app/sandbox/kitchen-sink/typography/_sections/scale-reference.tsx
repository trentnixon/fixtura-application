import {
  TypographyH1,
  TypographyH2,
  TypographyH3,
  TypographyH4,
  TypographyH5,
  TypographyMuted,
  TypographyP,
  TypographyBlockquote,
} from "@/components/typography";
import { Section } from "@/components/ui/container";

/** Legacy scale primitives (H1–H5). Prefer semantic components for new UI when the role matches. */
export function ScaleReferenceSection() {
  return (
    <Section spacing="none">
      <TypographyH2 className="text-muted-foreground border-border mb-6 border-b pb-2 text-sm font-semibold tracking-wider uppercase">
        Scale reference (H1–H5)
      </TypographyH2>
      <div className="space-y-8">
        <div>
          <TypographyMuted className="mb-1 text-xs">Heading 1 — text-4xl</TypographyMuted>
          <TypographyH1>The quick brown fox jumps over the lazy dog</TypographyH1>
        </div>
        <div>
          <TypographyMuted className="mb-1 text-xs">Heading 2 — text-3xl</TypographyMuted>
          <TypographyH2>The quick brown fox jumps over the lazy dog</TypographyH2>
        </div>
        <div>
          <TypographyMuted className="mb-1 text-xs">Heading 3 — text-2xl</TypographyMuted>
          <TypographyH3>The quick brown fox jumps over the lazy dog</TypographyH3>
        </div>
        <div>
          <TypographyMuted className="mb-1 text-xs">Heading 4 — text-xl</TypographyMuted>
          <TypographyH4>The quick brown fox jumps over the lazy dog</TypographyH4>
        </div>
        <div>
          <TypographyMuted className="mb-1 text-xs">Heading 5 — text-lg</TypographyMuted>
          <TypographyH5>The quick brown fox jumps over the lazy dog</TypographyH5>
        </div>
        <div>
          <TypographyMuted className="mb-1 text-xs">Standard paragraph</TypographyMuted>
          <TypographyP>
            Standard body copy uses Inter. Keep scale headings for document-like hierarchy; use
            semantic components (page title, card title, etc.) for application shells.
          </TypographyP>
        </div>
        <div>
          <TypographyMuted className="mb-1 text-xs">Blockquote</TypographyMuted>
          <TypographyBlockquote>
            &ldquo;Scale primitives remain supported for backwards compatibility and simple
            docs.&rdquo;
          </TypographyBlockquote>
        </div>
      </div>
    </Section>
  );
}
