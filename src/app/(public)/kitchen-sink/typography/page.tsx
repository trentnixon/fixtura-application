import {
  TypographyH1,
  TypographyH2,
  TypographyH3,
  TypographyH4,
  TypographyH5,
  TypographyP,
  TypographyMuted,
  TypographyBlockquote,
} from "@/components/typography";

export default function TypographyPage() {
  return (
    <div className="space-y-12">
      <header className="border-border border-b pb-6">
        <TypographyH1 className="text-3xl">Typography System</TypographyH1>
        <p className="text-muted-foreground mt-2 max-w-2xl font-sans text-lg">
          We use <strong>Plus Jakarta Sans</strong> for headings to create a modern, structured
          feel, and <strong>Inter</strong> for body text to maximize readability.
        </p>
      </header>

      <section>
        <h2 className="text-muted-foreground border-border mb-6 border-b pb-2 text-sm font-semibold tracking-wider uppercase">
          Headings (Plus Jakarta Sans)
        </h2>
        <div className="space-y-8">
          <div>
            <div className="text-muted-foreground mb-1 text-xs">Heading 1 — text-4xl</div>
            <TypographyH1>The quick brown fox jumps over the lazy dog</TypographyH1>
          </div>
          <div>
            <div className="text-muted-foreground mb-1 text-xs">Heading 2 — text-3xl</div>
            <TypographyH2>The quick brown fox jumps over the lazy dog</TypographyH2>
          </div>
          <div>
            <div className="text-muted-foreground mb-1 text-xs">Heading 3 — text-2xl</div>
            <TypographyH3>The quick brown fox jumps over the lazy dog</TypographyH3>
          </div>
          <div>
            <div className="text-muted-foreground mb-1 text-xs">Heading 4 — text-xl</div>
            <TypographyH4>The quick brown fox jumps over the lazy dog</TypographyH4>
          </div>
          <div>
            <div className="text-muted-foreground mb-1 text-xs">Heading 5 — text-lg</div>
            <TypographyH5>The quick brown fox jumps over the lazy dog</TypographyH5>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-muted-foreground border-border mb-6 border-b pb-2 text-sm font-semibold tracking-wider uppercase">
          Body Text (Inter)
        </h2>
        <div className="max-w-3xl space-y-8">
          <div>
            <div className="text-muted-foreground mb-1 text-xs">Standard Paragraph — text-base</div>
            <TypographyP>
              This is standard body text. It utilizes Inter for maximum legibility across different
              viewports and devices. Good typography is a critical part of the user experience,
              ensuring that information is clear, consistent, and easy to consume without causing
              eye strain.
            </TypographyP>
          </div>
          <div>
            <div className="text-muted-foreground mb-1 text-xs">Small Print — text-sm muted</div>
            <TypographyMuted>
              This is slightly smaller text, typically used for secondary information, metadata, or
              helper text beneath inputs. It still remains readable while stepping back visually in
              the hierarchy.
            </TypographyMuted>
          </div>
          <div>
            <div className="text-muted-foreground mb-1 text-xs">Blockquote</div>
            <TypographyBlockquote>
              &ldquo;Typography is the detail and the presentation of a story. It represents the
              voice of an orphan, the sigh of an old man, or the commanding shout of a
              leader.&rdquo;
            </TypographyBlockquote>
          </div>
        </div>
      </section>
    </div>
  );
}
