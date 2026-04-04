import { TypographyH2, TypographyH3, TypographyMuted } from "@/components/typography";
import { Section } from "@/components/ui/container";
import {
  FeedbackCardSoft,
  FeedbackCardStrong,
  FeedbackCardTinted,
  type FeedbackCardKind,
  type FeedbackCardVisualVariant,
} from "@/components/ui/feedback-card";

type FeedbackExample = {
  kind: FeedbackCardKind;
  label: string;
  title: string;
  description: string;
  primaryCta: string;
  secondaryCta?: string;
  metadata?: string;
  showDismiss?: boolean;
};

const EXAMPLES: FeedbackExample[] = [
  {
    kind: "info",
    label: "Info",
    title: "Complete your organisation profile",
    description:
      "Add your business details, branding, and contact settings to unlock the full onboarding experience.",
    primaryCta: "Continue setup",
    metadata: "Last synced 8 minutes ago",
    showDismiss: true,
  },
  {
    kind: "success",
    label: "Success",
    title: "Brand assets uploaded",
    description:
      "Your logo, colors, and primary brand details have been saved successfully and are ready to use across the platform.",
    primaryCta: "View branding",
  },
  {
    kind: "warning",
    label: "Warning",
    title: "Two team members still need invites",
    description:
      "Some members of your organisation have not yet been invited, which may delay setup and collaboration.",
    primaryCta: "Manage invites",
    metadata: "2 items affected",
  },
  {
    kind: "error",
    label: "Error",
    title: "Payment method failed",
    description:
      "Your current billing method could not be processed. Update your payment details to avoid interruption.",
    primaryCta: "Update billing",
  },
  {
    kind: "critical",
    label: "Critical",
    title: "Publishing is currently blocked",
    description:
      "Your organisation cannot publish content until account verification is completed. Please review your account requirements.",
    primaryCta: "Review account",
    secondaryCta: "Contact support",
  },
  {
    kind: "premium",
    label: "Premium",
    title: "Unlock advanced reporting",
    description:
      "Upgrade your plan to access analytics, exports, trend reporting, and deeper organisation insights.",
    primaryCta: "Compare plans",
  },
];

const VARIANT_COMPONENT: Record<
  FeedbackCardVisualVariant,
  typeof FeedbackCardSoft | typeof FeedbackCardTinted | typeof FeedbackCardStrong
> = {
  soft: FeedbackCardSoft,
  tinted: FeedbackCardTinted,
  strong: FeedbackCardStrong,
};

function VariantBlock({
  variant,
  title,
  description,
}: {
  variant: FeedbackCardVisualVariant;
  title: string;
  description: string;
}) {
  const CardVariant = VARIANT_COMPONENT[variant];

  return (
    <div className="space-y-4">
      <div>
        <TypographyH3 className="text-base font-semibold">{title}</TypographyH3>
        <TypographyMuted className="mt-1 max-w-3xl text-sm">{description}</TypographyMuted>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {EXAMPLES.map((ex) => (
          <CardVariant
            key={`${variant}-${ex.kind}`}
            kind={ex.kind}
            label={ex.label}
            title={ex.title}
            description={ex.description}
            primaryCta={ex.primaryCta}
            {...(ex.secondaryCta !== undefined ? { secondaryCta: ex.secondaryCta } : {})}
            {...(ex.metadata !== undefined ? { metadata: ex.metadata } : {})}
            {...(ex.showDismiss === true ? { showDismiss: true } : {})}
          />
        ))}
      </div>
    </div>
  );
}

export function FeedbackCardsSection() {
  return (
    <Section spacing="none">
      <div className="mb-8">
        <TypographyH2 className="text-xl font-semibold">Feedback cards</TypographyH2>
        <TypographyMuted className="mt-1 max-w-3xl">
          Persistent, structured notices for ongoing product states—unlike toasts, they stay on the
          page until the user understands, acts, or resolves them. Same card radius and typography
          as standard cards; semantic tinting stays restrained. Implemented as{" "}
          <span className="font-mono text-xs">@/components/ui/feedback-card</span>.
        </TypographyMuted>
      </div>

      <div className="space-y-14">
        <VariantBlock
          variant="soft"
          title="Variant A — Soft semantic"
          description="Mostly standard surface with a subtle state border, tinted icon chip, and restrained actions. Baseline for reuse."
        />
        <VariantBlock
          variant="tinted"
          title="Variant B — Tinted surface"
          description="Light full-card tint per state to test clarity without looking like a banner or alert strip."
        />
        <VariantBlock
          variant="strong"
          title="Variant C — Strong action"
          description="Slightly stronger hierarchy and footer separation for errors, blockers, and premium gates—without loud chrome."
        />
      </div>
    </Section>
  );
}
