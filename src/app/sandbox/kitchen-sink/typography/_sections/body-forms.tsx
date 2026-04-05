import {
  TypographyBodyLarge,
  TypographyBodySmall,
  TypographyCaption,
  TypographyErrorText,
  TypographyFieldsetLegend,
  TypographyFinePrint,
  TypographyH2,
  TypographyHelperText,
  TypographyLabel,
  TypographyLabelRequired,
  TypographyMuted,
  TypographySuccessText,
} from "@/components/typography";
import { Section } from "@/components/ui/container";

export function BodyFormsSection() {
  return (
    <Section spacing="none">
      <TypographyH2 className="text-muted-foreground border-border mb-6 border-b pb-2 text-sm font-semibold tracking-wider uppercase">
        Body copy & forms
      </TypographyH2>
      <div className="max-w-3xl space-y-8">
        <div>
          <TypographyMuted className="mb-1 text-xs">Body large</TypographyMuted>
          <TypographyBodyLarge>
            Slightly larger descriptive copy for onboarding intros and key summaries.
          </TypographyBodyLarge>
        </div>
        <div>
          <TypographyMuted className="mb-1 text-xs">Body small</TypographyMuted>
          <TypographyBodySmall>
            Compact supporting copy for dense layouts. Not the same as muted paragraph — tone is
            neutral unless you add <code className="text-xs">tone=&quot;muted&quot;</code>.
          </TypographyBodySmall>
        </div>
        <div>
          <TypographyMuted className="mb-1 text-xs">Caption / fine print</TypographyMuted>
          <TypographyCaption className="block">
            Captions for charts, images, and supplementary metadata.
          </TypographyCaption>
          <TypographyFinePrint className="mt-2 block">
            Fine print for disclaimers; still readable — avoid critical info at this size alone.
          </TypographyFinePrint>
        </div>
        <fieldset className="space-y-4 border-0 p-0">
          <TypographyFieldsetLegend className="mb-2">Delivery</TypographyFieldsetLegend>
          <div className="space-y-2">
            <TypographyLabel htmlFor="ks-email">Email</TypographyLabel>
            <TypographyHelperText id="ks-email-hint">We never send spam.</TypographyHelperText>
            <TypographyErrorText className="hidden" aria-live="polite">
              Example error (hidden in demo).
            </TypographyErrorText>
            <TypographySuccessText className="hidden" aria-live="polite">
              Example success (hidden in demo).
            </TypographySuccessText>
          </div>
          <div className="space-y-2">
            <TypographyLabelRequired htmlFor="ks-name" required>
              Display name
            </TypographyLabelRequired>
            <TypographyHelperText>Shown on shared fixtures.</TypographyHelperText>
          </div>
        </fieldset>
      </div>
    </Section>
  );
}
