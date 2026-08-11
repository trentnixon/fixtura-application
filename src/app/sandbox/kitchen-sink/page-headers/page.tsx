import { PageHeader } from "@/components/ui/container";

import { ActionsHeaderSection } from "./_sections/actions";
import { BackHeaderSection } from "./_sections/back";
import { BasicHeaderSection } from "./_sections/basic";
import { BrandMarkHeaderSection } from "./_sections/brand-mark";
import { BreadcrumbsHeaderSection } from "./_sections/breadcrumbs";
import { EyebrowHeaderSection } from "./_sections/eyebrow";
import { PageHeadersIntro } from "./_sections/intro";
import { MetaHeaderSection } from "./_sections/meta";
import { SearchHeaderSection } from "./_sections/search";
import { StatsHeaderSection } from "./_sections/stats";
import { TabsHeaderSection } from "./_sections/tabs";

export default function PageHeadersPage() {
  return (
    <div className="space-y-12 pb-20">
      <PageHeader
        title="Page Headers"
        description="Reference for the title section that sits at the top of every members-area route. Variants compose title, subtitle, eyebrow, breadcrumbs, actions, metadata, sub-nav, and inline stats."
      />

      <div className="space-y-16">
        <PageHeadersIntro />
        <BasicHeaderSection />
        <BrandMarkHeaderSection />
        <EyebrowHeaderSection />
        <BreadcrumbsHeaderSection />
        <ActionsHeaderSection />
        <MetaHeaderSection />
        <TabsHeaderSection />
        <StatsHeaderSection />
        <BackHeaderSection />
        <SearchHeaderSection />
      </div>
    </div>
  );
}
