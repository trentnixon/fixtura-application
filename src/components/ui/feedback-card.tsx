import {
  AlertTriangle,
  CircleAlert,
  CircleCheck,
  Info,
  ShieldAlert,
  Sparkles,
  X,
  type LucideIcon,
} from "lucide-react";

import {
  TypographyCardDescription,
  TypographyCardTitle,
  TypographyCaption,
  TypographyOverline,
} from "@/components/typography";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type FeedbackCardKind = "info" | "success" | "warning" | "error" | "critical" | "premium";

export type FeedbackCardVisualVariant = "soft" | "tinted" | "strong";

const KIND_ICONS: Record<FeedbackCardKind, LucideIcon> = {
  info: Info,
  success: CircleCheck,
  warning: AlertTriangle,
  error: CircleAlert,
  critical: ShieldAlert,
  premium: Sparkles,
};

function kindAccent(kind: FeedbackCardKind): {
  iconText: string;
  chip: string;
  borderLeft: string;
  cardBorder: string;
  tintedBg: string;
} {
  switch (kind) {
    case "info":
      return {
        iconText: "text-primary",
        chip: "bg-primary/10 text-primary",
        borderLeft: "border-l-primary/50",
        cardBorder: "border-primary/15",
        tintedBg: "bg-primary/[0.06]",
      };
    case "success":
      return {
        iconText: "text-success",
        chip: "bg-success/10 text-success",
        borderLeft: "border-l-success/50",
        cardBorder: "border-success/15",
        tintedBg: "bg-success/[0.07]",
      };
    case "warning":
      return {
        iconText: "text-warning",
        chip: "bg-warning/10 text-warning",
        borderLeft: "border-l-warning/55",
        cardBorder: "border-warning/20",
        tintedBg: "bg-warning/[0.08]",
      };
    case "error":
      return {
        iconText: "text-destructive",
        chip: "bg-destructive/10 text-destructive",
        borderLeft: "border-l-destructive/50",
        cardBorder: "border-destructive/15",
        tintedBg: "bg-destructive/[0.06]",
      };
    case "critical":
      return {
        iconText: "text-destructive",
        chip: "bg-destructive/15 text-destructive",
        borderLeft: "border-l-destructive",
        cardBorder: "border-destructive/25",
        tintedBg: "bg-destructive/[0.09]",
      };
    case "premium":
      return {
        iconText: "text-primary",
        chip: "bg-primary/12 text-primary ring-1 ring-primary/15",
        borderLeft: "border-l-primary/60",
        cardBorder: "border-primary/25",
        tintedBg: "bg-primary/[0.08]",
      };
  }
}

function variantCardClass(
  kind: FeedbackCardKind,
  visualVariant: FeedbackCardVisualVariant,
): string {
  const a = kindAccent(kind);
  switch (visualVariant) {
    case "soft":
      return cn("bg-card border-l-4 shadow-sm", a.borderLeft, "border-y border-r border-border/80");
    case "tinted":
      return cn("border shadow-sm", a.cardBorder, a.tintedBg);
    case "strong":
      return cn(
        "bg-card border-l-[5px] shadow-md",
        a.borderLeft,
        "border-y border-r border-border/70",
      );
  }
}

function variantFooterClass(visualVariant: FeedbackCardVisualVariant): string {
  if (visualVariant === "strong") {
    return "bg-muted/25 border-border/80 flex-col gap-2 border-t pt-6 sm:flex-row sm:items-center sm:justify-end";
  }
  return "flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end";
}

export type FeedbackCardProps = {
  kind: FeedbackCardKind;
  visualVariant: FeedbackCardVisualVariant;
  label: string;
  title: string;
  description: string;
  primaryCta: string;
  secondaryCta?: string;
  metadata?: string;
  showDismiss?: boolean;
  onDismiss?: () => void;
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
  className?: string;
  /** Override default icon for this kind */
  icon?: LucideIcon;
};

export function FeedbackCard({
  kind,
  visualVariant,
  label,
  title,
  description,
  primaryCta,
  secondaryCta,
  metadata,
  showDismiss,
  onDismiss,
  onPrimaryAction,
  onSecondaryAction,
  className,
  icon: IconOverride,
}: FeedbackCardProps) {
  const Icon = IconOverride ?? KIND_ICONS[kind];
  const accent = kindAccent(kind);
  const footerClass = variantFooterClass(visualVariant);

  const primaryBtnVariant =
    kind === "premium"
      ? "default"
      : kind === "critical" || kind === "error"
        ? "destructive"
        : "brand";

  return (
    <Card className={cn("h-full gap-0 py-0", variantCardClass(kind, visualVariant), className)}>
      <CardHeader className="gap-3 px-6 pt-6 pb-2">
        <div className="flex gap-3">
          <div
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-lg",
              accent.chip,
            )}
            aria-hidden
          >
            <Icon className={cn("size-5", accent.iconText)} />
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <TypographyOverline className="block">{label}</TypographyOverline>
            <TypographyCardTitle as="div" className="text-base leading-snug">
              {title}
            </TypographyCardTitle>
          </div>
          {showDismiss ? (
            <CardAction>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-muted-foreground -mt-1 -mr-1"
                onClick={onDismiss}
              >
                <X className="size-4" />
                <span className="sr-only">Dismiss</span>
              </Button>
            </CardAction>
          ) : null}
        </div>
        <TypographyCardDescription className="leading-relaxed">
          {description}
        </TypographyCardDescription>
      </CardHeader>

      {metadata ? (
        <CardContent className="px-6 pt-0 pb-2">
          <TypographyCaption className="font-medium">{metadata}</TypographyCaption>
        </CardContent>
      ) : null}

      <CardFooter className={cn("mt-auto px-6 pb-6", footerClass)}>
        <Button
          type="button"
          variant={primaryBtnVariant === "brand" ? "brand" : primaryBtnVariant}
          className={cn(visualVariant === "strong" && secondaryCta ? "min-w-36" : "")}
          onClick={onPrimaryAction}
        >
          {primaryCta}
        </Button>
        {secondaryCta ? (
          <Button
            type="button"
            variant={visualVariant === "strong" ? "outline" : "ghost"}
            size="default"
            onClick={onSecondaryAction}
          >
            {secondaryCta}
          </Button>
        ) : null}
      </CardFooter>
    </Card>
  );
}

type FeedbackCardVariantProps = Omit<FeedbackCardProps, "visualVariant">;

export function FeedbackCardSoft(props: FeedbackCardVariantProps) {
  return <FeedbackCard {...props} visualVariant="soft" />;
}

export function FeedbackCardTinted(props: FeedbackCardVariantProps) {
  return <FeedbackCard {...props} visualVariant="tinted" />;
}

export function FeedbackCardStrong(props: FeedbackCardVariantProps) {
  return <FeedbackCard {...props} visualVariant="strong" />;
}
