import { PageHeader } from "@/components/ui/container";

import { BodyFormsSection } from "./_sections/body-forms";
import { DataNavSection } from "./_sections/data-nav";
import { ScaleReferenceSection } from "./_sections/scale-reference";
import { ShellHierarchySection } from "./_sections/shell-hierarchy";
import { StateOverlaysSection } from "./_sections/state-overlays";

export default function TypographyPage() {
  return (
    <div className="space-y-16 pb-20">
      <PageHeader
        title="Typography system"
        description="Plus Jakarta Sans for headings and Inter for body copy. Prefer semantic typography components (page titles, card titles, labels, metrics) over ad hoc Tailwind text utilities in product UI. Scale primitives (H1–H5) remain available for simple hierarchy and backwards compatibility."
      />

      <div className="space-y-16">
        <ShellHierarchySection />
        <BodyFormsSection />
        <DataNavSection />
        <StateOverlaysSection />
        <ScaleReferenceSection />
      </div>
    </div>
  );
}
