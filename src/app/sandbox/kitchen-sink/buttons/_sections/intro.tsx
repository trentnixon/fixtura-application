import { TypographyH2, TypographyMuted } from "@/components/typography";
import { Section } from "@/components/ui/container";

export function ButtonsIntro() {
  return (
    <Section spacing="none">
      <div className="mb-6 space-y-3">
        <TypographyH2 className="text-xl font-semibold">Action hierarchy</TypographyH2>
        <TypographyMuted className="block leading-relaxed">
          Buttons map to a level of importance in a local area (page region, dialog, card, or
          toolbar). Use at most one primary-style action per group. Prefer semantic variants over
          ad-hoc colours; extend the kitchen sink when a new pattern is approved for production.
        </TypographyMuted>
        <ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
          <li>
            <strong className="text-foreground">Level 1 — Primary:</strong>{" "}
            <code className="text-xs">default</code> — main action (Save, Continue, Confirm).
          </li>
          <li>
            <strong className="text-foreground">Level 2 — Secondary:</strong>{" "}
            <code className="text-xs">secondary</code> — important but not dominant (Cancel, Back).
          </li>
          <li>
            <strong className="text-foreground">Level 3 — Tertiary:</strong>{" "}
            <code className="text-xs">outline</code>, <code className="text-xs">ghost</code>,{" "}
            <code className="text-xs">link</code> — optional or low-emphasis actions.
          </li>
          <li>
            <strong className="text-foreground">Level 4 — Destructive:</strong>{" "}
            <code className="text-xs">destructive</code> — irreversible or harmful actions only.
          </li>
          <li>
            <strong className="text-foreground">Level 5 — Accent:</strong>{" "}
            <code className="text-xs">brand</code> (Fixtura teal),{" "}
            <code className="text-xs">accent</code> (promotional / upgrade) — use sparingly; not a
            substitute for destructive.
          </li>
        </ul>
        <TypographyMuted className="block text-xs leading-relaxed">
          <strong className="text-foreground">Migration:</strong> existing feature code can keep
          using <code className="text-xs">className=&quot;w-full&quot;</code> or adopt the{" "}
          <code className="text-xs">fullWidth</code> prop. Use{" "}
          <code className="text-xs">loading</code> for async submits instead of hand-rolled spinners
          where possible.
        </TypographyMuted>
      </div>
    </Section>
  );
}
