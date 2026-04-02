export default function TypographyPage() {
  return (
    <div className="space-y-12">
      <header className="border-border border-b pb-6">
        <h1 className="font-heading text-foreground text-3xl font-bold tracking-tight">
          Typography System
        </h1>
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
            <div className="text-muted-foreground mb-1 text-xs">Heading 1 - text-4xl</div>
            <h1 className="font-heading text-foreground text-4xl font-bold tracking-tight">
              The quick brown fox jumps over the lazy dog
            </h1>
          </div>
          <div>
            <div className="text-muted-foreground mb-1 text-xs">Heading 2 - text-3xl</div>
            <h2 className="font-heading text-foreground text-3xl font-semibold tracking-tight">
              The quick brown fox jumps over the lazy dog
            </h2>
          </div>
          <div>
            <div className="text-muted-foreground mb-1 text-xs">Heading 3 - text-2xl</div>
            <h3 className="font-heading text-foreground text-2xl font-semibold tracking-tight">
              The quick brown fox jumps over the lazy dog
            </h3>
          </div>
          <div>
            <div className="text-muted-foreground mb-1 text-xs">Heading 4 - text-xl</div>
            <h4 className="font-heading text-foreground text-xl font-medium tracking-tight">
              The quick brown fox jumps over the lazy dog
            </h4>
          </div>
          <div>
            <div className="text-muted-foreground mb-1 text-xs">Heading 5 - text-lg</div>
            <h5 className="font-heading text-foreground text-lg font-medium">
              The quick brown fox jumps over the lazy dog
            </h5>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-muted-foreground border-border mb-6 border-b pb-2 text-sm font-semibold tracking-wider uppercase">
          Body Text (Inter)
        </h2>
        <div className="max-w-3xl space-y-8">
          <div>
            <div className="text-muted-foreground mb-1 text-xs">Standard Paragraph - text-base</div>
            <p className="text-foreground font-sans text-base leading-7">
              This is standard body text. It utilizes Inter for maximum legibility across different
              viewports and devices. Good typography is a critical part of the user experience,
              ensuring that information is clear, consistent, and easy to consume without causing
              eye strain.
            </p>
          </div>
          <div>
            <div className="text-muted-foreground mb-1 text-xs">Small Print - text-sm</div>
            <p className="text-muted-foreground font-sans text-sm leading-6">
              This is slightly smaller text, typically used for secondary information, metadata, or
              helper text beneath inputs. It still remains readable while stepping back visually in
              the hierarchy.
            </p>
          </div>
          <div>
            <div className="text-muted-foreground mb-1 text-xs">Blockquote</div>
            <blockquote className="border-primary text-muted-foreground border-l-4 py-1 pl-4 font-sans text-lg italic">
              "Typography is the detail and the presentation of a story. It represents the voice of
              an orphan, the sigh of an old man, or the commanding shout of a leader."
            </blockquote>
          </div>
        </div>
      </section>
    </div>
  );
}
