// Typography components — barrel export
// Usage: import { TypographyH1, TypographyP, ... } from "@/components/typography"

export {
  TypographyBase,
  typographyBaseVariants,
  type TypographyBaseProps,
  type TypographyFont,
  type TypographyTone,
} from "./base";

export {
  TypographyDisplay,
  TypographyPageTitle,
  TypographyPageDescription,
  TypographySectionTitle,
  TypographySectionDescription,
  TypographySubsectionTitle,
  TypographyCardTitle,
  TypographyCardDescription,
  TypographyEyebrow,
  TypographyOverline,
} from "./shell-hierarchy";

export {
  TypographyBodyLarge,
  TypographyBodySmall,
  TypographyCaption,
  TypographyFinePrint,
} from "./body-semantic";

export {
  TypographyLabel,
  TypographyLabelRequired,
  type TypographyLabelRequiredProps,
  TypographyHelperText,
  TypographyErrorText,
  TypographySuccessText,
  TypographyFieldsetLegend,
} from "./forms";

export {
  TypographyNavLabel,
  TypographyNavSectionLabel,
  TypographyTabLabel,
  TypographyBreadcrumbText,
} from "./nav-chrome";

export {
  TypographyMetricValue,
  TypographyMetricLabel,
  TypographyMetricChange,
  TypographyDataLabel,
  TypographyDataValue,
  TypographyTableHeading,
  TypographyTableCell,
  TypographyTableMeta,
} from "./data-display";

export {
  TypographyAlertTitle,
  TypographyAlertDescription,
  TypographyStatusLabel,
  TypographyEmptyStateTitle,
  TypographyEmptyStateDescription,
  TypographyDialogTitle,
  TypographyDialogDescription,
  TypographyPopoverTitle,
  TypographyPopoverDescription,
} from "./state-overlay";

export { TypographyH1 } from "./h1";
export { TypographyH2 } from "./h2";
export { TypographyH3 } from "./h3";
export { TypographyH4 } from "./h4";
export { TypographyH5 } from "./h5";
export { TypographyP } from "./p";
/** Default paragraph body — alias of {@link TypographyP}. */
export { TypographyP as TypographyBody } from "./p";
export { TypographyMuted } from "./muted";
export { TypographySmall } from "./small";
export { TypographyLarge } from "./large";
export { TypographyLead } from "./lead";
export { TypographyBlockquote } from "./blockquote";
export { TypographyList } from "./list";
export { TypographyInlineCode, TypographyMonoText, TypographyCodeInline } from "./inline-code";
export { TypographyBrand } from "./brand";
