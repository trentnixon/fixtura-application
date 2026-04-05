import { PageHeader } from "@/components/ui/container";

import { ActionGroupsSection } from "./_sections/action-groups";
import { BaseVariantsSection } from "./_sections/base-variants";
import { BrandExtensionsSection } from "./_sections/brand-extensions";
import { ContextualUsageSection } from "./_sections/contextual";
import { ExperimentalSection } from "./_sections/experimental";
import { IconsA11ySection } from "./_sections/icons-a11y";
import { ButtonsIntro } from "./_sections/intro";
import { SizesSection } from "./_sections/sizes";
import { StatesSection } from "./_sections/states";

export default function ButtonsPage() {
  return (
    <div className="space-y-12 pb-20">
      <PageHeader
        title="Buttons"
        description="Buttons trigger actions and navigation. This page is the reference for hierarchy, variants, sizes, states, and composition in the members area — extend the shared Button component rather than one-off styles in features."
      />

      <div className="space-y-16">
        <ButtonsIntro />
        <BaseVariantsSection />
        <BrandExtensionsSection />
        <SizesSection />
        <StatesSection />
        <IconsA11ySection />
        <ContextualUsageSection />
        <ActionGroupsSection />
        <ExperimentalSection />
      </div>
    </div>
  );
}
